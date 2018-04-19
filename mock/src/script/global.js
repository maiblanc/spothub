/*
 * グローバルレベルで宣言するもの
 */

// GoogleMapAPIからのコールバックメソッド
function initMap() {
  Map.load();
}

// GoogleMapAPIが利用可能になったときに発火されるイベント
$(window).on('mapLoaded', () => {
  // Map.init();
  // Map.addMarker(Constants.defaultPosition);
});