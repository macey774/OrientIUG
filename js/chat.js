import { storage } from './storage.js';
import { getBotResponse } from './bot.js';
import { showToast } from './app.js';
import { switchTo } from './app.js'; // sera importé depuis app

// Module Chat
let messagesContainer;
let chatInput;
let sendBtn;
let emojiPicker;
let recentEmojis = [];

export function initChat() {
  messagesContainer = document.getElementById('chat-fullscreen-messages');
  chatInput = document.getElementById('chat-fullscreen-input');
  sendBtn = document.getElementById('send-voice-btn');

  // Récupérer les émojis récents
  recentEmojis = storage.get('recentEmojis', []);

  chatInput.addEventListener('input', updateSendButton);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (chatInput.value.trim() !== '') sendTextMessage();
      else startVoiceRecording();
    }
  });

  sendBtn.addEventListener('click', () => {
    if (chatInput.value.trim() !== '') sendTextMessage();
    else startVoiceRecording();
  });

  // Initialiser les autres composants du chat
  initEmojiPicker();
  initAttachToolbar();
  initThreeDotsMenu();
  initSearchPanel();
  initThemePanel();
}

function updateSendButton() {
  if (chatInput.value.trim() === '') {
    sendBtn.innerHTML = '<i class="fas fa-microphone"></i>';
  } else {
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
  }
}

function sendTextMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage({ text, isUser: true, timestamp: new Date().toISOString() });
  chatInput.value = '';
  updateSendButton();
  autoResizeTextarea();
}

function startVoiceRecording() {
  showToast('Enregistrement vocal (simulé)');
}

function addMessage(msg) {
  // Ajouter à l'historique
  let messages = storage.get('orientiugChatMessages', []);
  messages.push(msg);
  storage.set('orientiugChatMessages', messages);

  renderMessages();

  if (msg.isUser) {
    // Simuler réponse du bot
    setTimeout(() => {
      const response = getBotResponse(msg.text);
      addMessage({
        text: response.text,
        isUser: false,
        timestamp: new Date().toISOString(),
        action: response.action
      });
    }, 1000);
  }
}

function renderMessages() {
  const messages = storage.get('orientiugChatMessages', []);
  messagesContainer.innerHTML = '';
  let lastDate = null;

  messages.forEach(msg => {
    const msgDate = new Date(msg.timestamp);
    const dateStr = getDateLabel(msgDate);
    const dateKey = msgDate.toDateString();

    if (!lastDate || lastDate !== dateKey) {
      const sep = document.createElement('div');
      sep.className = 'date-separator';
      sep.textContent = dateStr;
      messagesContainer.appendChild(sep);
      lastDate = dateKey;
    }

    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${msg.isUser ? 'user' : 'bot'}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = msg.text;

    if (!msg.isUser && msg.action) {
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = msg.action.label;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (msg.action.type === 'inscription') {
          switchTo('inscription');
        }
      });
      bubble.appendChild(link);
    }

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    bubble.appendChild(time);
    wrapper.appendChild(bubble);
    messagesContainer.appendChild(wrapper);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getDateLabel(date) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date);
  msgDate.setHours(0,0,0,0);

  if (msgDate.getTime() === today.getTime()) return "Aujourd'hui";
  if (msgDate.getTime() === yesterday.getTime()) return "Hier";
  const diffDays = Math.round((today - msgDate) / (1000*60*60*24));
  if (diffDays < 7 && diffDays > 0) {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' });
  }
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function autoResizeTextarea() {
  chatInput.style.height = 'auto';
  chatInput.style.height = chatInput.scrollHeight + 'px';
}

// Initialisation des composants annexes (émojis, outils, menu, recherche, thème)
function initEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  const btn = document.getElementById('emoji-sticker-btn');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    picker.classList.toggle('hidden');
  });
  document.querySelectorAll('.emoji-option').forEach(span => {
    span.addEventListener('click', () => {
      insertEmoji(span.textContent);
      picker.classList.add('hidden');
    });
  });
  document.addEventListener('click', (e) => {
    if (!picker.contains(e.target) && e.target !== btn) {
      picker.classList.add('hidden');
    }
  });
}

function insertEmoji(emoji) {
  const start = chatInput.selectionStart;
  const end = chatInput.selectionEnd;
  const text = chatInput.value;
  chatInput.value = text.slice(0, start) + emoji + text.slice(end);
  chatInput.selectionStart = chatInput.selectionEnd = start + emoji.length;
  chatInput.focus();
  updateSendButton();
  // Ajouter aux récents
  if (!recentEmojis.includes(emoji)) {
    recentEmojis.unshift(emoji);
    if (recentEmojis.length > 12) recentEmojis.pop();
    storage.set('recentEmojis', recentEmojis);
    updateRecentEmojis();
  }
}

