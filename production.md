# 🚀 Deploying to Vercel

Vortex Analytics is fully optimized for **Vercel**—the best hosting platform for Next.js applications. 

By following this guide, your dashboard will be available live on the internet, automatically connected to your Supabase database and Gemini AI!

---

## 🔗 Step 1: Push Your Code to GitHub

If you haven't already pushed your latest code to GitHub:
1. Open your terminal in the project folder.
2. Run the following commands:
   ```bash
   git add .
   git commit -m "Prepare Next.js migration for Vercel"
   git push origin main
   ```

## ☁️ Step 2: Import Project to Vercel

1. Go to [Vercel.com](https://vercel.com) and log in (or sign up with your GitHub account).
2. Click the **"Add New..."** button and select **"Project"**.
3. Locate your `VC-Dashboard` repository from the list and click **"Import"**.

## ⚙️ Step 3: Configure Environment Variables

Before clicking Deploy, you **must** configure your environment variables. 
In the Vercel deployment screen, open the **"Environment Variables"** section and add the following keys exactly as they appear in your local `.env` file:

| Name | Value |
| :--- | :--- |
| `DATA_SOURCE` | `SUPABASE` |
| `SUPABASE_URL` | *(Paste your Supabase Project URL)* |
| `SUPABASE_ANON_KEY` | *(Paste your Supabase anon/public key)* |
| `NEXT_PUBLIC_GEMINI_KEY` | *(Paste your Gemini API key)* |

> **Note:** Do not use `VITE_GEMINI_KEY` anymore. We've upgraded to Next.js, so the key must be prefixed with `NEXT_PUBLIC_`.

## 🚀 Step 4: Deploy!

1. After adding the variables, click the big **Deploy** button.
2. Vercel will now build your Next.js application. This usually takes about 1-2 minutes.
3. Once finished, you will see a celebration screen! 🎉
4. Click **"Continue to Dashboard"** to see your live URL (e.g., `https://vc-dashboard-xyz.vercel.app`).

## 🛡️ Step 5: Verify Production Data

1. Open your live Vercel URL.
2. Check that the dashboard loads smoothly without errors.
3. **Verify Data:** Numbers should match your Supabase database.
4. **Verify AI:** Click "Generate Analysis" to ensure your Gemini API key is working correctly in production.

---

### Troubleshooting
- **Black screen or Application Error:** Make sure you correctly added all 4 variables in Vercel. If you missed one, go to the Vercel Project Settings -> Environment Variables, add them, and redeploy.
- **Empty Dashboard ($0):** Ensure `DATA_SOURCE` is specifically set to `SUPABASE`. Note that environment variables in Vercel are case-sensitive!
