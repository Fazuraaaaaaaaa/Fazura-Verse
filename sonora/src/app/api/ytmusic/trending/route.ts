import { NextResponse } from 'next/server';
import { youtubeMusic } from '@/services/youtubeMusic';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const trending = await youtubeMusic.getTrending();
    return NextResponse.json(trending);
  } catch (err: any) {
    console.error('Error in /api/ytmusic/trending:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch trending music' },
      { status: 500 }
    );
  }
}
