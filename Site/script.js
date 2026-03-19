/* ===========================
   Spider-Gwen · Animations JS
   =========================== */

// ── Particle System ──
(function createParticles() {
  const container = document.getElementById('particles');
  const count = 30;

  const colors = ['#FF2D78', '#FF6BA8', '#FF97C4', '#C800FF', '#ffffff'];

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 4 + 1.5;
    const x = Math.random() * 100;
    const dur = Math.random() * 18 + 10;
    const delay = Math.random() * 20;
    const color = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText = `
      left: ${x}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      animation-duration: ${dur}s;
      animation-delay: -${delay}s;
    `;

    container.appendChild(p);
  }
})();

// ── Counter Animation ──
function animateCounter(el, target, duration = 1800) {
  if (el.dataset.symbol === '∞') return;

  const start = performance.now();
  const startVal = 0;
  const endVal = parseInt(target);

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out expo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.floor(eased * (endVal - startVal) + startVal);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ── Intersection Observer for counters ──
const statNums = document.querySelectorAll('.stat-num');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, el.dataset.count);
      observer.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => observer.observe(el));



// ── Avatar: toggle mini profiles on click ──
const mainAvatarDiv  = document.getElementById('main-avatar');
const mainAvatarImg  = document.getElementById('main-avatar-img');
const avatarWrap     = document.getElementById('avatar-wrap');
const expandHint     = document.getElementById('expand-hint');
let profilesOpen     = false;

function openProfiles() {
  profilesOpen = true;
  avatarWrap.classList.add('profiles-open');
  expandHint.textContent = '✕';
  expandHint.title = 'Kapat';
}

function closeProfiles() {
  profilesOpen = false;
  avatarWrap.classList.remove('profiles-open');
  expandHint.textContent = '🕷';
  expandHint.title = 'Profilleri göster';
}

// Click on main avatar → toggle
mainAvatarDiv.addEventListener('click', (e) => {
  e.stopPropagation();
  if (profilesOpen) {
    closeProfiles();
  } else {
    // Quick spring pop on main avatar
    mainAvatarDiv.style.transform = 'scale(0.92)';
    setTimeout(() => {
      mainAvatarDiv.style.transform = 'scale(1.05)';
      setTimeout(() => { mainAvatarDiv.style.transform = ''; }, 200);
    }, 100);
    openProfiles();
  }
});

// Click outside → close
document.addEventListener('click', (e) => {
  if (profilesOpen && !avatarWrap.contains(e.target)) {
    closeProfiles();
  }
});

// Hover glitch — only when profiles closed
mainAvatarDiv.addEventListener('mouseenter', () => {
  if (profilesOpen) return;
  let frame = 0;
  const glitch = setInterval(() => {
    frame++;
    const shift = Math.random() * 3 - 1.5;
    mainAvatarDiv.style.filter = `hue-rotate(${Math.random() * 25}deg) saturate(1.4)`;
    mainAvatarDiv.style.transform = `scale(1.05) translate(${shift * 0.4}px, 0)`;
    if (frame > 5) {
      clearInterval(glitch);
      mainAvatarDiv.style.filter = '';
      mainAvatarDiv.style.transform = '';
    }
  }, 65);
});
mainAvatarDiv.addEventListener('mouseleave', () => {
  mainAvatarDiv.style.filter = '';
  mainAvatarDiv.style.transform = '';
});

// ── Mini Profile Swap ──
let currentMainSrc = mainAvatarImg.src;

document.querySelectorAll('.mini-pfp').forEach(mini => {
  mini.addEventListener('click', (e) => {
    e.stopPropagation();
    const miniImg   = mini.querySelector('img');
    const miniSrc   = miniImg.src;
    const prevMain  = currentMainSrc;

    // Animate out
    mainAvatarDiv.style.transition = 'transform 0.18s ease, opacity 0.18s ease';
    mainAvatarDiv.style.transform  = 'scale(0.82)';
    mainAvatarDiv.style.opacity    = '0.25';

    setTimeout(() => {
      mainAvatarImg.src = miniSrc;
      currentMainSrc    = miniSrc;
      miniImg.src       = prevMain;

      mainAvatarDiv.style.transform = 'scale(1.1)';
      mainAvatarDiv.style.opacity   = '1';

      setTimeout(() => {
        mainAvatarDiv.style.transform  = '';
        mainAvatarDiv.style.transition = '';
      }, 320);
    }, 170);

    // Micro-bounce the mini
    mini.style.transform = 'scale(0.75)';
    setTimeout(() => { mini.style.transform = ''; }, 220);
  });
});


