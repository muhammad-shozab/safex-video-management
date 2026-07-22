# Deploy SafeX to Production (Vercel + Azure)

This guide explains how to deploy the **React frontend** to **Vercel** and the **ASP.NET Core API + SQL Server database** to **Azure** (free tiers available).

> **Important:** Vercel is a frontend/serverless platform. It cannot run an ASP.NET Core Web API. Therefore we deploy the frontend on Vercel and the backend on Azure App Service, which natively supports .NET.

---

## What gets deployed where?

| Piece | Platform | Free tier? | URL example |
|-------|----------|------------|---------------|
| React frontend | Vercel | Yes | `https://safex-video-management.vercel.app` |
| ASP.NET Core API | Azure App Service | Yes (F1) | `https://safex-api.azurewebsites.net` |
| SQL Server database | Azure SQL Database | Yes (Free F12) | hosted by Azure |

---

## Prerequisites

1. A **GitHub** account (https://github.com/signup).
2. A **Vercel** account (https://vercel.com/signup). Use "Continue with GitHub".
3. An **Azure** account (https://azure.microsoft.com/free). You need a credit/debit card for verification but the free tiers do not charge if you stay within limits.
4. Your **YouTube Data API v3 key** from Google Cloud Console.

---

## PART A - Push code to GitHub

Vercel and Azure both deploy easiest from a GitHub repository.

1. Create a new repository on GitHub called `safex-video-management` (do not initialize it with a README).
2. In your project folder run:

```bash
cd safex-video-management
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/safex-video-management.git
git push -u origin main
```

---

## PART B - Create the cloud database

### 1. Create an Azure SQL Database

1. Go to https://portal.azure.com and sign in.
2. Click **Create a resource** → search **Azure SQL** → click **Create**.
3. Choose **SQL databases** → **Single database** → click **Create**.
4. Fill the form:
   - **Subscription**: your subscription.
   - **Resource group**: click **Create new** → name it `safex-rg`.
   - **Database name**: `SafeX`.
   - **Server**: click **Create new**.
     - **Server name**: `safex-sql-server-xyz` (must be globally unique, replace xyz with your initials).
     - **Authentication method**: **Use SQL authentication**.
     - **Server admin login**: `safexadmin`.
     - **Password**: create a strong password and save it.
     - **Location**: pick a region close to you.
   - **Compute + storage**: click **Configure database**.
     - Choose **Serverless**.
     - Set **Max vCores** to `0.5` or `1`.
     - Or choose the **Free (F12)** tier if available.
     - Click **Apply**.
5. Click **Review + create**, then **Create**. Wait a few minutes.

### 2. Allow your computer and Azure to reach the database

1. Open the new database → click **Set server firewall**.
2. Set **Allow Azure services and resources to access this server** to **Yes**.
3. Click **Add client IP** to allow your own computer (needed to run SQL scripts).
4. Click **Save**.

### 3. Run the SQL scripts on Azure

1. In the database overview, copy the **Server name** (e.g. `safex-sql-server-xyz.database.windows.net`).
2. Open **SSMS** on your computer.
3. Connect:
   - **Server name**: paste the Azure server name.
   - **Authentication**: **SQL Server Authentication**.
   - **Login**: `safexadmin`.
   - **Password**: the password you created.
   - Check **Trust server certificate**.
4. Click **Connect**.
5. Open and run `database/01_create_database.sql`, then `database/02_seed_categories.sql`.
6. Verify: expand **Databases → SafeX → Tables**. Right-click `dbo.Categories` → **Select Top 1000 Rows**.

### 4. Copy the connection string

1. In Azure portal, open the database → click **Connection strings**.
2. Copy the **ADO.NET (SQL authentication)** string.
3. Replace `{your_password}` with your actual password.
4. Save it in a notepad. It looks like:

```
Server=tcp:safex-sql-server-xyz.database.windows.net,1433;Initial Catalog=SafeX;Persist Security Info=False;User ID=safexadmin;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

---

## PART C - Deploy the backend API to Azure App Service

### 1. Create the App Service

1. In Azure portal, click **Create a resource** → search **Web App** → click **Create**.
2. Fill the form:
   - **Subscription**: your subscription.
   - **Resource group**: use the same `safex-rg`.
   - **Name**: `safex-api-xyz` (must be globally unique).
   - **Publish**: **Code**.
   - **Runtime stack**: **.NET 8 (LTS)**.
   - **Operating system**: **Windows**.
   - **Region**: same as your database.
   - **Pricing plan**: **Free F1** (0.5 GB memory, 1 GB storage).
3. Click **Review + create**, then **Create**.

### 2. Set environment variables (Configuration)

1. Open the new Web App → **Settings** → **Configuration** → **Application settings**.
2. Add these settings:

| Setting name | Value | Example |
|--------------|-------|---------|
| `ConnectionStrings__Default` | your Azure SQL connection string | paste from Part B |
| `YouTube__ApiKey` | your YouTube API key | `AIza...` |
| `Cors__AllowedOrigins__0` | your future Vercel URL | `https://safex-video-management.vercel.app` |

> If you do not know the Vercel URL yet, come back after Part D and update this setting. You can also temporarily use `*` for testing, but remove it later for security.

3. Click **Save**. The app will restart.

### 3. Deploy the backend code

#### Option 1: Visual Studio (easiest)

1. Open `backend/SafeX.Api/SafeX.Api.csproj` in Visual Studio 2022.
2. Right-click the project → **Publish**.
3. Choose **Azure** → **Azure App Service (Windows)**.
4. Sign in and select your subscription and the `safex-api-xyz` app.
5. Click **Finish**, then **Publish**.

#### Option 2: VS Code + Azure App Service extension

1. Install the **Azure App Service** extension in VS Code.
2. Sign in to Azure in VS Code.
3. Right-click your app → **Deploy to Web App**.
4. Select the `backend/SafeX.Api` folder.

#### Option 3: GitHub Actions (advanced)

1. In Azure portal, open your Web App → **Deployment Center**.
2. Choose **GitHub Actions** and connect your repository.
3. Azure will generate a workflow file in `.github/workflows/` that builds and deploys automatically on every push.

### 4. Test the API

After deployment, open a browser and go to:

```
https://safex-api-xyz.azurewebsites.net/api/categories
```

You should see a JSON list of categories. If you see an error, check **Log stream** in the Azure portal for details.

---

## PART D - Deploy the frontend to Vercel

### 1. Import the project

1. Go to https://vercel.com/dashboard and click **Add New...** → **Project**.
2. Click **Import Git Repository** and select `safex-video-management`.
3. Vercel will detect it as a Vite project.

### 2. Configure build settings

Change these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3. Add environment variable

Click **Environment Variables** and add:

- **Name**: `VITE_API_BASE`
- **Value**: `https://safex-api-xyz.azurewebsites.net` (replace with your real Azure API URL)

Click **Add**.

### 4. Deploy

Click **Deploy**. Vercel will build and deploy your frontend. After it finishes, you will get a URL like:

```
https://safex-video-management.vercel.app
```

### 5. Update backend CORS

Go back to Azure portal → your Web App → **Configuration** → add/update:

- `Cors__AllowedOrigins__0` = `https://safex-video-management.vercel.app`

Click **Save**.

---

## PART E - Connect custom domain (optional)

If you want a professional URL like `admin.safex.edu`:

1. Buy a domain from Namecheap, GoDaddy, or Cloudflare.
2. In Vercel, go to your project → **Settings** → **Domains** → add the domain.
3. In your domain provider, add the DNS records Vercel asks for (usually a CNAME).
4. In Azure, add the same domain to your App Service under **Custom domains** and enable HTTPS.

---

## PART F - Common problems and fixes

### CORS error in browser

Symptom: `Access-Control-Allow-Origin` error in the console.

Fix: Make sure `Cors__AllowedOrigins__0` in Azure exactly matches your Vercel URL, including `https://` and no trailing slash.

### Database connection fails

Symptom: API returns 500 and logs say `Login failed` or `cannot open database`.

Fix:
- Check the connection string in Azure Configuration.
- Make sure `TrustServerCertificate=False` and `Encrypt=True` for Azure SQL.
- Verify the firewall allows Azure services.

### YouTube API quota exceeded

Symptom: Search returns empty or error 403.

Fix: Wait 24 hours (free quota is 10,000 units/day) or create a second API key in Google Cloud Console and rotate it.

### Frontend shows blank page after refresh

Symptom: 404 when refreshing a page like `/library`.

Fix: The included `frontend/vercel.json` already handles SPA routing. Make sure it was pushed to GitHub.

---

## Summary checklist

- [ ] Code pushed to GitHub.
- [ ] Azure SQL Database created and SQL scripts executed.
- [ ] Azure Web App created with .NET 8 runtime.
- [ ] Backend environment variables set (connection string, YouTube key, CORS).
- [ ] Backend deployed and `/api/categories` returns JSON.
- [ ] Vercel project imported with root directory `frontend`.
- [ ] Frontend environment variable `VITE_API_BASE` set to Azure API URL.
- [ ] Frontend deployed successfully.
- [ ] Backend CORS updated with final Vercel URL.
- [ ] Tested search, import, review, publish, edit, delete flows live.

---

## Next steps for a real-world portfolio

1. Add **ASP.NET Core Identity** and JWT authentication so the login/signup pages work with real accounts.
2. Add **role-based authorization** so only admins can publish or delete.
3. Add **logging** (Azure Application Insights) to monitor errors.
4. Set up **CI/CD** with GitHub Actions so every push auto-deploys.
5. Buy a custom domain and connect it to both Vercel and Azure.
