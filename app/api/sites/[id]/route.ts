import { NextRequest, NextResponse } from 'next/server';
import * as SitesBFF from '@/lib/bff/sites';

/**
 * GET /api/sites/[id]
 *
 * Returns a specific site with its links
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const siteWithLinks = await SitesBFF.getSiteWithLinks(siteId);

    if (!siteWithLinks) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(siteWithLinks);
  } catch (error) {
    const { id } = await params;
    console.error(`Error fetching site ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
}
