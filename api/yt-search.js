export default async function handler(req, res) {
  try {
    const q = req.query.q;
    if (!q) {
      res.status(400).json({ error: 'Missing query parameter q' });
      return;
    }

    const searchUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
    const upstream = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!upstream.ok) {
      res.status(502).json({ error: 'Upstream YouTube search error' });
      return;
    }

    const html = await upstream.text();
    const matches = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/g) || [];
    const videoIds = Array.from(new Set(matches.map((m) => m.replace('/watch?v=', ''))));

    res.status(200);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.json({
      query: q,
      videoId: videoIds[0] || null,
      videoIds: videoIds.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal resolver error' });
  }
}
