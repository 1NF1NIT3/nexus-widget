
// Renderer: single clean script that manages themes, audio, and UI
const THEMES = [
  {
    id: 'GLUE',
    name: 'Snoopy x Glue (Night)',
    title: 'GLUE SONG',
    artist: 'Clairo',
    audioSrc: './assets/clairo_2.mp3',
    vinylImage: './assets/gluesnoopy.jpg',
    background: '',
    bodyClass: 'starlight-background',
    fontFamily: 'Comic Neue, system-ui, sans-serif',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@300;400;700&display=swap',
    cornerGif: './assets/sleep.gif',
    labelText: 'S',
    labelColor: '#E8C67B', 
    colors: {
      primaryBg: '#1D2B4D',      
      secondaryBg: '#9E2A2A',    
      action: '#E8C67B',         
      text: '#F0F8FF',           
      accent: '#C49E9E'          
    },
    vinylFrame: {
      color: '#F0F8FF',
      style: 'solid', 
      width: '2px',
      radius: '9999px'
    }
  },
  {
    id: 'anything',
    name: 'Anything',
    title: 'Anything',
    artist: 'Adrianne Lenker',
    audioSrc: './assets/anything.mp3',
    vinylImage: './assets/snoopy.jpg',
    background: '', 
    fontFamily: 'Comic Neue, system-ui, sans-serif',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@300;400;700&display=swap',
    cornerGif: './assets/snoopygif.gif',
    bodyClass: 'anything-background-effect', 
    labelText: 'SN',
    labelColor: 'linear-gradient(180deg,#fff9f1,#f59e0b)',
    colors: {
      primaryBg: '#FDFDFD',
      secondaryBg: '#A8C6D9',
      action: '#E83333',
      text: '#333333',
      accent: '#F4C95A'
    },
    vinylFrame: {
      color: '#E83333',
      style: 'solid',
      width: '2px',
      radius: '9999px'
    }
  },
];

let currentThemeIndex = 0;

