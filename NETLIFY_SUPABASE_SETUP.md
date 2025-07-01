# Connecting Netlify to Supabase

Follow these steps to connect your Netlify deployment to your Supabase project:

## 1. Get your Supabase credentials

1. Go to your [Supabase dashboard](https://app.supabase.com)
2. Select your project
3. Go to Project Settings > API
4. Find the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public** key (under Project API keys)

## 2. Add environment variables to Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** > **Environment variables**
3. Add the following variables:
   - Key: `VITE_SUPABASE_URL` | Value: your Supabase project URL
   - Key: `VITE_SUPABASE_ANON_KEY` | Value: your Supabase anon key

## 3. Redeploy your site

1. Go to the **Deploys** tab in your Netlify dashboard
2. Click **Trigger deploy** > **Deploy site**

Your Netlify site should now be connected to your Supabase backend!

## Troubleshooting

If you're still having connection issues:

1. Make sure the environment variable names match exactly (including the `VITE_` prefix)
2. Verify that your Supabase project is active and the API is enabled
3. Check that your Supabase project's URL is correctly formatted
4. Ensure your site has been redeployed after adding the environment variables