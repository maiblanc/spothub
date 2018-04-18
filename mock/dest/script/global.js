/*
 * グローバルレベルで宣言するもの
 */

// GoogleMapAPIからのコールバックメソッド
function initMap() {
  Map.loadMap();
}

// GoogleMapAPIが利用可能になったときに発火されるイベント
$(window).on('mapLoaded', () => {
  Behavior.init();
  // Map.addMarker(Constants.defaultPosition);
});