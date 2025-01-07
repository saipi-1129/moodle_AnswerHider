document.getElementById('toggleBtn').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleAnswerVisibility
      });
    });
  });
  
  function toggleAnswerVisibility() {
    let answers = document.querySelectorAll('.rightanswer, .ml-1');
    answers.forEach(function(element) {
      if (element.style.display === 'none' || element.style.display === '') {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });
  }
  