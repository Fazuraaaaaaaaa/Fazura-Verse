import { NextRequest, NextResponse } from 'next/server';
import { youtubeMusic } from '@/services/youtubeMusic';
import { FALLBACK_TRACKS } from '@/services/providers/fallbackData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId') || searchParams.get('id') || '';
    let title = searchParams.get('title') || undefined;
    let artist = searchParams.get('artist') || undefined;

    if (!trackId && !title) {
      return NextResponse.json({ error: 'trackId or title is required' }, { status: 400 });
    }

    if (!title && trackId) {
      const found = FALLBACK_TRACKS.find(t => t.id === trackId || t.youtubeId === trackId);
      if (found) {
        title = found.title;
        artist = found.artist;
      }
    }

    const lyrics = await youtubeMusic.getLyrics(trackId, title, artist);
    if (!lyrics) {
      return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
    }

    return NextResponse.json(lyrics);
  } catch (err: any) {
    console.error('Error in /api/ytmusic/lyrics:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch lyrics' },
      { status: 500 }
    );
  }
}
