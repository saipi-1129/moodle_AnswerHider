let hidden = true; // 初期状態は隠す

// 「答え」を非表示にする関数
function hideAnswer() {
  document.querySelectorAll('.rightanswer, .specificfeedback, .fa-check.text-success,.fa-remove.text-danger,.state, .trafficlight').forEach(function(element) {
    element.style.display = 'none';
  });
}

// 「答え」を表示する関数
function showAnswer() {
  document.querySelectorAll('.rightanswer, .specificfeedback, .fa-check.text-success,.fa-remove.text-danger,.state, .trafficlight').forEach(function(element) {
    element.style.display = 'block';
  });
}

// すべてのラジオボタンをオフにする関数
function uncheckAllRadios() {
  document.querySelectorAll('input[type="radio"]').forEach(function(radio) {
    radio.checked = false;  // ラジオボタンをオフにする
  });
}

// 初期状態で答えを隠す
hideAnswer();
uncheckAllRadios();

// クリックイベントをリスンして、表示/非表示を切り替え
document.body.addEventListener('click', function() {
  if (hidden) {
    showAnswer();
  } else {
    hideAnswer();
  }

  // ラジオボタンをリセット
  uncheckAllRadios();

  hidden = !hidden;
});
