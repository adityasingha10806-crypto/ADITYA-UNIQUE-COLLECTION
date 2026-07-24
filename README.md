# Private Image Gallery (ImgBB + Vercel)

A password-protected photo gallery. You upload images to **ImgBB**, paste the
link into your own **Admin Panel**, and visitors need a password (that you set)
to view the gallery.

- **Public gallery** (`/`) — locked behind a password
- **Admin login** (`/admin/login`) — you log in with a username/password
- **Admin panel** (`/admin`) — add/delete images, set the gallery password

Images are just links (no file storage needed on your side). The image list
and passwords are stored in a free **Vercel KV** database so they persist.

---

## 1. Push this project to GitHub

1. Create a new empty repository on GitHub (e.g. `my-gallery`).
2. In this folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/my-gallery.git
   git push -u origin main
   ```

## 2. Import the project into Vercel

1. Go to https://vercel.com/new and import the GitHub repo you just pushed.
2. Framework preset should auto-detect as **Next.js**. Click **Deploy** (it's
   fine if the first deploy fails or the site errors — we still need to add
   environment variables and the database).

## 3. Add a free KV database (for storing images + passwords)

1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database** → choose **KV** (this may appear as an
   "Upstash for Redis" option depending on your Vercel account — either works).
3. Once created, click **Connect to Project** and select this project.
   Vercel will automatically add `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   to your project's environment variables.

## 4. Add the rest of the environment variables

In your Vercel project, go to **Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `ADMIN_USERNAME` | any username you want, e.g. `admin` |
| `ADMIN_PASSWORD` | a strong password only you know |
| `SESSION_SECRET` | any long random string (e.g. generate one at random) |

(`KV_REST_API_URL` / `KV_REST_API_TOKEN` were already added in step 3.)

Then go to the **Deployments** tab and **Redeploy** the latest deployment so
the new environment variables take effect.

## 5. Set your gallery password and add images

1. Visit `https://your-site.vercel.app/admin/login` and log in with the
   `ADMIN_USERNAME` / `ADMIN_PASSWORD` you set above.
2. In the admin panel:
   - Under **Gallery password**, set the password visitors will need.
   - Under **Add image via ImgBB link**:
     - Go to https://ibb.co/upload, upload your photo.
     - Copy the **"Direct link"** it gives you (looks like
       `https://i.ibb.co/xxxxxxx/photo.jpg`).
     - Paste it into the admin panel, add an optional caption, click **Add image**.
3. Visit your site's homepage (`/`) — it will ask for the gallery password
   before showing the images.

## Local development (optional)

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Note: locally you'll still need real `KV_REST_API_URL` / `KV_REST_API_TOKEN`
values (pull them from Vercel with `vercel env pull .env.local`, or just
develop directly against the deployed Vercel site).

## Notes

- Passwords are hashed (bcrypt) before being stored — nobody can read them
  back out of the database.
- Sessions are signed cookies (JWT) that expire automatically (admin: 12h,
  gallery visitors: 24h).
- To change the gallery password later, just log into `/admin` and set a new
  one — anyone with the old password will need the new one next time their
  session expires.
- To remove an image, click **Delete** under it in the admin panel.
