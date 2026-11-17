import { NextRequest, NextResponse } from 'next/server';
import { youtubeMusic } from '@/services/youtubeMusic';
import { FALLBACK_ARTISTS } from '@/services/providers/fallbackData';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    const artist = await youtubeMusic.getArtist(id);
    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Ensure relatedArtists and singles are populated if missing
    const relatedArtists =
      artist.relatedArtists && artist.relatedArtists.length > 0
        ? artist.relatedArtists
        : FALLBACK_ARTISTS.filter(a => a.id !== artist.id).slice(0, 6);

    const albums = artist.albums || [];
    const singles =
      artist.singles ||
      albums.filter(a => a.type === 'single').length > 0
        ? albums.filter(a => a.type === 'single')
        : albums.slice(0, 2);

    return NextResponse.json({
      ...artist,
      singles,
      relatedArtists,
    });
  } catch (err: any) {
    console.error(`Error in /api/ytmusic/artist/${params?.id}:`, err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch artist profile' },
      { status: 500 }
    );
  }
}
