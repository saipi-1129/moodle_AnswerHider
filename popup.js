// UI要素
const toggleBtn = document.getElementById('toggleBtn');
const modeNormal = document.getElementById('modeNormal');
const modeTest = document.getElementById('modeTest');

// 初期状態の取得（Active Tabのcontent.jsから状態をもらう）
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  if (tabs.length > 0) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "get_status" }, function(response) {
      if (chrome.runtime.lastError) {
        // コンテンツスクリプトがまだロードされていない、またはエラーの場合のハンドリング
        // 必要ならここでデフォルト値を設定したり、UIを無効化したりする
        console.log("Content script not ready or error:", chrome.runtime.lastError.message);
        return;
      }
      
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

// 表示/非表示トグルボタン
toggleBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_answer" });
        }
    });
});

// モード変更時の処理
function onModeChange() {
    const isTestMode = modeTest.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "set_test_mode", enabled: isTestMode });
        }
    });
}

// イベントリスナー設定
if (modeNormal) modeNormal.addEventListener('change', onModeChange);
if (modeTest) modeTest.addEventListener('change', onModeChange);