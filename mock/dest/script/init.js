// GoogleMapApiが読み込み完了した時のコールバックメソッド
function initMap() {
  Map.loadMap();
}

// マップが読み込み終わったらマーカーをつける
$(window).on('mapLoaded', () => {
  Behavior.init();
  Map.addMarker(Config.defaultPosition);
});