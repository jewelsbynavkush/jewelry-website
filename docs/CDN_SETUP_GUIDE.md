# CDN Setup Guide for Static Assets

## Free CDN Options Comparison

### 1. **Cloudinary** (Recommended for Images)
- **Free Tier:** 25GB storage, 25GB bandwidth/month
- **Pros:**
  - Automatic image optimization (WebP, AVIF conversion)
  - Responsive image transformations
  - Built-in image manipulation API
  - Free tier is generous
- **Cons:**
  - Requires account setup
  - API-based uploads
- **Best For:** Image-heavy sites with optimization needs

### 2. **ImageKit** (Recommended for Images)
- **Free Tier:** 20GB storage, 20GB bandwidth/month
- **Pros:**
  - Real-time image optimization
  - URL-based transformations
  - Good Next.js integration
  - Free tier includes CDN
- **Cons:**
  - Slightly less storage than Cloudinary
- **Best For:** Next.js projects needing image optimization

### 3. **GitHub + jsDelivr** (Recommended for Simplicity)
- **Free Tier:** Unlimited bandwidth (public repos)
- **Pros:**
  - Completely free
  - No account needed (for public repos)
  - Unlimited bandwidth
  - Easy to update (just push to GitHub)
  - Fast global CDN
- **Cons:**
  - Requires public repository
  - No built-in image optimization
  - Manual upload process
- **Best For:** Open source projects or public repos

### 3b. **Direct GitHub Raw URLs** (Alternative)
- **Free Tier:** Free but rate limited (60 requests/hour)
- **Pros:**
  - Simple - direct from GitHub
  - No third-party service
  - Works immediately
- **Cons:**
  - Rate limiting (60 requests/hour per IP)
  - Slower (not optimized for CDN)
  - No caching
- **Best For:** Small projects, testing, or if you prefer no third-party
- **Note:** jsDelivr is recommended over direct GitHub for production

### 4. **Cloudflare R2** (Recommended for Cost-Effective)
- **Free Tier:** 10GB storage, 1M Class A operations/month
- **Pros:**
  - No egress fees (free bandwidth)
  - S3-compatible API
  - Integrates with Cloudflare CDN
  - Very cost-effective
- **Cons:**
  - Lower free storage limit
  - Requires Cloudflare account
- **Best For:** Long-term cost savings

### 5. **Vercel Blob Storage**
- **Free Tier:** 1GB storage, 100GB bandwidth/month
- **Pros:**
  - Native Next.js integration
  - Automatic CDN
  - Easy setup if using Vercel
- **Cons:**
  - Limited free storage
- **Best For:** Projects already on Vercel

### 6. **Supabase Storage**
- **Free Tier:** 1GB storage, 2GB bandwidth/month
- **Pros:**
  - Simple API
  - Good documentation
- **Cons:**
  - Very limited free tier
- **Best For:** Projects already using Supabase

## Recommendation

**For this jewelry website:**
1. **Primary Choice:** Cloudinary or ImageKit (for image optimization)
2. **Alternative:** GitHub + jsDelivr (if repo is public and you want zero cost)
3. **Long-term:** Cloudflare R2 (best value as you scale)

## Implementation Steps

### Option A: Cloudinary Setup

1. **Sign up:** https://cloudinary.com/users/register/free
2. **Get credentials:** Dashboard → Settings → Product Environment Credentials
3. **Upload images:** Use Media Library or API
4. **Configure environment variables:**
   ```env
   NEXT_PUBLIC_CDN_BASE_URL=https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload
   CDN_PROVIDER=cloudinary
   ```

### Option B: ImageKit Setup

1. **Sign up:** https://imagekit.io/registration/
2. **Get URL Endpoint:** Dashboard → URL Endpoint
3. **Upload images:** Use Media Library
4. **Configure environment variables:**
   ```env
   NEXT_PUBLIC_CDN_BASE_URL=https://ik.imagekit.io/YOUR_IMAGEKIT_ID
   CDN_PROVIDER=imagekit
   ```

### Option C: GitHub Setup (jsDelivr or Direct)

**📖 See detailed guide:** [GitHub Setup Guide](./CDN_GITHUB_JSDELIVR_SETUP.md)  
**📊 Compare options:** [Direct GitHub vs jsDelivr](./CDN_GITHUB_DIRECT_VS_JSDELIVR.md)

**Quick Steps:**
1. **Create public repo** on GitHub (or use existing)
2. **Upload images** to `assets/` folder in repo (maintain folder structure from `public/assets/`)

3. **Choose option:**

   **Option A: jsDelivr (Recommended)**
   ```env
   NEXT_PUBLIC_CDN_BASE_URL=https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main
   CDN_PROVIDER=jsdelivr
   ```
   Test: `https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/assets/products/rings/elegant-gold-ring.png`

   **Option B: Direct GitHub (Simple, but rate limited)**
   ```env
   NEXT_PUBLIC_CDN_BASE_URL=https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main
   CDN_PROVIDER=github
   ```
   Test: `https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/assets/products/rings/elegant-gold-ring.png`

### Option D: Cloudflare R2 Setup

1. **Sign up:** https://dash.cloudflare.com/
2. **Create R2 bucket:** R2 → Create bucket
3. **Get credentials:** R2 → Manage R2 API Tokens
4. **Upload images:** Use R2 API or dashboard
5. **Configure custom domain** (optional, for better URLs)
6. **Configure environment variables:**
   ```env
   NEXT_PUBLIC_CDN_BASE_URL=https://YOUR_BUCKET.r2.dev
   CDN_PROVIDER=r2
   ```

## Migration Process

1. **List all images:**
   ```bash
   tsx scripts/migrate-to-cdn.ts list
   ```

2. **Generate CDN URL mappings:**
   ```bash
   # Set environment variables first
   export NEXT_PUBLIC_CDN_BASE_URL="https://res.cloudinary.com/YOUR_CLOUD/image/upload"
   export CDN_PROVIDER="cloudinary"
   tsx scripts/migrate-to-cdn.ts generate-mapping
   ```

3. **Upload images to CDN:**
   - Upload all images from `public/assets/` to your CDN
   - Maintain the same folder structure
   - Verify a few URLs work correctly

4. **Configure environment variables:**
   - Add `NEXT_PUBLIC_CDN_BASE_URL` and `CDN_PROVIDER` to your `.env` file
   - See `.env.example` for format

5. **Test the setup:**
   - Restart your dev server
   - Check that images load from CDN
   - Verify in browser DevTools Network tab

6. **Update database/product JSON files (if needed):**
   - The code automatically converts local paths to CDN URLs
   - No manual updates needed unless you want to store full CDN URLs

7. **Keep local images as backup** (recommended)

## URL Structure

After migration, image URLs will change from:
- `/assets/products/rings/elegant-gold-ring.png`

To:
- `https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/products/rings/elegant-gold-ring.png`
- Or: `https://ik.imagekit.io/YOUR_ID/products/rings/elegant-gold-ring.png`
- Or: `https://cdn.jsdelivr.net/gh/USER/REPO@main/assets/products/rings/elegant-gold-ring.png`
