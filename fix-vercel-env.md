# URGENT: Fix Vercel Environment Variables

## The Problem
Your login fails because Vercel backend has no environment variables.

## Quick Fix (2 minutes):

1. Go to: https://vercel.com/dashboard
2. Click on your backend project: `crm-backend-jet-seven`
3. Go to **Settings** → **Environment Variables**
4. Add these 5 variables:

### Variable 1:
- **Name**: `NODE_ENV`
- **Value**: `production`

### Variable 2:
- **Name**: `MONGODB_URI`
- **Value**: `mongodb+srv://bitangimanaalainnobel_db_user:wnwPf2wbfep96edr@cluster0.lifsbo1.mongodb.net/crm?retryWrites=true&w=majority&appName=Cluster0`

### Variable 3:
- **Name**: `JWT_SECRET`
- **Value**: `super_secure_jwt_secret_for_production_use_32_chars`

### Variable 4:
- **Name**: `JWT_REFRESH_SECRET`
- **Value**: `super_secure_refresh_secret_for_production_32_chars`

### Variable 5:
- **Name**: `CLIENT_URL`
- **Value**: `https://warm-stroopwafel-01d9af.netlify.app`

## After Adding Variables:
1. Click **Save**
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Wait 1-2 minutes
5. Try logging in again with: admin@crm.com / admin123

## That's it! Your login will work after this.