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
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
    }

    const playlist = await youtubeMusic.getPlaylist(id);
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json(playlist);
  } catch (err: any) {
    console.error(`Error in /api/ytmusic/playlist/${params?.id}:`, err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch playlist details' },
      { status: 500 }
    );
  }
}
