import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';

type Album = {
  id: string;
  name: string;
  createdAt: string;
};

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

  const albums = (await kv.get<Album[]>('gallery_albums')) || [];
  const images = (await kv.get<ImageItem[]>('gallery_images')) || [];

  const albumsWithMeta = albums.map((album) => {
    const albumImages = images.filter((img) => img.albumId === album.id);
    return {
      id: album.id,
      name: album.name,
      createdAt: album.createdAt,
      coverUrl: albumImages[0]?.url || null,
      count: albumImages.length,
    };
  });

  // Any image saved before albums existed (or pointing at a deleted album)
  // gets grouped into a virtual "Uncategorized" album so nothing is hidden.
  const knownAlbumIds = new Set(albums.map((a) => a.id));
  const uncategorized = images.filter(
    (img) => !img.albumId || !knownAlbumIds.has(img.albumId)
  );
  if (uncategorized.length > 0) {
    albumsWithMeta.push({
      id: 'uncategorized',
      name: 'Uncategorized',
      createdAt: '',
      coverUrl: uncategorized[0].url,
      count: uncategorized.length,
    });
  }

  return NextResponse.json({ ok: true, albums: albumsWithMeta });
}
