# Netlify Deployment Instructions for SkillUp Buddy

To fix the "White Screen" and "Authentication Failed" errors on your deployed site, follow these steps:

### 1. Configure Environment Variables
In your Netlify Dashboard (Site Settings > Environment Variables), add the following:

| Key | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://dfjlawqfldgoduzmaebs.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_uG1muPO9S34NpxAvawE8kQ_vcpKgbxQ` |
| `VITE_API_URL` | `https://your-backend-url.com` (Optional, for evaluation) |

**Important**: After adding these, you must **Trigger a new Deploy** for the changes to take effect at build time.

### 2. Matching Redirect URLs
In your [Supabase Dashboard](https://supabase.com/dashboard/project/dfjlawqfldgoduzmaebs/auth/url-configuration):
1.  **Site URL**: Set this to your Netlify URL (e.g., `https://skillup-buddy.netlify.app`).
2.  **Redirect URLs**: Add `https://skillup-buddy.netlify.app/**` to allow redirects after Google/Email login.

### 3. SPA Redirect Fix
I have already added a `public/_redirects` file to your project. This prevents the "404 Not Found" error when you refresh the page on any sub-route (like `/home` or `/aptitude`).

### 4. Asset Fix
Your logo and other assets have been updated to use stable absolute paths (`/logo.png`) instead of source paths (`/src/assets/...`), preventing 404s in the production build.

---

### Debugging Steps
If you still see a white screen:
1.  Open Chrome DevTools (**F12**).
2.  Check the **Console** tab. It will now show a descriptive error if the environment variables are missing.
3.  Check the **Network** tab. If `logo.png` is 404, ensure it was copied to the `public/` directory (I have already done this in the repository).
