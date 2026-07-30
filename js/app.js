import { storage } from './storage.js';
import { initChat, renderMessages } from './chat.js';
import { initForm, initInscriptionDate } from './form.js';

// ===== ÉTAT GLOBAL =====
const AppState = {
  current: 'hub',
  history: ['hub']
};

// ===== FONCTIONS UTILITAIRES =====
export function showToast(message, duration = 2000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.classList.remove('hidden');
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) container.classList.add('hidden');
    }, 300);
  }, duration);
}

export function switchTo(screen) {
  if (screen === AppState.current) return;
  AppState.history.push(screen);
  AppState.current = screen;
  updateUIForScreen(screen);
}

function goBack() {
  if (AppState.history.length > 1) {
    AppState.history.pop();
    const previous = AppState.history[AppState.history.length - 1];
    AppState.current = previous;
    updateUIForScreen(previous);
  }
}

function updateUIForScreen(screen) {
  const hub = document.getElementById('hub-section');
  const orientiug = document.getElementById('orientiug-section');
  const inscription = document.getElementById('inscription-section');
  const wall = document.getElementById('wallofsuccess-section');
  const presentation = document.getElementById('orientiug-presentation');
  const chatFull = document.getElementById('orientiug-chat-fullscreen');
  const backBtn = document.getElementById('back-button');
  const headerIcon = document.getElementById('header-icon');
  const headerTitle = document.getElementById('header-title');
  const hubActions = document.getElementById('hub-actions');
  const chatActions = document.getElementById('chat-actions');
  const inscriptionActions = document.getElementById('inscription-actions');

  // Masquer tout
  hub.classList.add('hidden');
  orientiug.classList.add('hidden');
  inscription.classList.add('hidden');
  wall.classList.add('hidden');
  presentation.classList.add('hidden');
  chatFull.classList.add('hidden');
  backBtn.classList.add('hidden');
  hubActions.classList.add('hidden');
  chatActions.classList.add('hidden');
  inscriptionActions.classList.add('hidden');
  document.body.classList.remove('chat-active');

  switch (screen) {
    case 'hub':
      hub.classList.remove('hidden');
      headerIcon.className = 'fas fa-cubes';
      headerTitle.textContent = 'Hub IUG';
      hubActions.classList.remove('hidden');
      break;
    case 'orientiug-presentation':
      orientiug.classList.remove('hidden');
      presentation.classList.remove('hidden');
      headerIcon.className = 'fas fa-compass';
      headerTitle.textContent = 'OrientIUG';
      backBtn.classList.remove('hidden');
      chatActions.classList.remove('hidden');
      break;
    case 'orientiug-chat':
      orientiug.classList.remove('hidden');
      chatFull.classList.remove('hidden');
      headerIcon.className = 'fas fa-compass';
      headerTitle.textContent = 'OrientIUG';
      backBtn.classList.remove('hidden');
      chatActions.classList.remove('hidden');
      document.body.classList.add('chat-active');
      renderMessages();
      break;
    case 'inscription':
      inscription.classList.remove('hidden');
      headerIcon.className = 'fas fa-pen-alt';
      headerTitle.textContent = 'Fiche d\'inscription';
      backBtn.classList.remove('hidden');
      inscriptionActions.classList.remove('hidden');
      initInscriptionDate();
      break;
    case 'wallofsuccess':
      wall.classList.remove('hidden');
      headerIcon.className = 'fas fa-trophy';
      headerTitle.textContent = 'Wall of Success';
      backBtn.classList.remove('hidden');
      hubActions.classList.remove('hidden'); // on garde les actions hub pour cet écran
      break;
  }
}

