'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';

type AlbumItem = {
  id: string;
  name: string;
  coverUrl: string | null;
  count: number;
};

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadAlbums() {
    setLoading(true);
    const res = await fetch('/api/gallery/albums');
    if (res.status === 401) {
      setNeedsPassword(true);
      setAlbums([]);
    } else {
      const data = await res.json();
      setAlbums(data.albums || []);
      setNeedsPassword(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAlbums();
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
    loadAlbums();
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
          {albums.length} album{albums.length === 1 ? '' : 's'}
        </span>
      </header>

      {albums.length === 0 ? (
        <p className="muted center">
          No albums yet. The admin can create one from the admin panel.
        </p>
      ) : (
        <div className="grid">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/gallery/${album.id}`}
              className="grid-item album-card"
            >
              {album.coverUrl ? (
                <img src={album.coverUrl} alt={album.name} loading="lazy" />
              ) : (
                <div className="album-empty-cover">No photos yet</div>
              )}
              <p className="caption album-caption">
                {album.name}
                <span className="muted album-count"> · {album.count} photo{album.count === 1 ? '' : 's'}</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
