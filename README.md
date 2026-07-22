# Educational Video Management Platform

> A full-stack content management system for discovering, reviewing, publishing, and moderating educational videos at scale.

<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/63edb25a-85f6-4ed1-abde-9af2706fbbf6" />


<p align="center">
  <a href="#about">About</a> ·
  <a href="#how-it-works">How It Works</a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#architecture">Architecture</a>
</p>

---

## About

This platform gives administrators a complete workflow for managing educational video content. It connects to the YouTube Data API to discover videos, then guides each video through a structured review and approval process before publication. The system supports role-based access, category organization, audience targeting, and content moderation tools.

Built as a production-style full-stack application, it demonstrates end-to-end skills in frontend design, REST API development, relational database modeling, and third-party API integration.

---

## How It Works

The application follows a clear content lifecycle from discovery to publication:

1. **Search**: Admins search YouTube for educational videos using keywords. Results include thumbnails, titles, channels, view counts, durations, and descriptions.
2. **Import**: Selected videos are imported into the internal library and marked as pending review.
3. **Review**: Admins evaluate each video for educational quality, language, target audience, copyright concerns, and category fit.
4. **Publish**: Approved videos are assigned to a category and published for either a General or Kids audience.
5. **Manage**: Published videos can be edited, soft deleted, restored from trash, or permanently removed.
6. **Moderate**: User-generated recommendations and role assignments are handled through dedicated management panels.

---

## Features

- **YouTube Video Search**: Search and preview educational videos directly through the YouTube Data API v3.
- **Admin Review Workflow**: Structured review checklist covering quality, language, audience, copyright, and category.
- **Publish Flow**: Assign categories and publish videos to General or Kids audiences.
- **Metadata Editing**: Update titles, descriptions, thumbnails, categories, languages, target audiences, and status.
- **Soft & Permanent Delete**: Move content to trash, restore it, or delete it permanently.
- **User & Role Management**: Manage admin accounts and assign roles with controlled permissions.
- **Category Management**: Organize videos into categories and nested subcategories.
- **Recommendation Queue**: Review and moderate curated video recommendations.
- **Kids Zone**: Filtered, safe browsing experience designed for younger audiences.
- **Dark / Light Theme**: Full theme toggle with persistent preference.
- **Responsive Design**: Optimized for desktop, tablet, and mobile screens.

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

> Replace the placeholder paths below with your own images by adding them to the `screenshots/` folder, or paste them directly into the GitHub editor.

### Admin Dashboard

<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/2c487932-20fc-4885-a7b8-b81392fb3d6d" />


### Video Search

<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/f5987786-4557-4c07-836b-dfdaec9efe39" />


### Video Library

<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/11ce2f57-6897-40dc-9160-746f68c7d6cc" />


### Review Workflow

<img width="1365" height="765" alt="image" src="https://github.com/user-attachments/assets/7fcea41e-ecce-4bf0-afcd-edebf5039204" />


### Category Management

<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/1eacadf7-f3b2-4785-8329-d27ab2056636" />


### User & Role Management

<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/ef017fb7-3234-451e-892a-37e2387191c0" />


### Recommendation Queue

<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/5169fdd0-dbb6-48e6-9254-9a9098a71902" />


### Kids Zone

<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/b43594e0-eac1-4ec2-9b1c-039e9ba021f6" />


### Authentication

<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/aaa41fb8-3aeb-42dc-b50f-cedf55adb9bc" />

---

## Architecture

The project is organized as a three-tier full-stack application:

```
project-root/
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
├── screenshots/           # Project screenshots
├── README.md              # This file
├── DEPLOYMENT.md          # Production deployment guide
└── INTEGRATION.md         # Team integration notes
```

### API Endpoints

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

## Getting Started

For detailed local setup and deployment instructions, see:

- [SETUP.md](SETUP.md) (create from DEPLOYMENT.md if needed)
- [DEPLOYMENT.md](DEPLOYMENT.md)

Quick start:

1. Run the SQL scripts in `database/` to create and seed the SQL Server database.
2. Configure the backend connection string and YouTube API key in `backend/SafeX.Api/appsettings.json`.
3. Start the API with `dotnet run` inside the backend folder.
4. Install frontend dependencies with `npm install` and run `npm run dev`.
5. Open the local frontend URL shown in the terminal.

---


## Author

Built by **Shozab Haider** - Full Stack Developer

- LinkedIn: https://www.linkedin.com/in/muhammad-shozab-se
- Portfolio: https://muhammad-shozab.github.io/portfolio/
- Email: m.shozab2005@gmail.com

---

## License

This project was built for educational and portfolio purposes.
