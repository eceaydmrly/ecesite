/**
 * Vercel Serverless Function — /api/now-playing
 * CommonJS formatı (Vercel Node.js runtime için)
 */

const CLIENT_ID     = (process.env.SPOTIFY_CLIENT_ID     || '').trim();
const CLIENT_SECRET = (process.env.SPOTIFY_CLIENT_SECRET || '').trim();
const REFRESH_TOKEN = (process.env.SPOTIFY_REFRESH_TOKEN || '').trim();

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization:  `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }).toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const { access_token } = await getAccessToken();

    const response = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: { Authorization: `Bearer ${access_token}` },
        cache: 'no-store'
      }
    );

    // 204 = hiçbir şey çalmıyor
    if (response.status === 204) {
      return res.status(200).json({ isPlaying: false });
    }

    if (!response.ok) {
      return res.status(200).json({ isPlaying: false, error: response.status });
    }

    const data = await response.json();

    if (!data || !data.item) {
      return res.status(200).json({ isPlaying: false });
    }

    return res.status(200).json({
      isPlaying:  data.is_playing,
      title:      data.item.name,
      artist:     data.item.artists.map(a => a.name).join(', '),
      album:      data.item.album.name,
      albumImage: data.item.album.images[0]?.url ?? null,
      songUrl:    data.item.external_urls.spotify,
    });

  } catch (err) {
    console.error('now-playing error:', err.message);
    return res.status(200).json({ isPlaying: false, error: err.message });
  }
};