// ── Link buttons: ripple effect ──
document.querySelectorAll('.link-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0; height: 0;
      background: rgba(255,45,120,0.25);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: rippleOut 0.6s ease-out forwards;
      pointer-events: none;
      z-index: 99;
    `;

    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleOut {
    to {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ── Cursor follower (subtle) ──
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,45,120,0.07) 0%, transparent 70%);
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 0;
  transition: left 0.15s ease, top 0.15s ease;
  mix-blend-mode: screen;
`;
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

// ── Top badge click ──
document.getElementById('top-badge').addEventListener('click', () => {
  const badge = document.getElementById('top-badge');
  badge.style.transform = 'scale(0.9)';
  setTimeout(() => badge.style.transform = '', 200);

  const messages = [
    'Into The Spider-Verse',
    '🕷️ Thwip!',
    'Earth-65 ✨',
    '♫ Let\'s go!',
    'Hey! That\'s me! 🎸',
  ];
  const el = badge.querySelector('span:last-child');
  el.textContent = messages[Math.floor(Math.random() * messages.length)];

  setTimeout(() => {
    el.textContent = 'Into The Spider-Verse';
  }, 2000);
});

// ── Comic panels: random tilt on hover ──
document.querySelectorAll('.comic-panel').forEach((panel, i) => {
  panel.addEventListener('mouseenter', () => {
    const tilt = i === 1 ? 1 : -1;
    panel.style.transform = `translateY(-4px) rotate(${tilt * (Math.random() * 2 + 1)}deg)`;
  });
  panel.addEventListener('mouseleave', () => {
    panel.style.transform = '';
  });
});

// ── Card: subtle tilt on mouse move ──
const card = document.querySelector('.card');

card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / rect.width;
  const dy = (e.clientY - cy) / rect.height;
  const rotX = dy * -6;
  const rotY = dx * 6;

  card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
});

card.addEventListener('mouseleave', () => {
  card.style.transform = '';
  card.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
  setTimeout(() => card.style.transition = '', 600);
});

// ── Keyboard Konami code easter egg ──
const konamiCode = [38,38,40,40,37,39,37,39,66,65];
let konamiProgress = 0;

document.addEventListener('keydown', (e) => {
  if (e.keyCode === konamiCode[konamiProgress]) {
    konamiProgress++;
    if (konamiProgress === konamiCode.length) {
      konamiProgress = 0;
      activateSpiderMode();
    }
  } else {
    konamiProgress = 0;
  }
});

