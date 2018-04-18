/*
 * GoogleMapApiを使用してマップを表示するクラス
 */
class Map {
  // GoogleMapApiが読み込み完了した際に呼ばれるコールバック
  static loadMap() {
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

    // 各種APIを初期化
    this._markers = [];
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

      if (places.length == 0)　{
        // TODO: プレイスが何も取得出来なければエラーを表示
        console.info('プレイスが取得出来ませんでした。');
        return;
      }
      // マーカーを全て削除する
      this.clearMarkers();

      // プレイスからマーカーを設定する
      this.setMarkersFromPlaces(places);
    });

    $inputFindQuery.on('keyup', event => {
      let $input = $(event.target);
      if ($input.val().length == 0) {
        // 検索欄に何も入力されていなければマーカーをすべて削除する
        this.clearMarkers();
      }
    });
  }

  // マーカーを追加する
  static addMarker(markerOption) {
    console.log(`マーカーを追加します。（タイトル：${markerOption.title}, 位置：(${markerOption.position.lat}${markerOption.position.lng})）`);
    markerOption.map = this._mapApi;
    markerOption.animation = google.maps.Animation.DROP;
    return new google.maps.Marker(markerOption.toObject());
  }

  // 全てのマーカーを削除する
  static clearMarkers() {
    if (this._markers && this._markers.length > 0) {
      this._markers.forEach(marker => {
        marker.setMap(null);
      });
      this._markers = [];
    }
  }

  // プレイスからマーカーを設定する
  static setMarkersFromPlaces(places) {
    if (places && places.length > 0) {
      let bounds = new google.maps.LatLngBounds();
      places.forEach((place, index) => {
        if (!place.geometry) {
          // プレイスに位置情報がなければマーカーは設定しない
          return;
        }

        // アイコンを作成する
        let icon = {
          url: place.icon,
          size: new google.maps.Size(75, 75),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
          labelOrigin: new google.maps.Point(0, 0)
        };

        // マーカーのオプションを作成する
        let markerOption = new MarkerOption();
        markerOption.position = Position.createFromLocation(place.geometry.location);
        markerOption.title = place.name;
        markerOption.icon = icon;
        markerOption.label = {
          text: `${index + 1}`,
          color: 'tomato',
          fontFamily: 'Arial,sans-serif',
          fontSize: '14px',
          fontWeight: 'bold'
        };

        // マーカーを追加する
        this._markers.push(
          this.addMarker(markerOption)
        );

        // マップの表示領域をピンの位置を覆うように合わせる
        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
        this._mapApi.fitBounds(bounds);
      });
    }
  }

  static setMarkersFromPlace(place) { this.setMarkersFromPlaces([place]); }

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
  static get center() {
    return new Position(this._mapApi.center.lat(), this._mapApi.center.lng());
  }
  static set center(position) {
    this._mapApi.setCenter(position);
  }

  static searchSpot(text, callback) {
    // Geocoder APIを使用してテキストから住所を検索する
    this._geocoderApi.geocode({
      address: text
    }, (results, status) => {
      callback(results, status);
    });
  }
}

class SpotInfo {

}