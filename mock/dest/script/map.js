/*
 * GoogleMapApiを使用してマップを表示するクラス
 */
class Map {
  /* ------------------------------ *
   * 初期化関連
   * ------------------------------ */
  // GoogleMapApiが読み込み完了した際に呼ばれるコールバック
  static load() {
    // APIを初期化
    if (!this.initCore()) {
      return;
    }

    // イベントを初期化
    this.initEvents();

    // 各種APIを初期化
    this._spots = [];
    this.initPlaceService();
    this.initGeocoder();
    this.initSearchBox();

    // イベントを発火させる
    console.info('マップの初期化に成功しました。')
    $(window).trigger(this.eventMapLoaded, { isSucceed: true });

    // スポット一覧用クラスの初期化
    DisplaySpotInfo.init();
  }

  // MapAPIを初期化
  static initCore() {
    // マップキャンバスを取得
    this._$map = $('.map');
    let _$mapPrimitive = this._$map[0];
    this.eventMapLoaded = $.Event('mapLoaded');

    if (!this._$map.length) {
      // マップキャンバスが存在しなければ終了
      console.info('ページ内にマップが存在しないため初期化されませんでした。')
      $(window).trigger(this.eventMapLoaded, { isSucceed: false });
      return false;
    }

    // APIオブジェクトを初期化
    let styleOptions = Constants.mapStyleOptions;
    let styleTypes = new google.maps.StyledMapType(styleOptions);
    this._mapApi = new google.maps.Map(_$mapPrimitive, Constants.mapConfig);
    this._mapApi.mapTypes.set('style', styleTypes);
    this._mapApi.setMapTypeId('style');
    return true;
  }

  // GeoCoderAPIを初期化
  static initGeocoder() {
    this._geocoderApi = new google.maps.Geocoder();
  }

  // SearchBoxAPIを初期化
  static initSearchBox() {
    // SearchBoxAPIを初期化
    let $inputFindQuery = $('.input-find-query');
    let $inputFindQueryPrimitive = $inputFindQuery[0];
    this._searchBoxApi = new google.maps.places.SearchBox($inputFindQueryPrimitive);
    this._mapApi.controls[google.maps.ControlPosition.TOP_LEFT].push($inputFindQueryPrimitive);

    // Mapの表示領域が変わったら検索範囲も変える
    this._mapApi.addListener('bounds_changed', () => {
      this._searchBoxApi.setBounds(this._mapApi.getBounds());
    });

    // 検索窓の条件が変わったときのイベント
    this._searchBoxApi.addListener('places_changed', () => {
      this.onSearchConditionChanged();
    });

    // 検索窓の入力内容が変わったときのイベント
    $inputFindQuery.on('keyup', event => {
      this.onSearchConditionTextChanged(event);
    });
  }

  // PlaceServiceAPIを初期化
  static initPlaceService() {
    this._placeApi = new google.maps.places.PlacesService(this._mapApi);
  }

  // 各種イベントを初期化
  static initEvents() {
    // ウィンドウサイズが変更された際にマップをリサイズする
    google.maps.event.addDomListener(window, 'resize', () => {
      this.resize();
    });

    // スクロール位置によってマップを折りたたみする
    $(window).on('scroll', () => {
      let positionY = $(window).scrollTop();

      if (positionY > 0) {
        this.collapse()
      } else {
        this.expand();
      }
    });
  }

  /* ------------------------------ *
   * 表示関連
   * ------------------------------ */
  // マップキャンバスの大きさを更新する
  static resize() {
    let center = this._mapApi.getCenter();
    google.maps.event.trigger(this._mapApi, "resize");
    this._mapApi.setCenter(center);
    this.refreshBounds();
  }

  // 複数の場所を囲むように表示領域を合わせる
  static fitBounds(places) {
    this._bounds = new google.maps.LatLngBounds();

    places.forEach(place => {
      if (place.geometry.viewport) {
        this._bounds.union(place.geometry.viewport);
      } else {
        this._bounds.extend(place.geometry.location);
      }
    });
    this.refreshBounds();
  }

  // 表示領域を更新する
  static refreshBounds() {
    if (this._bounds) {
      this._mapApi.fitBounds(this._bounds);
      this._mapApi.panToBounds(this._bounds);
    }
  }

  // 描画領域を広げる
  static expand() {
    if (this._$map.hasClass('collapsed'))
      this._$map.removeClass('collapsed');
  }

