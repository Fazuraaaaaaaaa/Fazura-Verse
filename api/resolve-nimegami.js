export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      res.status(400).json({ success: false, error: 'Missing url parameter' });
      return;
    }

    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const text = await upstream.text();
    let streamUrl = targetUrl;

    const part = text.split('data-src=')[1];
    if (part) {
      const quote = part[0];
      const direct = part.slice(1).split(quote)[0];
      if (direct && direct.startsWith('http')) {
        streamUrl = direct;
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json({ success: true, streamUrl });
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ success: false, error: err.message || 'Resolve failed' });
  }
}
