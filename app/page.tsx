'use client';

import { useEffect, useState, FormEvent } from 'react';

type ImageItem = {
  id: string;
  url: string;
  caption: string;
  addedAt: string;
};

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState<ImageItem | null>(null);

  async function loadImages() {
    setLoading(true);
    const res = await fetch('/api/gallery/images');
    if (res.status === 401) {
      setNeedsPassword(true);
      setImages([]);
    } else {
      const data = await res.json();
      setImages(data.images || []);
      setNeedsPassword(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await fetch('/api/gallery/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!data.ok) {
      setError(data.error || 'Incorrect password');
      return;
    }
    setPassword('');
    loadImages();
  }

  if (loading) {
    return (
      <main className="center-screen">
        <p className="muted">Loading gallery…</p>
      </main>
    );
  }

  if (needsPassword) {
    return (
      <main className="center-screen">
        <form onSubmit={handleUnlock} className="card">
          <h1>🔒 Private Gallery</h1>
          <p className="muted">Enter the password to view this gallery.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="gallery-page">
      <header className="gallery-header">
        <h1>📷 My Gallery</h1>
        <span className="muted">
          {images.length} photo{images.length === 1 ? '' : 's'}
        </span>
      </header>

      {images.length === 0 ? (
        <p className="muted center">
          No images yet. The admin can add some from the admin panel.
        </p>
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
