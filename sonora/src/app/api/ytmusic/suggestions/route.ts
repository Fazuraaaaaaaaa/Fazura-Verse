import { NextRequest, NextResponse } from 'next/server';
import { youtubeMusic } from '@/services/youtubeMusic';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';

    const suggestions = await youtubeMusic.getSearchSuggestions(query);
    return NextResponse.json({
      query,
      suggestions,
    });
  } catch (err: any) {
    console.error('Error in /api/ytmusic/suggestions:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
}
