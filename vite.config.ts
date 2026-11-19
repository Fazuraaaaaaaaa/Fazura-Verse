import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

function imageProxyPlugin(): Plugin {
  const handler = async (req: any, res: any) => {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const targetUrl = urlObj.searchParams.get('url');
      if (!targetUrl) {
        res.statusCode = 400;
        res.end('Missing url parameter');
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

      res.statusCode = upstream.status;
      const contentType = upstream.headers.get('content-type') || 'image/webp';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      const arrBuf = await upstream.arrayBuffer();
      res.end(Buffer.from(arrBuf));
    } catch (err: any) {
      res.statusCode = 500;
      res.end(err.message || 'Proxy error');
    }
  };

  return {
    name: 'image-proxy-middleware',
    configureServer(server) {
      server.middlewares.use('/api/image-proxy', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/image-proxy', handler);
    },
  };
}

function megaProxyPlugin(): Plugin {
  const handler = async (req: any, res: any) => {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const targetUrl = urlObj.searchParams.get('url');
      if (!targetUrl) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Missing url parameter' }));
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

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({ success: true, embedUrl: curr }));
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: err.message || 'Resolve failed' }));
    }
  };

  return {
    name: 'mega-proxy-middleware',
    configureServer(server) {
      server.middlewares.use('/api/resolve-mega', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/resolve-mega', handler);
    },
  };
}

function ytSearchPlugin(): Plugin {
  const handler = async (req: any, res: any) => {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const q = urlObj.searchParams.get('q');
      if (!q) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing query parameter q' }));
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
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Upstream YouTube search error' }));
        return;
      }

      const html = await upstream.text();
      const matches = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/g) || [];
      const videoIds = Array.from(new Set(matches.map((m: string) => m.replace('/watch?v=', ''))));

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.end(
        JSON.stringify({
          query: q,
          videoId: videoIds[0] || null,
          videoIds: videoIds.slice(0, 5),
        })
      );
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message || 'Internal resolver error' }));
    }
  };

  return {
    name: 'yt-search-middleware',
    configureServer(server) {
      server.middlewares.use('/api/yt-search', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/yt-search', handler);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), imageProxyPlugin(), megaProxyPlugin(), ytSearchPlugin()],
})
