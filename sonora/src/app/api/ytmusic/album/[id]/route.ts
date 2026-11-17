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
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
    }

    const album = await youtubeMusic.getAlbum(id);
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json(album);
  } catch (err: any) {
    console.error(`Error in /api/ytmusic/album/${params?.id}:`, err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch album details' },
      { status: 500 }
    );
  }
}
