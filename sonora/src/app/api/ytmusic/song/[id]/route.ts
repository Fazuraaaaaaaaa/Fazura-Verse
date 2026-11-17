import { NextRequest, NextResponse } from 'next/server';
import { youtubeMusic } from '@/services/youtubeMusic';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    const songData = await youtubeMusic.getSong(id);
    if (!songData) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Include stream info for player engine
    const streamInfo = {
      youtubeId: songData.track.youtubeId || songData.track.id,
      streamType: 'youtube-iframe',
      embedUrl: `https://www.youtube-nocookie.com/embed/${songData.track.youtubeId || songData.track.id}?autoplay=1&enablejsapi=1`,
      watchUrl: `https://www.youtube.com/watch?v=${songData.track.youtubeId || songData.track.id}`,
    };

    return NextResponse.json({
      ...songData,
      streamInfo,
    });
  } catch (err: any) {
    console.error(`Error in /api/ytmusic/song/${params?.id}:`, err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch song details' },
      { status: 500 }
    );
  }
}
