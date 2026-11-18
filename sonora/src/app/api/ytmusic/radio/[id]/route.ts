import { NextRequest, NextResponse } from 'next/server';
import { youtubeMusic } from '@/services/youtubeMusic';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const seedTrackId = params.id;
    if (!seedTrackId) {
      return NextResponse.json({ error: 'Seed track ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const station = await youtubeMusic.getRadioStation(seedTrackId, isNaN(limit) ? 30 : limit);
    if (!station) {
      return NextResponse.json({ error: 'Could not generate radio station' }, { status: 404 });
    }

    return NextResponse.json(station);
  } catch (err: any) {
    console.error(`Error in /api/ytmusic/radio/${params?.id}:`, err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate radio station' },
      { status: 500 }
    );
  }
}