function activateSpiderMode() {
  document.body.style.animation = 'spiderFlash 0.5s ease';
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spiderFlash {
      0%, 100% { filter: none; }
      25% { filter: hue-rotate(180deg) saturate(2) brightness(1.5); }
      75% { filter: hue-rotate(90deg) saturate(3) brightness(0.8); }
    }
  `;
  document.head.appendChild(style);
  setTimeout(() => document.body.style.animation = '', 500);
}

// ──────────────────────────────────────────
// SPOTIFY LIVE NOW-PLAYING (PKCE OAuth)
// ──────────────────────────────────────────

// ⚠️  Spotify Developer Dashboard'dan aldığın Client ID'yi buraya yaz:
const SPOTIFY_CLIENT_ID = 'SENIN_CLIENT_ID_BURAYA';

// Redirect URI — bu siteyi localhost üzerinden açmanı gerektirir (F5 değil, sunucu).
// Spotify Developer Dashboard'a tam olarak aynı URI ekle.
const SPOTIFY_REDIRECT_URI = window.location.origin + window.location.pathname;
const SPOTIFY_SCOPES = 'user-read-currently-playing user-read-playback-state';
const STORAGE_TOKEN  = 'sp_access_token';
const STORAGE_EXPIRY = 'sp_token_expiry';
const STORAGE_VERIF  = 'sp_code_verifier';

// ── PKCE helpers ──
async function spGenerateVerifier(len = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let s = '';
  crypto.getRandomValues(new Uint8Array(len)).forEach(v => s += chars[v % chars.length]);
  return s;
}

async function spGenerateChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function spStartAuth() {
  const verifier   = await spGenerateVerifier();
  const challenge  = await spGenerateChallenge(verifier);
  localStorage.setItem(STORAGE_VERIF, verifier);

  const p = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SPOTIFY_SCOPES,
    show_dialog: 'false',
  });
  window.location.href = 'https://accounts.spotify.com/authorize?' + p;
}

async function spExchangeToken(code) {
  const verifier = localStorage.getItem(STORAGE_VERIF);
  if (!verifier) return null;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  localStorage.setItem(STORAGE_TOKEN,  data.access_token);
  localStorage.setItem(STORAGE_EXPIRY, Date.now() + data.expires_in * 1000);
  localStorage.removeItem(STORAGE_VERIF);
  window.history.replaceState({}, '', window.location.pathname);
  return data.access_token;
}

function spGetToken() {
  const t = localStorage.getItem(STORAGE_TOKEN);
  const e = parseInt(localStorage.getItem(STORAGE_EXPIRY) || '0');
  return (t && Date.now() < e - 60000) ? t : null;
}

async function spFetchNowPlaying(token) {
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (res.status === 204 || res.status === 404) return null;
  if (!res.ok) return undefined;
  return res.json();
}

// ── UI ──
const elDisconnected = document.getElementById('np-disconnected');
const elPlaying      = document.getElementById('np-playing');
const elIdle         = document.getElementById('np-idle');

function spShowState(el) {
  [elDisconnected, elPlaying, elIdle].forEach(e => e.classList.add('np-state--hidden'));
  el.classList.remove('np-state--hidden');
}

function spUpdateUI(data) {
  const track = data?.item;
  if (!track) { spShowState(elIdle); return; }

  const name    = track.name;
  const artists = track.artists?.map(a => a.name).join(', ') || '—';
  const art     = track.album?.images?.[0]?.url;
  const url     = track.external_urls?.spotify;
  const playing = data?.is_playing;

  document.getElementById('np-track-name').textContent  = name;
  document.getElementById('np-artist-name').textContent = artists;
  document.getElementById('np-status-label').textContent = playing ? 'Şu an çalıyor' : 'Duraklatıldı';

  const openBtn = document.getElementById('np-open-btn');
  if (url) openBtn.href = url;

  const artWrap = document.getElementById('np-album-art');
  artWrap.querySelector('img')?.remove();
  if (art) {
    const img = Object.assign(document.createElement('img'), { src: art, alt: 'kapak' });
    artWrap.appendChild(img);
  }

  const np = document.getElementById('now-playing');
  np.classList.toggle('np-paused', !playing);
  spShowState(elPlaying);
}

let spPollId = null;

async function spStartPolling(token) {
  const poll = async () => {
    try {
      const d = await spFetchNowPlaying(token);
      if (d === undefined) { spLogout(); return; }
      spUpdateUI(d);
    } catch (e) { console.warn('Spotify poll:', e); }
  };
  await poll();
  spPollId = setInterval(poll, 30000);
}

function spLogout() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_EXPIRY);
  if (spPollId) clearInterval(spPollId);
  spShowState(elDisconnected);
}

async function spInit() {
  if (!SPOTIFY_CLIENT_ID || SPOTIFY_CLIENT_ID === 'SENIN_CLIENT_ID_BURAYA') return;

  const params = new URLSearchParams(window.location.search);
  const code  = params.get('code');
  const error = params.get('error');

  if (error) { window.history.replaceState({}, '', window.location.pathname); return; }

  let token = spGetToken();
  if (code && !token) token = await spExchangeToken(code);

  if (token) spStartPolling(token);
  else       spShowState(elDisconnected);
}

document.getElementById('np-connect-btn').addEventListener('click', () => {
  if (!SPOTIFY_CLIENT_ID || SPOTIFY_CLIENT_ID === 'SENIN_CLIENT_ID_BURAYA') {
    alert('⚠️  Önce script.js dosyasında\nSPOTIFY_CLIENT_ID değerini kendi Client ID\'inle değiştir!\n\n→ https://developer.spotify.com/dashboard');
    return;
  }
  spStartAuth();
});

document.getElementById('np-logout-btn').addEventListener('click', spLogout);

spInit();
