export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      res.status(400).json({ success: false, error: 'Missing url parameter' });
      return;
    }

    let curr = targetUrl;
    for (let i = 0; i < 5; i++) {
      if (curr.includes('mega.nz/embed/')) break;
      if (curr.includes('mega.nz/file/')) {
        curr = curr.replace('mega.nz/file/', 'mega.nz/embed/');
        break;
      }
      const upstream = await fetch(curr, {
        redirect: 'manual',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      const loc = upstream.headers.get('location');
      if (!loc) break;
      curr = loc;
    }

    if (curr.includes('mega.nz/file/')) {
      curr = curr.replace('mega.nz/file/', 'mega.nz/embed/');
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ success: true, embedUrl: curr });
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ success: false, error: err.message || 'Resolve failed' });
  }
}
