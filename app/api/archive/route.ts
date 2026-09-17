import { NextRequest, NextResponse } from 'next/server';
import { getArchiveManifest, getSearchIndex } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeIndex = searchParams.get('includeIndex') === 'true';

    const manifest = getArchiveManifest();

    if (includeIndex) {
      const searchIndex = getSearchIndex();
      return NextResponse.json({
        success: true,
        manifest,
        searchIndex,
      });
    }

    return NextResponse.json({
      success: true,
      manifest,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
