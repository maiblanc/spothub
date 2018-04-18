/*
 * 位置情報を表すクラス
 */
class Position {
  get lat() { return this._lat; }
  set lat(lat) { this._lat = lat; }
  get lng() { return this._lng; }
  set lng(lng) { this._lng = lng; }

  constructor(lat, lng) {
    this._lat = lat;
    this._lng = lng;
  }

  static createFromLocation(location) {
    return new Position(location.lat(), location.lng());
  }

  toObject() {
    return { lat: this._lat, lng: this._lng }
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
      position: this._position.toObject(),
      label: this._label,
      icon: this._icon,
      animation: this._animation,
      title: this._title
    };
  }
}

/*
 * スポットを表すクラス 
 */
class Spot {
  get geometry() { return this._geometry; }
  set geometry(geometry) { this._geometry = geometry; }
  get address() { return this._address; }
  set address(address) { this._address = address; }
  get placeId() { return this._placeId; }
  set placeId(placeId) { this._placeId = placeId; }
  get photoUrl() { return this._photoUrl; }
  set photoUrl(photoUrl) { this._photoUrl = photoUrl; }
  get rating() { return this._rating; }
  set rating(rating) { this._rating = rating; }
  get types() { return this._types; }
  set types(types) { this._types = types; }
  get name() { return this._name; }
  set name(name) { this._name = name; }
}