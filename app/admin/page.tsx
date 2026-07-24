'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

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

export default function AdminDashboard() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [albumError, setAlbumError] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addError, setAddError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [albumsRes, imagesRes] = await Promise.all([
      fetch('/api/admin/albums'),
      fetch('/api/admin/images'),
    ]);
    const albumsData = await albumsRes.json();
    const imagesData = await imagesRes.json();
    const loadedAlbums: Album[] = albumsData.albums || [];
    setAlbums(loadedAlbums);
    setImages(imagesData.images || []);
    setSelectedAlbumId((prev) => prev || loadedAlbums[0]?.id || '');
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateAlbum(e: FormEvent) {
    e.preventDefault();
    if (!albumName.trim()) return;
    setAlbumError('');
    const res = await fetch('/api/admin/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: albumName }),
    });
    const data = await res.json();
    if (data.ok) {
      setAlbumName('');
      await loadData();
      setSelectedAlbumId(data.album.id);
    } else {
      setAlbumError(data.error || 'Failed to create album');
    }
  }

  async function handleDeleteAlbum(id: string) {
    if (!confirm('Delete this album and all its photos? This cannot be undone.')) return;
    await fetch('/api/admin/albums', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (selectedAlbumId === id) setSelectedAlbumId('');
    loadData();
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!url) return;
    if (!selectedAlbumId) {
      setAddError('Create an album first, then choose it here.');
      return;
    }
    setAddError('');
    const res = await fetch('/api/admin/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, caption, albumId: selectedAlbumId }),
    });
    const data = await res.json();
    if (data.ok) {
      setUrl('');
      setCaption('');
      loadData();
    } else {
      setAddError(data.error || 'Failed to add image');
    }
  }

  async function handleDelete(id: string) {
    await fetch('/api/admin/images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadData();
  }

  async function handleSetPassword(e: FormEvent) {
    e.preventDefault();
    setPasswordMessage('');
    const res = await fetch('/api/admin/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json();
    setPasswordMessage(data.ok ? 'Gallery password updated ✅' : data.error);
    if (data.ok) setNewPassword('');
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (loading) {
    return (
      <main className="center-screen">
        <p className="muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="gallery-header">
        <h1>Admin Panel</h1>
        <button className="secondary" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <section className="card">
        <h2>Create an album</h2>
        <p className="muted">
          Albums are folders viewers see first, e.g. &quot;Anime Girls&quot; or
          &quot;Real Movie Photos&quot;. Add photos inside them below.
        </p>
        <form onSubmit={handleCreateAlbum} className="stack">
          <input
            type="text"
            placeholder="Album name, e.g. Anime Girls"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            required
          />
          {albumError && <p className="error">{albumError}</p>}
          <button type="submit">Create album</button>
        </form>
      </section>

      <section className="card">
        <h2>Add image via ImgBB link</h2>
        <p className="muted">
          Upload your photo on{' '}
          <a href="https://ibb.co/upload" target="_blank" rel="noreferrer">
            ibb.co/upload
          </a>{' '}
          then paste the &quot;Direct link&quot; here.
        </p>
        <form onSubmit={handleAdd} className="stack">
          <select
            value={selectedAlbumId}
            onChange={(e) => setSelectedAlbumId(e.target.value)}
            required
          >
            <option value="" disabled>
              {albums.length === 0 ? 'Create an album first' : 'Choose an album'}
            </option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <input
            type="url"
            placeholder="https://i.ibb.co/xxxxxxx/photo.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          {addError && <p className="error">{addError}</p>}
          <button type="submit" disabled={albums.length === 0}>
            Add image
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Gallery password</h2>
        <p className="muted">
          Set or change the password visitors need to view the gallery. Set this
          before sharing your site.
        </p>
        <form onSubmit={handleSetPassword} className="stack">
          <input
            type="text"
            placeholder="New gallery password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Save password</button>
        </form>
        {passwordMessage && <p className="muted">{passwordMessage}</p>}
      </section>

      <section>
        <h2>Albums ({albums.length})</h2>
        {albums.length === 0 ? (
          <p className="muted">No albums yet — create your first one above.</p>
        ) : (
          albums.map((album) => {
            const albumImages = images.filter((img) => img.albumId === album.id);
            return (
              <div key={album.id} className="admin-album-block">
                <div className="admin-album-header">
                  <h3>
                    {album.name}{' '}
                    <span className="muted">
                      ({albumImages.length} photo{albumImages.length === 1 ? '' : 's'})
                    </span>
                  </h3>
                  <button className="danger" onClick={() => handleDeleteAlbum(album.id)}>
                    Delete album
                  </button>
                </div>
                {albumImages.length === 0 ? (
                  <p className="muted">No photos in this album yet.</p>
                ) : (
                  <div className="grid">
                    {albumImages.map((img) => (
                      <div key={img.id} className="grid-item">
                        <img src={img.url} alt={img.caption || 'image'} />
                        {img.caption && <p className="caption">{img.caption}</p>}
                        <button className="danger" onClick={() => handleDelete(img.id)}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
