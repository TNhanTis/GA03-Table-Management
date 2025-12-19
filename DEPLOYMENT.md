# Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites

- GitHub repository with your code
- Vercel account

### Steps

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Setup deployment configuration"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Set Environment Variables**

   - In Vercel project settings, go to "Environment Variables"
   - Add the following variable:
     - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com`)

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your frontend

### Auto-deployment

- Vercel will automatically redeploy on every push to your main branch

---

## Backend Deployment (Render)

### Prerequisites

- GitHub repository with your code
- Render account
- PostgreSQL database (can use Render's PostgreSQL or external like Supabase)

### Steps

1. **Set up Database** (if using Render PostgreSQL)

   - Go to [render.com](https://render.com)
   - Click "New +" → "PostgreSQL"
   - Fill in the database details
   - Copy the "Internal Database URL" or "External Database URL"

2. **Deploy Backend**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: table-management-backend
     - **Root Directory**: `backend`
     - **Runtime**: Node
     - **Build Command**: `npm install && npx prisma generate && npm run build`
     - **Start Command**: `npx prisma migrate deploy && npm run start:prod`

3. **Set Environment Variables**

   - In Render service settings, go to "Environment"
   - Add the following variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `NODE_ENV`: production
     - `JWT_SECRET`: A secure random string (use a password generator)
     - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
     - `PORT`: 3000

4. **Deploy**

   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Copy the deployment URL (e.g., `https://your-app.onrender.com`)

5. **Update Frontend Environment Variable**
   - Go back to Vercel
   - Update `VITE_API_URL` with your Render backend URL
   - Redeploy the frontend

### Auto-deployment

- Render will automatically redeploy on every push to your main branch

---

## Post-Deployment

### Update CORS Settings

Make sure your backend accepts requests from your Vercel frontend URL. Check your `main.ts` file and ensure CORS is properly configured:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

### Database Migrations

- Migrations run automatically on deploy with `npx prisma migrate deploy`
- To run migrations manually, use Render's Shell feature

### Testing

1. Visit your Vercel URL
2. Test the application functionality
3. Check Render logs for any backend errors

---

## Troubleshooting

### Frontend Issues

- **Build fails**: Check build logs in Vercel dashboard
- **API connection fails**: Verify `VITE_API_URL` is correct
- **Blank page**: Check browser console for errors

### Backend Issues

- **Database connection fails**: Verify `DATABASE_URL` is correct
- **Migrations fail**: Check Prisma schema and migration files
- **App crashes**: Check Render logs for errors

### Common Issues

- **CORS errors**: Ensure `FRONTEND_URL` matches your Vercel deployment
- **Environment variables**: Make sure all required env vars are set
- **Free tier limitations**: Render free tier may have cold starts (first request may be slow)

---

## Environment Variables Summary

### Frontend (.env)

```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
JWT_SECRET=your-secure-random-secret
FRONTEND_URL=https://your-app.vercel.app
PORT=3000
```

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
