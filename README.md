# SafeX Educational Learning Platform

> A full-stack video management system built for SafeX. Search, review, publish, edit, and manage educational videos with role-based access control.

<p align="center">
  <img src="screenshots/logo.png" alt="SafeX Logo" width="120"/>
</p>

<p align="center">
  <a href="#demo">Demo</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#setup">Setup</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#github">Push to GitHub</a>
</p>

---

## Demo


---

## Features

- **YouTube Video Search**: Search educational videos directly from YouTube using the YouTube Data API v3.
- **Review Workflow**: Review videos for educational quality, language, target audience, copyright, and category before approval.
- **Publish Flow**: Publish approved videos to Kids or General audiences with category assignment.
- **Edit Metadata**: Update title, description, thumbnail, category, language, target audience, and status.
- **Soft & Permanent Delete**: Move videos to trash, restore them, or permanently delete them.
- **User & Role Management**: Manage admin users and assign roles.
- **Category Management**: Organize content into categories and subcategories.
- **Recommendations**: Curated recommendation queue with moderation tools.
- **Kids Zone**: Safe, filtered video browsing experience for children.
- **Dark / Light Theme**: Toggle between dark and light modes.
- **Responsive Design**: Works on desktop, tablet, and mobile.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, React Router, Bootstrap 5 |
| Backend | ASP.NET Core 8 Web API, Entity Framework Core |
| Database | Microsoft SQL Server |
| External API | YouTube Data API v3 |
| Styling | Custom CSS with glass-morphism design system |
| Deployment | Vercel (frontend), Azure App Service (backend), Azure SQL (database) |

---

## Screenshots

> Add your own screenshots to the `screenshots/` folder and update the file names below.

<p align="center">
  <img src="screenshots/dashboard.png" alt="Dashboard" width="80%"/>
  <br/>
  <em>Admin Dashboard</em>
</p>

<p align="center">
  <img src="screenshots/search.png" alt="Search Videos" width="80%"/>
  <br/>
  <em>YouTube Video Search</em>
</p>

<p align="center">
  <img src="screenshots/library.png" alt="Video Library" width="80%"/>
  <br/>
  <em>Video Library</em>
</p>

<p align="center">
  <img src="screenshots/review.png" alt="Review Video" width="80%"/>
  <br/>
  <em>Review Workflow</em>
</p>

<p align="center">
  <img src="screenshots/users.png" alt="User Management" width="80%"/>
  <br/>
  <em>User & Role Management</em>
</p>

<p align="center">
  <img src="screenshots/login.png" alt="Login Page" width="80%"/>
  <br/>
  <em>Login / Signup</em>
</p>

---

## Project Structure

```
safex-video-management/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── styles/        # CSS and theme files
│   │   └── lib/           # Helpers and API calls
│   ├── .env.example       # Example environment variables
│   └── package.json
├── backend/               # ASP.NET Core Web API
│   └── SafeX.Api/
│       ├── Program.cs
│       ├── appsettings.json
│       └── SafeX.Api.csproj
├── database/              # SQL Server setup scripts
│   ├── 01_create_database.sql
│   └── 02_seed_categories.sql
├── screenshots/             # Add your project screenshots here
├── README.md              # This file
├── DEPLOYMENT.md          # Production deployment guide
└── INTEGRATION.md         # Team integration notes
```

---

## Setup

### Prerequisites

Install these tools before you start:

1. **Node.js 20 LTS** - https://nodejs.org
2. **.NET SDK 8** - https://dotnet.microsoft.com/download
3. **SQL Server 2022 Developer** (free) + **SSMS** - https://www.microsoft.com/en-us/sql-server/sql-server-downloads
4. **VS Code** - https://code.visualstudio.com
5. **Git** - https://git-scm.com

Verify your installations in a terminal:

```bash
node -v          # Should show v20.x
dotnet --version # Should show 8.x
```

### Step 1: Create the Database

1. Open **SQL Server Management Studio (SSMS)**.
2. Connect to `localhost` or `\.\SQLEXPRESS`.
3. If you see a certificate warning, check **Trust server certificate** or set **Encrypt** to **Optional**.
4. Open `database/01_create_database.sql` and press **F5** to run it.
5. Open `database/02_seed_categories.sql` and press **F5** to run it.
6. Expand **Databases > SafeX > Tables** to confirm the tables were created.

### Step 2: Configure the Backend API

1. Open a terminal in `backend/SafeX.Api`.
2. Open `appsettings.json` and update the connection string:

```json
"ConnectionStrings": {
  "Default": "Server=localhost;Database=SafeX;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

For SQL Express use:

```json
"Server=.\\SQLEXPRESS;Database=SafeX;Trusted_Connection=True;TrustServerCertificate=True;"
```

3. Add your **YouTube Data API v3 key**:

```json
"YouTube": {
  "ApiKey": "YOUR_YOUTUBE_API_KEY_HERE"
}
```

Get a key from: https://console.cloud.google.com

4. Restore packages and run the API:

```bash
dotnet restore
dotnet run
```

The API will run at: http://localhost:5080

Test it in your browser: http://localhost:5080/api/categories

### Step 3: Run the Frontend

1. Open a second terminal in `frontend`.
2. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

3. Open http://localhost:5173 in your browser.

The frontend is already configured to call the backend at `http://localhost:5080`.
If your API runs on a different port, update `VITE_API_BASE` in `frontend/.env`.

