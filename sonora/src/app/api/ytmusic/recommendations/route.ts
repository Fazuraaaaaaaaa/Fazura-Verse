import { NextRequest, NextResponse } from 'next/server';
import { youtubeMusic } from '@/services/youtubeMusic';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seedTrack = searchParams.get('seedTrack') || searchParams.get('seedTrackId') || undefined;
    const genre = searchParams.get('genre') || undefined;
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    const recs = await youtubeMusic.getRecommendations(seedTrack, genre, isNaN(limit) ? 15 : limit);
    return NextResponse.json(recs);
  } catch (err: any) {
    console.error('Error in /api/ytmusic/recommendations:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
