/*
 * 位置情報を表すクラス
 */
class Position {
  constructor(lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }

  static createFromLocation(location) {
    return new Position(location.lat(), location.lng());
  }

  toObject() {
    return { lat: this.lat, lng: this.lng }
  }
}