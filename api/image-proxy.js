export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      res.status(400).send('Missing url parameter');
      return;
    }

    const parsedTarget = new URL(targetUrl);
    const upstream = await fetch(targetUrl, {
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `${parsedTarget.origin}/`,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type') || 'image/webp';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const arrBuf = await upstream.arrayBuffer();
    res.send(Buffer.from(arrBuf));
  } catch (err) {
    res.status(500).send(err.message || 'Proxy error');
  }
}