// ===== INITIALISATION GÉNÉRALE =====
document.addEventListener('DOMContentLoaded', () => {
  // Splash screen
  const splash = document.getElementById('splash-screen');
  const cubeGroup = document.querySelector('.cube-group');
  const splashText = document.querySelector('.splash-text');
  const cubes = document.querySelectorAll('.cube');
  let cubesArrived = 0;
  function onCubeAnimEnd() {
    cubesArrived++;
    if (cubesArrived === cubes.length) {
      cubeGroup.classList.add('assembled');
      setTimeout(() => {
        cubeGroup.classList.add('slide-left');
        splashText.classList.remove('hidden');
        splashText.classList.add('show');
        setTimeout(() => {
          splash.classList.add('hide');
          setTimeout(() => splash.remove(), 400);
        }, 500);
      }, 200);
    }
  }
  cubes.forEach(cube => cube.addEventListener('animationend', onCubeAnimEnd));
  // Fallback
  setTimeout(() => {
    if (!cubeGroup.classList.contains('slide-left')) {
      cubeGroup.classList.add('slide-left');
      splashText.classList.remove('hidden');
      splashText.classList.add('show');
      setTimeout(() => {
        splash.classList.add('hide');
        setTimeout(() => splash.remove(), 400);
      }, 500);
    }
  }, 2500);

  // Navigation principale
  document.getElementById('orientiug-access').addEventListener('click', () => switchTo('orientiug-presentation'));
  document.getElementById('go-to-chat').addEventListener('click', () => switchTo('orientiug-chat'));
  document.getElementById('wallofsuccess-access').addEventListener('click', () => switchTo('wallofsuccess'));
  document.getElementById('back-button').addEventListener('click', goBack);
  document.getElementById('header-logo').addEventListener('click', () => switchTo('hub'));

  // Wall of Success : simuler un chargement
  document.querySelectorAll('.wallofsuccess-nav .tab-btn, .wallofsuccess-nav .school-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('rankings-container').innerHTML = '<p style="padding:2rem">Données simulées pour la démo.</p>';
    });
  });

  // Thème
  const themeToggle = document.getElementById('themeToggle');
  const mobileThemeToggle = document.getElementById('mobileThemeToggle');
  function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    document.querySelectorAll('#themeToggle i, #mobileThemeToggle i').forEach(icon => {
      icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    });
  }
  themeToggle.addEventListener('click', toggleTheme);
  mobileThemeToggle.addEventListener('click', toggleTheme);

  // Menu mobile
  const menuToggle = document.getElementById('menuToggle');
  const menuToggleChat = document.getElementById('menuToggleChat');
  const mobileMenu = document.getElementById('mobileMenu');
  menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  menuToggleChat.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !menuToggleChat.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.add('hidden');
    }
  });

  // Connexion
  const loginBtns = document.querySelectorAll('#loginBtn, #loginBtnChat, #mobileLogin');
  const loginModal = document.getElementById('loginModal');
  loginBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.remove('hidden');
  }));
  document.getElementById('loginClose').addEventListener('click', () => loginModal.classList.add('hidden'));
  document.getElementById('loginSubmit').addEventListener('click', () => {
    showToast('Connexion simulée !');
    loginModal.classList.add('hidden');
  });

  // Sondage
  setTimeout(() => {
    document.getElementById('surveyPopup').classList.remove('hidden');
  }, 3000);
  document.getElementById('closeSurvey').addEventListener('click', () => document.getElementById('surveyPopup').classList.add('hidden'));
  document.querySelectorAll('.survey-options button').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(`Merci ! Vous utilisez surtout ${btn.textContent}`);
      document.getElementById('surveyPopup').classList.add('hidden');
    });
  });

  // Accessibilité
  document.getElementById('accessibilityLink').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('accessibilityPanel').classList.toggle('hidden');
  });
  document.getElementById('closeAccessibility').addEventListener('click', () => {
    document.getElementById('accessibilityPanel').classList.add('hidden');
  });
  document.getElementById('fontSize').addEventListener('change', (e) => {
    document.body.style.fontSize = e.target.value === 'normal' ? '' : e.target.value === 'large' ? '1.2rem' : '1.4rem';
  });
  document.getElementById('contrast').addEventListener('change', (e) => {
    document.body.classList.toggle('contrast-high', e.target.value === 'high');
  });

  // Langue
  document.querySelectorAll('#langToggle, #mobileLangToggle').forEach(btn => {
    btn.addEventListener('click', () => showToast('Changement de langue (simulé) - Passage en anglais'));
  });

  // Cartes vidéo
  document.querySelectorAll('.video-tutoriel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('Lecture du tutoriel vidéo (simulé)');
    });
  });

  // Initialiser les modules
  initChat();
  initForm();

  // Démarrer sur le hub
  switchTo('hub');
});
