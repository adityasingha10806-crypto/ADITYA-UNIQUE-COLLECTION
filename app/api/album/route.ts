import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

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

export async function GET() {
  const albums = (await kv.get<Album[]>('gallery_albums')) || [];
  return NextResponse.json({ ok: true, albums });
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json(
      { ok: false, error: 'Album name is required.' },
      { status: 400 }
    );
  }

  const albums = (await kv.get<Album[]>('gallery_albums')) || [];

  const newAlbum: Album = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  albums.unshift(newAlbum);
  await kv.set('gallery_albums', albums);

  return NextResponse.json({ ok: true, album: newAlbum });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const albums = (await kv.get<Album[]>('gallery_albums')) || [];
  const filtered = albums.filter((a) => a.id !== id);
  await kv.set('gallery_albums', filtered);

  // Cascade: also delete every image that belonged to this album
  const images = (await kv.get<ImageItem[]>('gallery_images')) || [];
  const remainingImages = images.filter((img) => img.albumId !== id);
  await kv.set('gallery_images', remainingImages);

  return NextResponse.json({ ok: true });
}
