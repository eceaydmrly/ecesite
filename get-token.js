/**
 * Spotify Refresh Token Alıcı — Tek Seferlik
 * Çalıştır: node get-token.js
 */
const http = require('http');
const { exec } = require('child_process');

const CLIENT_ID     = 'e19afd0e28eb4d3e8ba6bc95b3f8099a';
const CLIENT_SECRET = '64217286d2de4c02ac0429844b580bed';
const REDIRECT_URI  = 'http://127.0.0.1:8888/callback';
const SCOPES        = 'user-read-currently-playing user-read-playback-state';

const authUrl = `https://accounts.spotify.com/authorize?` +
  `client_id=${CLIENT_ID}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&show_dialog=true`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:8888`);

  if (url.pathname !== '/callback') {
    res.end('Bekliyor...');
    return;
  }

  const code  = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    res.end(`<h2>Hata: ${error}</h2>`);
    server.close();
    return;
  }

  // Token exchange
  const body = new URLSearchParams({
    grant_type:   'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  });

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    const data = await tokenRes.json();

    if (data.refresh_token) {
      console.log('\n✅ BAŞARILI! Refresh Token:');
      console.log('━'.repeat(60));
      console.log(data.refresh_token);
      console.log('━'.repeat(60));
      console.log('\nBu kodu not et — Vercel environment variable olarak ekleyeceğiz.\n');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <style>body{font-family:sans-serif;background:#0a0010;color:#fff;padding:40px;} 
        code{background:#1a0030;padding:12px;border-radius:8px;display:block;margin:16px 0;word-break:break-all;color:#ff2d78;}
        h2{color:#ff2d78;}</style>
        <h2>✅ Token alındı!</h2>
        <p>Bu pencereyi kapatabilirsin. Terminal'deki refresh token'ı kopyala:</p>
        <code>${data.refresh_token}</code>
      `);
    } else {
      res.end(`<pre>Hata: ${JSON.stringify(data, null, 2)}</pre>`);
    }
  } catch (e) {
    res.end(`<pre>Fetch hatası: ${e.message}</pre>`);
  }

  setTimeout(() => server.close(), 1000);
});

server.listen(8888, '127.0.0.1', () => {
  console.log('🎵 Spotify Token Alıcı başlatıldı...');
  console.log('📌 Önce Spotify Dashboard\'a şu URI\'yi ekle:');
  console.log('   http://127.0.0.1:8888/callback');
  console.log('\nEkledikten sonra Enter\'a bas...');
});

process.stdin.once('data', () => {
  console.log('\n🌐 Tarayıcı açılıyor...');
  const cmd = process.platform === 'win32'
    ? `start "" "${authUrl}"`
    : `open "${authUrl}"`;
  exec(cmd);
  console.log('Spotify\'da izin ver ve geri dön.\n');
});