function updateRecentEmojis() {
  const cat = document.getElementById('recent-category');
  const grid = document.getElementById('recent-grid');
  if (recentEmojis.length === 0) {
    cat.style.display = 'none';
    return;
  }
  cat.style.display = 'block';
  grid.innerHTML = '';
  recentEmojis.forEach(emoji => {
    const span = document.createElement('span');
    span.className = 'emoji-option';
    span.textContent = emoji;
    span.addEventListener('click', () => insertEmoji(emoji));
    grid.appendChild(span);
  });
}

function initAttachToolbar() {
  const toolbar = document.getElementById('chat-toolbar');
  const btn = document.getElementById('attach-doc-btn');
  btn.addEventListener('click', () => toolbar.classList.toggle('hidden'));
  document.querySelectorAll('.chat-toolbar button').forEach(b => {
    b.addEventListener('click', () => {
      showToast(`Action : ${b.innerText} (simulée)`);
      toolbar.classList.add('hidden');
    });
  });
}

function initThreeDotsMenu() {
  const menu = document.getElementById('three-dots-menu');
  const btn = document.getElementById('three-dots-btn');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });
  document.getElementById('menu-register').addEventListener('click', () => {
    menu.classList.add('hidden');
    switchTo('inscription');
  });
  document.getElementById('menu-media').addEventListener('click', () => {
    menu.classList.add('hidden');
    showToast('Fonctionnalité à venir.');
  });
  document.getElementById('menu-search').addEventListener('click', () => {
    menu.classList.add('hidden');
    document.getElementById('search-panel').classList.remove('hidden');
  });
  document.getElementById('menu-theme').addEventListener('click', () => {
    menu.classList.add('hidden');
    document.getElementById('theme-panel').classList.toggle('hidden');
  });
  document.getElementById('menu-clear').addEventListener('click', () => {
    menu.classList.add('hidden');
    if (confirm('Effacer la conversation ?')) {
      storage.remove('orientiugChatMessages');
      messagesContainer.innerHTML = '';
      addMessage({
        text: "Bonjour ! Je suis votre assistant d'orientation...",
        isUser: false,
        timestamp: new Date().toISOString()
      });
    }
  });
  document.getElementById('menu-report').addEventListener('click', () => {
    menu.classList.add('hidden');
    showToast('Signalement envoyé (simulé).');
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.classList.add('hidden');
    }
  });
}

function initSearchPanel() {
  const panel = document.getElementById('search-panel');
  const input = document.getElementById('search-input');
  const closeBtn = document.getElementById('search-close');
  const countEl = document.getElementById('search-results-count');
  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
    clearHighlights();
  });
  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    clearHighlights();
    if (term === '') {
      countEl.textContent = '';
      return;
    }
    const bubbles = document.querySelectorAll('#chat-fullscreen-messages .message-bubble');
    let count = 0;
    bubbles.forEach(bubble => {
      const text = bubble.innerText;
      if (text.toLowerCase().includes(term)) {
        count++;
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        bubble.innerHTML = bubble.innerHTML.replace(regex, '<span class="search-highlight">$1</span>');
      }
    });
    countEl.textContent = `${count} résultat(s)`;
  });
}

function clearHighlights() {
  document.querySelectorAll('.search-highlight').forEach(el => {
    el.outerHTML = el.textContent;
  });
}

function initThemePanel() {
  const panel = document.getElementById('theme-panel');
  document.getElementById('theme-reset').addEventListener('click', () => {
    document.querySelector('.orientiug-chat-fullscreen').style.background = '';
    document.querySelectorAll('.message-bubble').forEach(b => b.style.background = '');
    storage.remove('chatTheme');
    panel.classList.add('hidden');
  });
  document.getElementById('theme-close').addEventListener('click', () => panel.classList.add('hidden'));
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const bg = opt.dataset.bg;
      const bubble = opt.dataset.bubble;
      const userBubble = opt.dataset.userBubble;
      document.querySelector('.orientiug-chat-fullscreen').style.background = bg;
      document.querySelectorAll('.message-wrapper.bot .message-bubble').forEach(b => b.style.background = bubble);
      document.querySelectorAll('.message-wrapper.user .message-bubble').forEach(b => b.style.background = userBubble);
      storage.set('chatTheme', { bg, bubble, userBubble });
      panel.classList.add('hidden');
    });
  });
  // Appliquer le thème sauvegardé
  const saved = storage.get('chatTheme');
  if (saved) {
    document.querySelector('.orientiug-chat-fullscreen').style.background = saved.bg;
    document.querySelectorAll('.message-wrapper.bot .message-bubble').forEach(b => b.style.background = saved.bubble);
    document.querySelectorAll('.message-wrapper.user .message-bubble').forEach(b => b.style.background = saved.userBubble);
  }
}

export { addMessage, renderMessages };
