export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      res.status(400).json({ success: false, error: 'Missing url parameter' });
      return;
    }

    const trimmed = targetUrl.trim();

    // 1. Direct stream check
    if (
      trimmed.endsWith('.mp4') ||
      trimmed.includes('.mp4?') ||
      trimmed.endsWith('.m3u8') ||
      trimmed.includes('.m3u8?')
    ) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).json({ success: true, streamUrl: trimmed, type: trimmed.includes('.m3u8') ? 'hls' : 'mp4' });
      return;
    }

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://otakudesu.cloud/',
    };

    // 2. Desustream resolver
    if (trimmed.includes('desustream.net')) {
      const upstream = await fetch(trimmed, { headers });
      if (upstream.ok) {
        const html = await upstream.text();
        const mp4Match = html.match(/https?:\/\/[^\s"'`]+\.mp4[^\s"'`]*/);
        if (mp4Match) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.status(200).json({ success: true, streamUrl: mp4Match[0], type: 'mp4' });
          return;
        }
        const m3u8Match = html.match(/https?:\/\/[^\s"'`]+\.m3u8[^\s"'`]*/);
        if (m3u8Match) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.status(200).json({ success: true, streamUrl: m3u8Match[0], type: 'hls' });
          return;
        }
      }
    }

    // 3. VidHide / FileDon / EarnVids resolver (Unpack packer script)
    if (
      trimmed.includes('vidhide') ||
      trimmed.includes('filedon') ||
      trimmed.includes('earnvids') ||
      trimmed.includes('/embed/') ||
      trimmed.includes('/v/')
    ) {
      const upstream = await fetch(trimmed, { headers });
      if (upstream.ok) {
        const html = await upstream.text();
        const evalIdx = html.indexOf('eval(function(p,a,c,k,e,d)');
        if (evalIdx !== -1) {
          const scriptEnd = html.indexOf('</script>', evalIdx);
          const scriptPart = (scriptEnd !== -1 ? html.slice(evalIdx, scriptEnd) : html.slice(evalIdx)).trim();
          try {
            const unpackFn = new Function(scriptPart.replace(/^eval/, 'return'));
            const unpacked = unpackFn();
            if (typeof unpacked === 'string') {
              const m3u8Matches = unpacked.match(/https?:\/\/[^\s"'`]+\.m3u8[^\s"'`]*/g);
              if (m3u8Matches && m3u8Matches.length > 0) {
                const best =
                  m3u8Matches.find((u) => u.includes('master') || u.includes('hls')) || m3u8Matches[0];
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                res.status(200).json({ success: true, streamUrl: best, type: 'hls' });
                return;
              }
              const mp4Matches = unpacked.match(/https?:\/\/[^\s"'`]+\.mp4[^\s"'`]*/g);
              if (mp4Matches && mp4Matches.length > 0) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                res.status(200).json({ success: true, streamUrl: mp4Matches[0], type: 'mp4' });
                return;
              }
            }
          } catch (unpackErr) {
            console.warn('Packer unpack error:', unpackErr);
          }
        }
      }
    }

    // Fallback: unable to extract direct stream, client should use iframe
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ success: false, fallbackUrl: trimmed });
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ success: false, error: err.message || 'Resolve failed' });
  }
}
