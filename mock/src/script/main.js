'use strict';

// マップが読み込み終わったらマーカーをつける
$(window).on('mapLoaded', () => {
  Map.setMarker(Config.defaultPosition);
})

// GoogleMapApiが読み込み完了した時のコールバックメソッド
function initMap() {
  Map.loadMap();
}

/*
 * GoogleMapApiを使用してマップを表示するクラス
 */
class Map {
  static get config() {
    return {
      zoom: 10,
      center: Config.defaultPosition.toObject()
    }
  }

  static loadMap() {
    let $map = $('.map')[0];
    this.eventMapLoaded = $.Event('mapLoaded');

    if (!$map) {
      $(window).trigger(this.eventMapLoaded, { isSucceed: false });
      return;
    }

    let styleOptions = Config.mapStyleOptions;
    let styleTypes = new google.maps.StyledMapType(styleOptions);
    this.api = new google.maps.Map($map, this.config);
    this.api.mapTypes.set('style', styleTypes);
    this.api.setMapTypeId('style');

    $(window).trigger(this.eventMapLoaded, { isSucceed: true });
  }

  static setMarker(position) {
    new google.maps.Marker({
      position: position.toObject(),
      map: this.api
    });
  }
}