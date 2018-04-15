/*
 * 位置情報を表すクラス
 */
class Position {
  constructor(lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }

  toObject() {
    return { lat: this.lat, lng: this.lng }
  }
}