import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

type ImageItem = {
  id: string;
  url: string;
  caption: string;
  addedAt: string;
};

export async function GET() {
  const images = (await kv.get<ImageItem[]>('gallery_images')) || [];
  return NextResponse.json({ ok: true, images });
}

export async function POST(req: NextRequest) {
  const { url, caption } = await req.json();

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return NextResponse.json(
      { ok: false, error: 'A valid image URL is required (paste the direct link from ImgBB).' },
      { status: 400 }
    );
  }

  const images = (await kv.get<ImageItem[]>('gallery_images')) || [];

  const newImage: ImageItem = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
    url,
    caption: typeof caption === 'string' ? caption : '',
    addedAt: new Date().toISOString(),
  };

  images.unshift(newImage);
  await kv.set('gallery_images', images);

  return NextResponse.json({ ok: true, image: newImage });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const images = (await kv.get<ImageItem[]>('gallery_images')) || [];
  const filtered = images.filter((img) => img.id !== id);
  await kv.set('gallery_images', filtered);

  return NextResponse.json({ ok: true });
}
