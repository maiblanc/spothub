/*
 * スポット一覧情報を表示するクラス
 */
class DisplaySpotInfo {

  static init() {
    this._count = 0;
    $(window).on('resize', () => {
      let width = $(window).width();

      this.spMode = width <= 991;
      this.switchCollapse();
    });
  }

  static switchCollapse() {
    if (this.spMode) {
      $('.info-detail').removeClass('show');  
      $('.spot-info-toggle').prop('disabled', false);
    } else {
      $('.info-detail').addClass('show');
      $('.spot-info-toggle').prop('disabled', true);
    }
  }

  // スポットを受け取って一覧に表示する
  // jQueryではtemplateタグがサポートされていないのでnative javascriptで書く
  static add(spot) {
    // カウンタを初期化もしくは1を足す
    this._count++;

    // テンプレートを取得し情報をはめこむ
    let template = document.querySelector('.spot-info-template').content.cloneNode(true);
    template.querySelector('.spot-info-wrapper').classList.add('spot-info-instance');
    
    // スポット名
    template.querySelector('.spot-info-heading').innerHTML = spot.name;
    template.querySelector('.spot-info-title').innerHTML = spot.name;
    
    // 写真
    if (spot.photoUrl) {
      template.querySelector('.spot-info-photo').src = spot.photoUrl
    } else {
      template.querySelector('.spot-info-photo').remove();
    }
    
    // タイプ
    // template.querySelector('.spot-info-type').innerHTML = spot.types;
    // template.querySelector('.spot-info-type').remove();

    // 住所
    template.querySelector('.spot-info-address').innerHTML = spot.address;

    // 評価
    if (spot.rating) {
      template.querySelector('.spot-info-rating').innerHTML = spot.rating;
      this.createStars(spot.rating).forEach($star => {
        template.querySelector('.spot-info-rating-wrapper').appendChild($star)
      });
    } else {
      template.querySelector('.spot-info-rating-wrapper').remove();
    }
    
    // アコーディオン制御用のクラスをつける
    template.querySelector('.card-link').href = `.info-detail-${this._count}`;
    template.querySelector('.info-detail').classList.add(`info-detail-${this._count}`);

    // 最初の1個を除いてアコーディオンをはじめから閉じておく
    if (this._alreadyAdded && this.spMode) {
      template.querySelector('.info-detail').classList.remove('show');
    }

    // テンプレートからインスタンスをつくり追加する
    let instance = document.importNode(template, true);
    document.querySelector('.spot-info-container').appendChild(instance);
    if (!this._alreadyAdded) {
      this._alreadyAdded = true;
      $('.spot-none').addClass('hide');
    }
  }

  // 評価の★を生成する
  static createStars(rating) {
    let result = [];
    while (rating >= 1) {
      let $star = document.createElement('i');
      $star.classList.add('fa');
      $star.classList.add('fa-star');
      $star.classList.add('star');
      result.push($star);
      rating -= 1.0;
    }

    if (rating > 0.5) {
      let $starHalf = document.createElement('i');
      $starHalf.classList.add('fa');
      $starHalf.classList.add('fa-star-half');
      $starHalf.classList.add('star');
      result.push($starHalf);
    }

    return result;
  }

  // スポット一覧を削除する
  static clear() {
    $('.spot-info-instance').remove();
    $('.spot-none').removeClass('hide');
    this._alreadyAdded = false;
    this._count = 0;
  }
}