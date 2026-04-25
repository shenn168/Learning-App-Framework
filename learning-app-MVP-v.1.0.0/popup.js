// LearnFlow Popup Controller

const APP_URL = chrome.runtime.getURL('pages/app.html');

function openApp(hash) {
  chrome.tabs.create({ url: `${APP_URL}${hash}` });
  window.close();
}

async function init() {
  const data = await chrome.storage.local.get(['lastRoute', 'lastLessonTitle']);

  const resumeCard = document.getElementById('resume-card');
  const resumeTitle = document.getElementById('resume-title');

  if (data.lastRoute && data.lastRoute !== '#/home' && data.lastLessonTitle) {
    resumeTitle.textContent = data.lastLessonTitle;
    resumeCard.hidden = false;
  }

  document.getElementById('btn-resume').addEventListener('click', () => {
    openApp(data.lastRoute || '#/home');
  });

  document.getElementById('btn-home').addEventListener('click', () => {
    openApp('#/home');
  });

  document.getElementById('btn-glossary').addEventListener('click', () => {
    openApp('#/glossary');
  });

  document.getElementById('btn-progress').addEventListener('click', () => {
    openApp('#/progress');
  });
}

init();