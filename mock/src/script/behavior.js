/*
 * 画面の振る舞いを表すクラス
 */
class Behavior {
  // 初期化メソッド
  static init() {
    // スクロール位置によってマップを折りたたみする
    $(window).on('scroll', () => {
      let positionY = $(window).scrollTop();

      if (positionY > 0)
        Map.collapse()
      else
        Map.expand();
    });

    // 検索ボタンが押されたら検索する
    $('.search-spot-form').submit(() => {
      let searchText = $('.input-search-spot-text').val().trim();
      if (searchText.length > 0) {
        console.log(`スポットを検索します。テキスト：（${searchText}）`)
        Map.searchSpot(searchText, this.onSearchSpotFinished);
      }

      return false;
    });
  }

  // プレイス検索が完了したときのコールバックメソッド
  static onSearchSpotFinished(results, status) {
    if (status === 'ZERO_RESULTS') {
      console.log('テキストに一致するスポットはありませんでした。');
      return;
    } else if (status !== 'OK') {
      console.log('スポットの検索中にエラーが発生しました。');
      return;
    }

    console.log(results);
  }
}