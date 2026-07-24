'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type ImageItem = {
  id: string;
  url: string;
  caption: string;
  addedAt: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addError, setAddError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadImages() {
    const res = await fetch('/api/admin/images');
    const data = await res.json();
    setImages(data.images || []);
    setLoading(false);
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!url) return;
    setAddError('');
    const res = await fetch('/api/admin/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, caption }),
    });
    const data = await res.json();
    if (data.ok) {
      setUrl('');
      setCaption('');
      loadImages();
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
    loadImages();
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
        <h2>Add image via ImgBB link</h2>
        <p className="muted">
          Upload your photo on{' '}
          <a href="https://ibb.co/upload" target="_blank" rel="noreferrer">
            ibb.co/upload
          </a>{' '}
          then paste the &quot;Direct link&quot; here.
        </p>
        <form onSubmit={handleAdd} className="stack">
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
          <button type="submit">Add image</button>
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
        <h2>Images ({images.length})</h2>
        {images.length === 0 ? (
          <p className="muted">No images yet — add your first one above.</p>
        ) : (
          <div className="grid">
            {images.map((img) => (
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
      </section>
    </main>
  );
}
