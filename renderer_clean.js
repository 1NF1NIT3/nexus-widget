// Renderer: single clean script that manages themes, audio, and UI
const THEMES = [
  {
    id: 'GLUE',
    name: 'Snoopy x Glue (Night)',
    title: 'GLUE SONG',
    artist: 'Clairo & Bea',
    audioSrc: './assets/clairo_2.mp3', // Path fix confirmed
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
      text: '#f0f8ff',          
      textMuted: '#a0aec0'      
    }
  },
  {
    id: 'anything',
    name: 'Anything (Day)',
    title: 'ANYTHING',
    artist: 'Adrianne Lenker',
    audioSrc: './assets/anything.mp3',
    vinylImage: './assets/snoopy.jpg',
    background: '',
    bodyClass: 'daylight-background',
    fontFamily: 'Playfair Display, serif',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap',
    cornerGif: './assets/snoopygif.gif',
    labelText: 'A',
    labelColor: '#4CAF50',
    colors: {
      primaryBg: '#F5F5DC',      // Beige
      secondaryBg: '#4CAF50',    // Green
      action: '#FFC107',        // Amber
      text: '#333333',          // Dark Gray
      textMuted: '#666666'      // Medium Gray
    }
  }
];

// === NEW: Local Storage for Theme Persistence ===
// Load the last saved theme index, default to 0 (the first theme)
let currentThemeIndex = parseInt(localStorage.getItem('lastThemeIndex')) || 0; 

// Safety check for invalid/out of bounds index
if (currentThemeIndex >= THEMES.length || currentThemeIndex < 0) {
    currentThemeIndex = 0;
    localStorage.removeItem('lastThemeIndex'); 
}
// === END NEW ===

const VINYL_WRAP_WIDTH = 130;
let vinylRotation = 0;
let rotationInterval;

function updateVinyl(playing) {
  const vinyl = document.getElementById('vinyl');
  if (!vinyl) return;

  if (playing) {
    if (!rotationInterval) {
      rotationInterval = setInterval(() => {
        vinylRotation = (vinylRotation + 0.5) % 360;
        vinyl.style.transform = `rotate(${vinylRotation}deg)`;
      }, 1000 / 60); // Roughly 60 FPS
    }
    vinyl.classList.add('playing');
  } else {
    clearInterval(rotationInterval);
    rotationInterval = null;
    vinyl.classList.remove('playing');
  }
}

function applyTheme(index) {
  const theme = THEMES[index];
  const body = document.body;
  const widget = document.getElementById('widget');
  const vinylLabel = document.getElementById('vinylLabel');
  const vinyl = document.getElementById('vinyl');
  const title = document.getElementById('title');
  const artist = document.getElementById('artist');
  const cornerGif = document.getElementById('cornerGif');
  const audio = document.getElementById('audio');

  // 1. Remove old classes and apply new body background/font
  body.className = '';
  body.classList.add('bg-gray-900', 'text-white', 'font-sans', theme.bodyClass);

  // 2. Load custom font (if specified)
  if (theme.fontUrl) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = theme.fontUrl;
    document.head.appendChild(link);
  }
  body.style.fontFamily = theme.fontFamily;

  // 3. Update Text and Media
  if (title) title.textContent = theme.title;
  if (artist) artist.textContent = theme.artist;
  if (vinylLabel) {
    vinylLabel.textContent = theme.labelText;
    vinylLabel.style.backgroundColor = theme.labelColor;
  }
  if (vinyl) vinyl.style.backgroundImage = `url('${theme.vinylImage}')`;
  if (cornerGif) cornerGif.style.backgroundImage = `url('${theme.cornerGif}')`;

  // 4. Update Audio Source (CRITICAL for PWA)
  if (audio) {
    // Pause any currently playing audio
    audio.pause();
    // Update source and load
    audio.src = theme.audioSrc;
    // Important: preload="auto" in HTML helps, but audio.load() forces it after src change
    audio.load(); 
  }
  
  // 5. Apply CSS variables for colors (for dynamic styling in style.css)
  if (widget) {
    widget.style.setProperty('--theme-primary-bg', theme.colors.primaryBg);
    widget.style.setProperty('--theme-secondary-bg', theme.colors.secondaryBg);
    widget.style.setProperty('--theme-action', theme.colors.action);
    widget.style.setProperty('--theme-text', theme.colors.text);
    widget.style.setProperty('--theme-text-muted', theme.colors.textMuted);

    // Set widget's own background to the new primary color
    widget.style.backgroundColor = theme.colors.primaryBg;
  }
}

function buildThemeMenu() {
  const menu = document.getElementById('themeMenu');
  menu.innerHTML = '';
  
  THEMES.forEach((theme, i) => {
    const item = document.createElement('div');
    item.classList.add('theme-menu-item');
    item.textContent = theme.name;
    
    item.addEventListener('click', () => {
      currentThemeIndex = i;
      applyTheme(i);
      // === NEW: Save to Local Storage ===
      localStorage.setItem('lastThemeIndex', i); 
      // === END NEW ===
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
  applyTheme(currentThemeIndex); // This now uses the index loaded from Local Storage

  if (playBtn) playBtn.addEventListener('click', () => { audio.play(); updateVinyl(true); });
  if (pauseBtn) pauseBtn.addEventListener('click', () => { audio.pause(); updateVinyl(false); });

  audio.addEventListener('play', () => updateVinyl(true));
  audio.addEventListener('pause', () => updateVinyl(false));

  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent document click from immediately closing it
      themeMenu.classList.toggle('hidden');
    });
  }

  document.addEventListener('click', (e) => {
    if (themeMenu && !themeMenu.contains(e.target) && e.target !== themeBtn) {
      themeMenu.classList.add('hidden');
    }
  });
});