  // 描画領域をたたむ
  static collapse() {
    if (!this._$map.hasClass('collapsed'))
      this._$map.addClass('collapsed');
  }

  // 地図の中央位置を設定する
  static get center() { return new Position(this._mapApi.center.lat(), this._mapApi.center.lng()); }
  static set center(position) { this._mapApi.setCenter(position); }

  /* ------------------------------ *
   * スポット関連
   * ------------------------------ */
  // マップにスポットを追加する
  static addSpot(place, markerOption) {
    console.log('スポットを追加します。');

    markerOption.map = this._mapApi;
    markerOption.animation = google.maps.Animation.DROP;

    let spot = new Spot();
    spot.marker = new google.maps.Marker(markerOption.toObject());
    spot.geometry = place.geometry;
    spot.address = place.formatted_address;
    spot.placeId = place.place_id;
    if (place.photos) {
      spot.photoUrl = place.photos[0].getUrl({ maxWidth: 1260 });
    }
    spot.rating = place.rating;
    spot.types = place.types;
    spot.name = place.name;
    // console.log(spot)
    return spot;
  }

  // 全てのスポットを削除する
  static clearSpots() {
    if (this._spots && this._spots.length > 0) {
      this._spots.forEach(spot => {
        spot.marker.setMap(null);
      });
      this._spots = [];
      DisplaySpotInfo.clear();
    }
  }

  // プレイスからスポットを追加する(複数)
  static addSpotsFromPlaces(places) {
    if (places && places.length > 0) {

      places.forEach((place, index) => {
        if (!place.geometry) {
          // プレイスに位置情報がなければマーカーは設定しない
          return;
        }

        // マーカーのオプションを作成する
        let markerOption = new MarkerOption();
        markerOption.position = Position.createFromLocation(place.geometry.location);
        markerOption.title = place.name;
        markerOption.label = {
          text: `${index + 1}`,
          fontFamily: 'Arial,sans-serif',
          fontSize: '14px',
          fontWeight: 'bold'
        };

        // マーカーを追加する
        this._spots.push(
          this.addSpot(place, markerOption)
        );

      });
      // マップの表示領域をピンの位置を覆うように合わせる
      this.fitBounds(places);
    }
  }

  // プレイスからスポットを追加する
  static addSpotFromPlace(place) { this.addSpotsFromPlaces([place]); }

  // スポットを検索する
  static searchSpot(text, callback) {
    // Geocoder APIを使用してテキストから住所を検索する
    this._geocoderApi.geocode({
      address: text
    }, (results, status) => {
      callback(results, status);
    });
  }

  // スポット詳細を取得する
  static getSpotDetail(spot) {
    this._placeApi.getDetails({
      placeId: spot.placeId
    }, (place, status) => {
      this.onGetSpotDetailFinished(spot, place, status);
    });
  }
  /* ------------------------------ *
   * イベント関連
   * ------------------------------ */
  // 検索欄のオートコンプリートが変更されたときのコールバックメソッド
  static onSearchConditionChanged() {
    // 検索条件からプレイスを取得する
    let places = this._searchBoxApi.getPlaces();

    if (places.length == 0)　 {
      // TODO: プレイスが何も取得出来なければエラーを表示
      console.info('プレイスが取得出来ませんでした。');
      return;
    }

    // マーカーを全て削除する
    this.clearSpots();

    // プレイスからスポットとマーカーを設定する
    this.addSpotsFromPlaces(places);

    // プレイスの詳細を取得しスポットに設定する
    // this.getSpotDetail();

    // スポットを一覧で表示する
    this._spots.forEach(spot => {
      DisplaySpotInfo.add(spot);
    });
  }

  // 検索欄のテキストが変更されたときのコールバックメソッド
  static onSearchConditionTextChanged(event) {
    let $input = $(event.target);
    if ($input.val().length == 0) {
      // 検索欄に何も入力されていなければマーカーをすべて削除する
      this.clearSpots();
    }
  }

  // プレイス検索が完了したときのコールバックメソッド
  static onSearchSpotFinished(results, status) {
    if (status === 'ZERO_RESULTS') {
      console.log('テキストに一致するスポットはありませんでした。');
      return;
    } else if (status !== 'OK') {
      console.log('スポットの検索中にエラーが発生しました。');
      return;
    }
  }

  static onGetSpotDetailFinished(spot, additionalInfo, status) {
    if (status !== 'OK') {
      console.log('スポットの詳細を取得中にエラーが発生しました。');
      return;
    }

    console.log(additionalInfo);
  }
}