function loadFontIfNeeded(theme) {
  if (!theme.fontUrl) return;
  if (document.getElementById('theme-font-' + theme.id)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = theme.fontUrl;
  link.id = 'theme-font-' + theme.id;
  document.head.appendChild(link);
}

function applyTheme(index) {
  const theme = THEMES[index];
  const audio = document.getElementById('audio');
  const vinylDisc = document.getElementById('vinyl');
  const titleEl = document.getElementById('title');
  const artistEl = document.getElementById('artist');
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const themeBtn = document.getElementById('themeBtn');

  if (!theme) return;
  titleEl.textContent = theme.title;
  artistEl.textContent = theme.artist;
  audio.src = theme.audioSrc;
  
  try {
    if (vinylDisc) {
      if (theme.vinylImage) {
        vinylDisc.style.backgroundImage = `url(${theme.vinylImage})`;
        vinylDisc.style.backgroundSize = 'cover';
        vinylDisc.style.backgroundPosition = 'center';
      } else {
        vinylDisc.style.backgroundImage = '';
      }
    }
  } catch (err) {
    console.warn('Failed to apply vinyl artwork', err);
  }

  try {
    const vinylLabel = document.getElementById('vinylLabel');
    if (vinylLabel) {
      if (theme.labelText !== undefined) vinylLabel.textContent = theme.labelText;
      if (theme.labelColor) {
        vinylLabel.style.background = theme.labelColor;
        const lc = String(theme.labelColor).toLowerCase();
        if (lc.includes('gradient') || lc.includes('rgb')) {
          vinylLabel.style.color = '#111827';
        } else if (lc.startsWith('#') && lc.length >= 7) {
          try {
            const r = parseInt(lc.substr(1,2),16);
            const g = parseInt(lc.substr(3,2),16);
            const b = parseInt(lc.substr(5,2),16);
            const lum = (0.2126*r + 0.7152*g + 0.0722*b)/255;
            vinylLabel.style.color = (lum > 0.6) ? '#111827' : '#ffffff';
          } catch(e) {
            vinylLabel.style.color = '#111827';
          }
        } else {
          vinylLabel.style.color = '#111827';
        }
      } else {
        vinylLabel.style.background = '';
        vinylLabel.style.color = '';
      }
    }
  } catch (err) {
    console.warn('Failed to apply vinyl label customizations', err);
  }

  // 1. CRITICAL: Clear ALL potential background properties first
  // --- Start of FINAL FIX in applyTheme function ---

// 1. CRITICAL: Clear all classes, including the initial Tailwind one.
// We remove 'bg-gray-900' which is set in index.html 
document.body.classList.remove('anything-background-effect', 'starlight-background', 'bg-gray-900'); 
document.body.classList.remove('folded-visual');

// 2. Clear all inline background properties
document.body.style.background = ''; 
document.body.style.backgroundColor = '';

// 3. Apply the new theme background properties
if (theme.background) {
    // Theme uses an explicit inline background (e.g., gradient)
    document.body.style.background = theme.background;
} else if (theme.bodyClass) {
    // Theme uses a CSS class for background/effects, like 'anything-background-effect'
    document.body.classList.add(theme.bodyClass);
} else if (theme.colors && theme.colors.primaryBg) {
    // Default fallback: Set primary background color
    document.body.style.backgroundColor = theme.colors.primaryBg;
}

// --- End of FINAL FIX in applyTheme function ---

  if (theme.fontFamily) document.body.style.fontFamily = theme.fontFamily;
  else document.body.style.fontFamily = '';
  if (theme.fontUrl) loadFontIfNeeded(theme);
  
  const cornerGif = document.getElementById('cornerGif');
  if (cornerGif && theme.cornerGif) {
    try { cornerGif.style.backgroundImage = `url(${theme.cornerGif})`; } catch (e) { console.warn(e); }
  } else if (cornerGif) {
    cornerGif.style.backgroundImage = '';
  }
  
  if (theme.colors) {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary-bg', theme.colors.primaryBg);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-secondary-bg', theme.colors.secondaryBg);
    root.style.setProperty('--theme-action', theme.colors.action);
    root.style.setProperty('--theme-text', theme.colors.text);

    if (playBtn) {
      playBtn.style.background = theme.colors.action;
      playBtn.style.color = theme.colors.primaryBg === '#FDFDFD' ? theme.colors.text : '#fff';
      playBtn.style.border = 'none';
    }
    if (pauseBtn) {
      pauseBtn.style.background = theme.colors.secondaryBg;
      pauseBtn.style.color = theme.colors.text;
      pauseBtn.style.border = 'none';
    }
    if (themeBtn) {
      themeBtn.style.background = theme.colors.accent;
      themeBtn.style.color = theme.colors.text;
    }

    if (titleEl) titleEl.style.color = theme.colors.text;
    if (artistEl) artistEl.style.color = theme.colors.text;
    const heartEl = document.getElementById('heartIcon');
    if (heartEl) {
      if (theme.colors && theme.colors.action) heartEl.style.color = theme.colors.action;
      else heartEl.style.color = '';
    }

    const vinylWrap = document.getElementById('vinylWrap');
    if (vinylWrap) {
      if (theme.vinylFrame) {
        const vf = theme.vinylFrame;
        try {
          vinylWrap.style.border = `${vf.width || '2px'} ${vf.style || 'solid'} ${vf.color || '#6E5A48'}`;
          vinylWrap.style.borderRadius = vf.radius || '12px';
        } catch (e) { console.warn('Failed to apply vinylFrame', e); }
      } else {
        vinylWrap.style.border = '';
        vinylWrap.style.borderRadius = '9999px';
      }
    }
  } else {
    const root = document.documentElement;
    root.style.removeProperty('--theme-primary-bg');
    root.style.removeProperty('--theme-accent');
    root.style.removeProperty('--theme-secondary-bg');
    root.style.removeProperty('--theme-action');
    root.style.removeProperty('--theme-text');

    if (playBtn) { playBtn.style.background = ''; playBtn.style.color = ''; playBtn.style.border = ''; }
    if (pauseBtn) { pauseBtn.style.background = ''; pauseBtn.style.color = ''; pauseBtn.style.border = ''; }
    if (themeBtn) { themeBtn.style.background = ''; themeBtn.style.color = ''; }
    if (titleEl) titleEl.style.color = '';
    if (artistEl) artistEl.style.color = '';
    const heartEl = document.getElementById('heartIcon');
    if (heartEl) heartEl.style.color = '';
  }
}

function updateVinyl(isPlaying) {
  const vinylDisc = document.getElementById('vinyl');
  if (!vinylDisc) return;
  if (isPlaying) vinylDisc.classList.add('spin'); else vinylDisc.classList.remove('spin');
}

function buildThemeMenu() {
  const menu = document.getElementById('themeMenu');
  menu.innerHTML = '';
  THEMES.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'theme-item no-drag';
    item.textContent = t.name;
    item.addEventListener('click', () => {
      currentThemeIndex = i;
      applyTheme(i);
      menu.classList.add('hidden');
    });
    menu.appendChild(item);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audio');
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const themeBtn = document.getElementById('themeBtn');
  const themeMenu = document.getElementById('themeMenu');

  buildThemeMenu();
  applyTheme(currentThemeIndex);

  if (playBtn) playBtn.addEventListener('click', () => { audio.play(); updateVinyl(true); });
  if (pauseBtn) pauseBtn.addEventListener('click', () => { audio.pause(); updateVinyl(false); });

  audio.addEventListener('play', () => updateVinyl(true));
  audio.addEventListener('pause', () => updateVinyl(false));

  // === CRITICAL FIX: Use the exposed bridge API for IPC ===
  // OLD: if (closeBtn) ipcRenderer.send('close-app'); // Error: ipcRenderer is undefined
  // NEW: Call the exposed function from the global object.
  
  // NOTE: The 'close-app' handler needs to be on an event listener, not a direct call
  // because the script runs when the DOM is ready, not when the button is clicked.

  if (themeBtn) themeBtn.addEventListener('click', (e) => { e.stopPropagation(); themeMenu.classList.toggle('hidden'); });

  document.addEventListener('click', () => { themeMenu.classList.add('hidden'); });

});