---

## How to Use

1. **Login**: Use the demo accounts or create a new account.
2. **Search**: Go to Search and type a keyword like "kids science".
3. **Import**: Click **Import** on a video card to save it for review.
4. **Review**: Go to Library, open a pending video, and complete the review checklist.
5. **Publish**: Choose Kids or General audience and assign a category.
6. **Edit**: Update any video metadata from the Library.
7. **Delete**: Soft delete moves a video to Trash. Restore or permanently delete from Trash.

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for a complete beginner-friendly deployment guide.

Quick overview:

1. Push this project to GitHub.
2. Deploy the React frontend to **Vercel** (set root directory to `frontend`).
3. Deploy the ASP.NET Core API to **Azure App Service**.
4. Host the SQL Server database on **Azure SQL Database**.
5. Add environment variables for production URLs and API keys.

---

## Push to GitHub

Follow these exact steps to upload this project to GitHub.

### Step 1: Create a GitHub Repository

1. Go to https://github.com and sign in.
2. Click the **+** icon in the top-right corner.
3. Select **New repository**.
4. Enter a repository name, for example: `safex-video-management`.
5. Choose **Public** or **Private**.
6. Do **NOT** initialize with a README, .gitignore, or license (we already have these files).
7. Click **Create repository**.

### Step 2: Open a Terminal in the Project Folder

On Windows:

```bash
cd C:\Users\YourName\Downloads\safex-video-management
```

On Mac / Linux:

```bash
cd ~/Downloads/safex-video-management
```

Replace the path with the actual folder location on your computer.

### Step 3: Initialize Git

Run these commands one by one:

```bash
git init
```

This creates a new Git repository in your project folder.

### Step 4: Add All Files

```bash
git add .
```

This stages all files for the first commit.

### Step 5: Commit the Files

```bash
git commit -m "Initial commit: SafeX full-stack video management platform"
```

### Step 6: Connect to GitHub

Copy the repository URL from GitHub. It looks like this:

```
https://github.com/yourusername/safex-video-management.git
```

Then run:

```bash
git branch -M main
git remote add origin https://github.com/yourusername/safex-video-management.git
```

### Step 7: Push to GitHub

```bash
git push -u origin main
```

If Git asks for your username and password, use your GitHub username and a **Personal Access Token** instead of your password.

### Step 8: Add Screenshots to Your README

1. Take screenshots of your app (Dashboard, Search, Library, Review, Login, Users).
2. Copy the image files into the `screenshots/` folder.
3. Make sure the file names match the ones used in this README:
   - `screenshots/logo.png`
   - `screenshots/dashboard.png`
   - `screenshots/search.png`
   - `screenshots/library.png`
   - `screenshots/review.png`
   - `screenshots/users.png`
   - `screenshots/login.png`
4. Run the Git commands again to upload the screenshots:

```bash
git add screenshots/
git commit -m "Added project screenshots"
git push
```

Your README will now display the images on GitHub.

---

## Environment Variables

### Frontend (`frontend/.env`)

```bash
VITE_API_BASE=http://localhost:5080
```

### Backend (`backend/SafeX.Api/appsettings.json`)

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=SafeX;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "YouTube": {
    "ApiKey": "YOUR_YOUTUBE_API_KEY"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  }
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/videos` | List all videos |
| GET | `/api/videos/:id` | Get a single video |
| POST | `/api/videos` | Create a new video |
| PUT | `/api/videos/:id` | Update a video |
| DELETE | `/api/videos/:id` | Soft delete a video |
| DELETE | `/api/videos/:id/permanent` | Permanently delete a video |
| POST | `/api/videos/:id/restore` | Restore a soft-deleted video |
| GET | `/api/youtube/search` | Search YouTube videos |
| GET | `/api/youtube/details` | Get YouTube video details |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error in browser | Make sure the API is running and `Cors:AllowedOrigins` includes `http://localhost:5173` |
| Cannot open database "SafeX" | Run the SQL scripts in `database/`. Check your connection string server name |
| YouTube 403 quota exceeded | Free daily quota is 10,000 units. Wait 24 hours or create a second API key |
| `dotnet ef` not found | Run `dotnet tool install --global dotnet-ef` |
| Images not showing in README | Make sure the file names in `screenshots/` exactly match the names in README.md |

---

## Team

- **Shozab Haider** - Full Stack Developer
- **Sairam Abdullah** - Group Leader
- **Group 22** - SafeX Educational Learning Platform

---

## License

This project was built for educational purposes as part of the SafeX group project.
