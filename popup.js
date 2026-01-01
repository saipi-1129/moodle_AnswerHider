document.getElementById('toggleBtn').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_answer" });
    }
  });
});

const modeNormal = document.getElementById('modeNormal');
const modeTest = document.getElementById('modeTest');

// 初期状態の取得
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  if (tabs.length > 0) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "get_status" }, function(response) {
      if (response && response.testMode !== undefined) {
        if (response.testMode) {
            modeTest.checked = true;
        } else {
            modeNormal.checked = true;
        }
      }
    });
  }
});

// ラジオボタンの変更イベント（共通ハンドラ）
function onModeChange() {
    const isTestMode = modeTest.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "set_test_mode", enabled: isTestMode });
        }
    });
}

modeNormal.addEventListener('change', onModeChange);
modeTest.addEventListener('change', onModeChange);
  