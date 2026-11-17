import { NextRequest, NextResponse } from 'next/server';
import { youtubeMusic } from '@/services/youtubeMusic';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const filter = searchParams.get('filter') || searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const results = await youtubeMusic.search(query, filter, isNaN(limit) ? 50 : Math.min(Math.max(limit, 1), 100));
    return NextResponse.json(results);
  } catch (err: any) {
    console.error('Error in /api/ytmusic/search:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to search YouTube Music' },
      { status: 500 }
    );
  }
}
