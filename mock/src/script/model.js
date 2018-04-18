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

/*
 * マーカー作成時のオプション
 */
class MarkerOption {
  get map() { return this._map; }
  set map(map) { this._map = map; }
  get position() { return this._position; }
  set position(position) { this._position = position; }
  get label() { return this._label; }
  set label(label) { this._label = label; }
  get icon() { return this._icon; }
  set icon(icon) { this._icon = icon; }
  get animation() { return this._animation; }
  set animation(animation) { this._animation = animation; }
  get title() { return this._title; }
  set title(title) { this._title = title; }

  toObject() {
    return {
      map: this._map,
      position: this._position,
      label: this._label,
      icon: this._icon,
      animation: this._animation,
      title: this._title
    };
  }
}