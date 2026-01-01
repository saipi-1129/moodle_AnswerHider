let hidden = true; // 初期状態は隠す
let isTestMode = false; // テストモードの状態

const answerSelectors = '.rightanswer, .specificfeedback, .fa-check.text-success, .fa-remove.text-danger, .state, .trafficlight';

// 質問ごとの表示設定を行う関数
function setQuestionVisibility(questionElement, show) {
  const answers = questionElement.querySelectorAll(answerSelectors);
  answers.forEach(el => {
    el.style.display = show ? 'block' : 'none';
  });
  
  // ラジオボタンをリセット（仕様通り）
  const radios = questionElement.querySelectorAll('input[type="radio"]');
  radios.forEach(r => r.checked = false);
}

// 個別の質問のトグル処理
function toggleQuestion(questionElement) {
  const answers = questionElement.querySelectorAll(answerSelectors);
  if (answers.length === 0) return;

  // 最初の要素の状態を見て判定（一つでも非表示なら表示に切り替え）
  const isHidden = answers[0].style.display === 'none';
  setQuestionVisibility(questionElement, !isHidden);
}

// 全体のトグル処理（Hキー用）
let globalShow = false;
function toggleAll() {
  globalShow = !globalShow;
  const questions = document.querySelectorAll('.que');
  questions.forEach(q => setQuestionVisibility(q, globalShow));
}

// テストモードの切り替え
function setTestMode(enabled) {
    isTestMode = enabled;
    
    // --- ラジオボタンの処理 ---
    const radios = document.querySelectorAll('.que input[type="radio"]');
    radios.forEach(radio => {
        if (enabled) {
            radio.disabled = false;
            radio.removeAttribute('disabled');
        } else {
            radio.disabled = true;
            radio.setAttribute('disabled', 'disabled');
            radio.checked = false; // モード終了時にリセット
        }
    });

    // --- テキスト入力の処理 ---
    const textInputs = document.querySelectorAll('.que input.hider-input');
    textInputs.forEach(input => {
        if (enabled) {
            input.removeAttribute('readonly');
            input.value = ""; // テスト入力用にクリア
        } else {
            input.setAttribute('readonly', 'readonly');
            input.value = input.dataset.originalAnswer; // 答えを戻す
        }
        // フィードバック削除
        const container = input.closest('span') || input.parentElement; // Moodleの構造によるが親へ
        if (container) {
             container.querySelectorAll('.hider-feedback').forEach(el => el.remove());
        }
    });

    // モードOFFなら（ラジオボタン側の）フィードバックも削除
    if (!enabled) {
        document.querySelectorAll('.hider-feedback').forEach(el => el.remove());
    }
}

// 質問ごとの表示設定を行う関数
function setQuestionVisibility(questionElement, show) {
  const answers = questionElement.querySelectorAll(answerSelectors);
  answers.forEach(el => {
    el.style.display = show ? 'block' : 'none';
  });
  
  // テキスト入力の表示制御
  const textInputs = questionElement.querySelectorAll('input.hider-input');
  textInputs.forEach(input => {
      if (show) {
          input.value = input.dataset.originalAnswer;
      } else {
          // テストモード中は、ユーザーが入力を試みている可能性があるので
          // 強制的にクリアするかどうかは議論の余地があるが、
          // "Hide" = "隠す" なのでクリアする（テスト入力中の文字も隠れる）
          input.value = "";
      }
  });

  // ラジオボタンをリセット（仕様通り）
  const radios = questionElement.querySelectorAll('input[type="radio"]');
  radios.forEach(r => r.checked = false);
}

// ... (toggleQuestion, toggleAll は変更なし) ...

// 初期化処理
function init() {
  const questions = document.querySelectorAll('.que');
  
  if (questions.length === 0) {
    // ... (フォールバック処理は省略/変更なし) ...
    document.querySelectorAll(answerSelectors).forEach(el => el.style.display = 'none');
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    return;
  }

  questions.forEach(q => {
    // --- テキスト入力（記述式）の初期化 ---
    // Moodleの記述式回答欄（正解表示状態）を取得
    const textInputs = q.querySelectorAll('input[type="text"][readonly]');
    textInputs.forEach(input => {
        if (!input.dataset.originalAnswer) {
            input.dataset.originalAnswer = input.value; // 正解を保存
            input.classList.add('hider-input'); // 識別用クラス
        }
        
        // 入力に対する正誤判定イベント
        input.addEventListener('change', function() {
            if (!isTestMode) return;
            
            const val = input.value.trim();
            const correctVal = input.dataset.originalAnswer.trim();
            
            // フィードバック表示場所（inputの直後）
            // 既存フィードバック削除
            let parent = input.parentElement;
            parent.querySelectorAll('.hider-feedback').forEach(el => el.remove());

            const msg = document.createElement('span');
            msg.className = 'hider-feedback';
            msg.style.fontWeight = 'bold';
            msg.style.marginLeft = '0.5em';

            if (val === correctVal) {
                msg.textContent = '⭕ 正解';
                msg.style.color = '#28a745';
            } else {
                msg.textContent = '❌ 不正解';
                msg.style.color = '#dc3545';
            }
            
            input.after(msg);
        });
    });

    // 初期状態は隠す（テキスト入力もここでクリアされる）
    setQuestionVisibility(q, false);

    // クリックイベント設定 (質問全体のトグル)
    q.addEventListener('click', (e) => {
      // ... (既存のクリック処理) ...
      if (window.getSelection().toString().length > 0) return;
      const ignoreTags = ['A', 'INPUT', 'TEXTAREA', 'BUTTON', 'LABEL'];
      if (ignoreTags.includes(e.target.tagName) || e.target.closest('label') || e.target.closest('a') || e.target.closest('button')) {
          return;
      }
      toggleQuestion(q);
    });

    // ... (ラジオボタンのイベントリスナー設定 - 既存のまま) ...
    const radios = q.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('click', (e) => {
             if (!isTestMode) return;
             // ... (中略) ...
             const container = radio.closest('div.r0, div.r1') || radio.parentElement;
             container.querySelectorAll('.hider-feedback').forEach(el => el.remove());
             const isCorrect = container.classList.contains('correct') || 
                               container.querySelector('.fa-check.text-success') !== null ||
                               container.querySelector('.icon.fa-check') !== null;
             
             const msg = document.createElement('span');
             msg.className = 'hider-feedback';
             msg.style.fontWeight = 'bold';
             msg.style.marginLeft = '0.5em';
             if (isCorrect) {
                 msg.textContent = '⭕ 正解';
                 msg.style.color = '#28a745';
             } else {
                 msg.textContent = '❌ 不正解';
                 msg.style.color = '#dc3545';
             }
             if (radio.nextElementSibling) {
                 radio.nextElementSibling.after(msg);
             } else {
                 radio.parentElement.appendChild(msg);
             }
        });
    });
  });

  // 初期状態: テストモードOFF
  setTestMode(false);
}

// 実行
init();

// キーボードイベントをリスン（'h'キーで全体トグル）
document.addEventListener('keydown', function(event) {
    if (['INPUT', 'TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable) {
        return;
    }
    if (event.key.toLowerCase() === 'h') {
        toggleAll();
    }
});

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_answer") {
    toggleAll();
  } else if (request.action === "set_test_mode") {
      setTestMode(request.enabled);
  } else if (request.action === "get_status") {
      sendResponse({ testMode: isTestMode });
  }
});
