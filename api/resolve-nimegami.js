export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      res.status(400).json({ success: false, error: 'Missing url parameter' });
      return;
    }

    // If already direct video or stream, return immediately
    if (
      targetUrl.endsWith('.mp4') ||
      targetUrl.includes('.mp4?') ||
      targetUrl.includes('stream-stor') ||
      targetUrl.includes('berkasdrive.com/v/')
    ) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).json({ success: true, streamUrl: targetUrl });
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

    const dataSrcMatch = text.match(/data-src=["']([^"']+)["']/i);
    if (dataSrcMatch && dataSrcMatch[1] && dataSrcMatch[1].startsWith('http')) {
      streamUrl = dataSrcMatch[1];
    } else {
      const iframeMatch = text.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      if (iframeMatch && iframeMatch[1] && iframeMatch[1].startsWith('http')) {
        streamUrl = iframeMatch[1];
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
