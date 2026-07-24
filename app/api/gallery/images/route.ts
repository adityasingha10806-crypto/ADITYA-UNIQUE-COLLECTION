import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';

type ImageItem = {
  id: string;
  url: string;
  caption: string;
  albumId: string;
  addedAt: string;
};

export async function GET(req: NextRequest) {
  const galleryToken = req.cookies.get('gallery_session')?.value;
  const adminToken = req.cookies.get('admin_session')?.value;

  const galleryPayload = galleryToken ? await verifySession(galleryToken) : null;
  const adminPayload = adminToken ? await verifySession(adminToken) : null;

  const hasGalleryAccess = galleryPayload?.role === 'gallery';
  const hasAdminAccess = adminPayload?.role === 'admin';

  if (!hasGalleryAccess && !hasAdminAccess) {
    return NextResponse.json({ ok: false, error: 'Password required' }, { status: 401 });
  }

  const albumId = req.nextUrl.searchParams.get('albumId');
  const images = (await kv.get<ImageItem[]>('gallery_images')) || [];

  const filtered = albumId
    ? albumId === 'uncategorized'
      ? images.filter((img) => !img.albumId)
      : images.filter((img) => img.albumId === albumId)
    : images;

  return NextResponse.json({ ok: true, images: filtered });
}
