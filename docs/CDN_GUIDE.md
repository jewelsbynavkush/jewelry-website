# CDN Guide – Static assets and images

Single guide for serving static assets (images) via CDN: options, setup, and migration.

---

## Quick start (GitHub + jsDelivr, ~5 min)

1. **Create a public GitHub repo** (e.g. `jewelry-assets`).
2. **Upload images**: upload your `public/assets/` folder into the repo (e.g. as `assets/` in the repo root).
3. **Configure `.env.local`:**

   ```env
   NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/YOUR_USERNAME/jewelry-assets@main
   CDN_PROVIDER=jsdelivr
   ```

4. Restart dev server; images will load from jsDelivr (unlimited bandwidth, no rate limit).

**Direct GitHub raw URLs** are also supported but rate-limited (60 req/hour per IP). Use `CDN_PROVIDER=github` and `NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/YOUR_USERNAME/jewelry-assets/main`. Prefer jsDelivr for production.

---

## CDN options comparison

| Option | Free tier | Pros | Best for |
|--------|-----------|------|----------|
| **Cloudinary** | 25GB storage, 25GB bandwidth/mo | Image optimization, WebP/AVIF, transforms | Image-heavy sites |
| **ImageKit** | 20GB storage, 20GB bandwidth/mo | Real-time optimization, Next.js integration | Next.js + images |
| **GitHub + jsDelivr** | Unlimited (public repos) | Free, no account for public repo, fast CDN | Open source / public repos |
| **Direct GitHub raw** | Rate limited (60 req/hour per IP) | Simple, no third-party | Testing only |
| **Cloudflare R2** | 10GB storage, 1M Class A ops/mo | No egress fees, S3-compatible | Cost-effective scale |
| **Vercel Blob** | 1GB storage, 100GB bandwidth/mo | Native Next.js, auto CDN | Already on Vercel |

**Recommendation for this project:** Cloudinary or ImageKit for optimization; GitHub + jsDelivr for zero cost and simplicity if the repo is public.

---

## Implementation

### Cloudinary

1. Sign up at https://cloudinary.com/users/register/free
2. Dashboard → Settings → Product Environment Credentials
3. Upload images via Media Library or API
4. Environment variables:

   ```env
   NEXT_PUBLIC_CDN_BASE_URL=https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload
   CDN_PROVIDER=cloudinary
   ```

### ImageKit

1. Sign up at https://imagekit.io/registration/
2. Dashboard → URL Endpoint; upload via Media Library
3. Environment variables:

   ```env
   NEXT_PUBLIC_CDN_BASE_URL=https://ik.imagekit.io/YOUR_IMAGEKIT_ID
   CDN_PROVIDER=imagekit
   ```

### GitHub + jsDelivr (detailed)

1. Create a **public** repo; put images in an `assets/` folder (mirror structure of `public/assets/`).
2. jsDelivr URL format: `https://cdn.jsdelivr.net/gh/USER/REPO@BRANCH` (e.g. `@main`).
3. Example: `https://cdn.jsdelivr.net/gh/johndoe/jewelry-assets@main/assets/products/ring.png`
4. Environment variables: see [Quick start](#quick-start-github--jsdelivr-5-min) above.

### Cloudflare R2

1. Create R2 bucket and API token in Cloudflare dashboard
2. Upload images; optionally attach custom domain
3. Environment variables:

   ```env
   NEXT_PUBLIC_CDN_BASE_URL=https://YOUR_BUCKET.r2.dev
   CDN_PROVIDER=r2
   ```

---

## Migration process

1. List images (if you have a script): `tsx scripts/migrate-to-cdn.ts list` (or equivalent).
2. Upload all images from `public/assets/` to the chosen CDN, keeping the same folder structure.
3. Set `NEXT_PUBLIC_CDN_BASE_URL` and `CDN_PROVIDER` in `.env` (see `.env.example`).
4. Restart dev server; confirm images load from CDN (e.g. Network tab in DevTools).
5. The app converts local paths to CDN URLs via `getCDNUrl()`; no manual path updates in DB/JSON required unless you want to store full CDN URLs.
6. Keep local copies as backup.

---

## URL structure

- **Before:** `/assets/products/rings/elegant-gold-ring.png`
- **After (examples):**
  - Cloudinary: `https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/products/rings/elegant-gold-ring.png`
  - ImageKit: `https://ik.imagekit.io/YOUR_ID/products/rings/elegant-gold-ring.png`
  - jsDelivr: `https://cdn.jsdelivr.net/gh/USER/REPO@main/assets/products/rings/elegant-gold-ring.png`

See `lib/utils/cdn.ts` for how base URL and provider are used.
