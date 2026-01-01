let hidden = true; // 初期状態は隠す
let isTestMode = false; // テストモードの状態

const answerSelectors = '.rightanswer, .specificfeedback, .fa-check.text-success, .fa-remove.text-danger, .state, .trafficlight';

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
          input.value = "";
      }
  });

  // セレクトボックスの表示制御
  const selects = questionElement.querySelectorAll('select.hider-select');
  selects.forEach(select => {
      if (show) {
          select.value = select.dataset.originalAnswer;
      } else {
          select.value = "";
      }
  });

  // ラジオボタンをリセット（仕様通り）
  const radios = questionElement.querySelectorAll('input[type="radio"]');
  radios.forEach(r => r.checked = false);
}

// 個別の質問のトグル処理
function toggleQuestion(questionElement) {
  const answers = questionElement.querySelectorAll(answerSelectors);
  if (answers.length === 0) return;

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
            radio.checked = false;
        }
    });

    // --- テキスト入力の処理 ---
    const textInputs = document.querySelectorAll('.que input.hider-input');
    textInputs.forEach(input => {
        if (enabled) {
            input.removeAttribute('readonly');
            input.value = "";
        } else {
            input.setAttribute('readonly', 'readonly');
            input.value = input.dataset.originalAnswer;
        }
        // フィードバック削除
        const container = input.closest('span') || input.parentElement;
        if (container) {
             container.querySelectorAll('.hider-feedback').forEach(el => el.remove());
        }
    });

    // --- セレクトボックス（プルダウン）の処理 ---
    const selects = document.querySelectorAll('.que select.hider-select');
    selects.forEach(select => {
        if (enabled) {
            select.disabled = false;
            select.removeAttribute('disabled');
            select.value = "";
        } else {
            select.disabled = true;
            select.setAttribute('disabled', 'disabled');
            select.value = select.dataset.originalAnswer;
        }
        // フィードバック削除
        let parent = select.parentElement;
        parent.querySelectorAll('.hider-feedback').forEach(el => el.remove());
    });

    if (!enabled) {
        document.querySelectorAll('.hider-feedback').forEach(el => el.remove());
    }
}

// 初期化処理
function init() {
  const questions = document.querySelectorAll('.que');
  
  if (questions.length === 0) {
    document.querySelectorAll(answerSelectors).forEach(el => el.style.display = 'none');
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    return;
  }

  questions.forEach(q => {
    // --- テキスト入力（記述式）の初期化 ---
    const textInputs = q.querySelectorAll('input[type="text"][readonly]');
    textInputs.forEach(input => {
        if (!input.dataset.originalAnswer) {
            input.dataset.originalAnswer = input.value;
            input.classList.add('hider-input');
        }
        
        input.addEventListener('change', function() {
            if (!isTestMode) return;
            
            const val = input.value.trim();
            const correctVal = input.dataset.originalAnswer.trim();
            
            let parent = input.parentElement;
            parent.querySelectorAll('.hider-feedback').forEach(el => el.remove());

            const msg = document.createElement('span');
            msg.className = 'hider-feedback';
            msg.style.marginLeft = '0.5em';

            if (val === correctVal) {
                msg.textContent = '⭕ 正解';
            } else {
                msg.textContent = '❌ 不正解';
            }
            
            input.after(msg);
        });
    });

    // --- セレクトボックス（プルダウン）の初期化 ---
    const selects = q.querySelectorAll('select[disabled]');
    selects.forEach(select => {
        if (!select.dataset.originalAnswer) {
            select.dataset.originalAnswer = select.value;
            select.classList.add('hider-select');
        }

        select.addEventListener('change', function() {
            if (!isTestMode) return;

            const val = select.value;
            const correctVal = select.dataset.originalAnswer;

            let parent = select.parentElement;
            parent.querySelectorAll('.hider-feedback').forEach(el => el.remove());

            const msg = document.createElement('span');
            msg.className = 'hider-feedback';
            msg.style.marginLeft = '0.5em';

            if (val === correctVal) {
                msg.textContent = '⭕ 正解';
            } else {
                msg.textContent = '❌ 不正解';
            }

            select.after(msg);
        });
    });

    setQuestionVisibility(q, false);

    q.addEventListener('click', (e) => {
      if (window.getSelection().toString().length > 0) return;
      const ignoreTags = ['A', 'INPUT', 'TEXTAREA', 'BUTTON', 'LABEL', 'SELECT', 'OPTION'];
      if (ignoreTags.includes(e.target.tagName) || e.target.closest('label') || e.target.closest('a') || e.target.closest('button') || e.target.closest('select')) {
          return;
      }
      toggleQuestion(q);
    });

    const radios = q.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('click', (e) => {
             if (!isTestMode) return;
             const container = radio.closest('div.r0, div.r1') || radio.parentElement;
             container.querySelectorAll('.hider-feedback').forEach(el => el.remove());
             
             const isCorrect = container.classList.contains('correct') || 
                               container.querySelector('.fa-check.text-success') !== null ||
                               container.querySelector('.icon.fa-check') !== null;
             
             const msg = document.createElement('span');
             msg.className = 'hider-feedback';
             msg.style.marginLeft = '0.5em';
             
             if (isCorrect) {
                 msg.textContent = '⭕ 正解';
             } else {
                 msg.textContent = '❌ 不正解';
             }
             
             if (radio.nextElementSibling) {
                 radio.nextElementSibling.after(msg);
             } else {
                 radio.parentElement.appendChild(msg);
             }
        });
    });
  });

  chrome.storage.local.get(['mode'], function(result) {
      if (result.mode === 'test') {
          setTestMode(true);
      } else {
          setTestMode(false);
      }
  });
}

init();

document.addEventListener('keydown', function(event) {
    if (['INPUT', 'TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable) {
        return;
    }
    if (event.key.toLowerCase() === 'h') {
        toggleAll();
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_answer") {
    toggleAll();
  } else if (request.action === "set_test_mode") {
      setTestMode(request.enabled);
  } else if (request.action === "get_status") {
      sendResponse({ testMode: isTestMode });
  }
});
