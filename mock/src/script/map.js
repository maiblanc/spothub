/*
 * GoogleMapApiを使用してマップを表示するクラス
 */
class Map {
  /* ------------------------------ *
   * 初期化関連
   * ------------------------------ */
  // GoogleMapApiが読み込み完了した際に呼ばれるコールバック
  static load() {
    // マップキャンバスを取得
    this._$map = $('.map');
    let _$mapPrimitive = this._$map[0];
    this.eventMapLoaded = $.Event('mapLoaded');

    if (!this._$map.length) {
      // マップキャンバスが存在しなければ終了
      console.info('ページ内にマップが存在しないため初期化されませんでした。')
      $(window).trigger(this.eventMapLoaded, { isSucceed: false });
      return;
    }

    // APIオブジェクトを初期化
    let styleOptions = Constants.mapStyleOptions;
    let styleTypes = new google.maps.StyledMapType(styleOptions);
    this._mapApi = new google.maps.Map(_$mapPrimitive, Constants.mapConfig);
    this._mapApi.mapTypes.set('style', styleTypes);
    this._mapApi.setMapTypeId('style');

    // ウィンドウサイズが変更された際にマップをリサイズする
    google.maps.event.addDomListener(window, 'resize', () => {
      this.resize();
    });

    // 各種APIを初期化
    this._spots = [];
    this.initGeocoder();
    this.initSearchBox();

    // イベントを発火させる
    console.info('マップの初期化に成功しました。')
    $(window).trigger(this.eventMapLoaded, { isSucceed: true });
  }

  // GeoCoderAPIを初期化
  static initGeocoder() {
    this._geocoderApi = new google.maps.Geocoder();
  }

  // searchBoxAPIを初期化
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

    // 検索窓の条件が変わったときの「イベント
    this._searchBoxApi.addListener('places_changed', () => {
      // 検索条件からプレイスを取得する
      let places = this._searchBoxApi.getPlaces();

      if (places.length == 0)　 {
        // TODO: プレイスが何も取得出来なければエラーを表示
        console.info('プレイスが取得出来ませんでした。');
        return;
      }

      console.log(places);

      // マーカーを全て削除する
      this.clearSpots();

      // プレイスからマーカーを設定する
      this.addSpotsFromPlaces(places);
    });

    $inputFindQuery.on('keyup', event => {
      let $input = $(event.target);
      if ($input.val().length == 0) {
        // 検索欄に何も入力されていなければマーカーをすべて削除する
        this.clearSpots();
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
    this._mapApi.fitBounds(this._bounds);
    this._mapApi.panToBounds(this._bounds);
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
    if (place.photos.length > 1) {
      spot.photoUrl = place.photos[0].getUrl({ maxWidth: 1260 });
    }
    spot.rating = place.rating;
    spot.types = place.types;
    spot.name = place.name;
    console.log(spot)
    return spot;
  }

  // 全てのスポットを削除する
  static clearSpots() {
    if (this._spots && this._spots.length > 0) {
      this._spots.forEach(spot => {
        spot.marker.setMap(null);
      });
      this._spots = [];
    }
  }

  // プレイスからスポットを追加する
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

  static addSpotFromPlace(place) { this.addSpotsFromPlaces([place]); }

  static searchSpot(text, callback) {
    // Geocoder APIを使用してテキストから住所を検索する
    this._geocoderApi.geocode({
      address: text
    }, (results, status) => {
      callback(results, status);
    });
  }
}