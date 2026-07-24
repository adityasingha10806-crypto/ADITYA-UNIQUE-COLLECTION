'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type ImageItem = {
  id: string;
  url: string;
  caption: string;
  albumId: string;
  addedAt: string;
};

export default function AlbumPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.albumId as string;

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [lightbox, setLightbox] = useState<ImageItem | null>(null);

  async function loadImages() {
    setLoading(true);
    const [imgRes, albumsRes] = await Promise.all([
      fetch(`/api/gallery/images?albumId=${encodeURIComponent(albumId)}`),
      fetch('/api/gallery/albums'),
    ]);
    if (imgRes.status === 401) {
      router.push('/');
      return;
    }
    const imgData = await imgRes.json();
    setImages(imgData.images || []);

    if (albumsRes.ok) {
      const albumsData = await albumsRes.json();
      const match = (albumsData.albums || []).find((a: { id: string }) => a.id === albumId);
      setAlbumName(match?.name || 'Album');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  if (loading) {
    return (
      <main className="center-screen">
        <p className="muted">Loading album…</p>
      </main>
    );
  }

  return (
    <main className="gallery-page">
      <header className="gallery-header">
        <div>
          <Link href="/" className="muted back-link">
            ← All albums
          </Link>
          <h1>{albumName}</h1>
          <span className="muted">
            {images.length} photo{images.length === 1 ? '' : 's'}
          </span>
        </div>
      </header>

      {images.length === 0 ? (
        <p className="muted center">This album has no photos yet.</p>
      ) : (
        <div className="grid">
          {images.map((img) => (
            <div key={img.id} className="grid-item" onClick={() => setLightbox(img)}>
              <img src={img.url} alt={img.caption || 'Gallery image'} loading="lazy" />
              {img.caption && <p className="caption">{img.caption}</p>}
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt={lightbox.caption || 'Gallery image'} />
          {lightbox.caption && <p className="caption">{lightbox.caption}</p>}
        </div>
      )}
    </main>
  );
}
