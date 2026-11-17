# TalentForge — AI Career & Recruitment Platform

TalentForge is a MERN recruitment platform upgraded into an AI-powered career operating system. It connects candidates and recruiters while helping candidates assess, improve and prepare before they apply.

## Stack

- Frontend: React 18 + Vite + Tailwind CSS + React Router + TanStack Query + Axios + Recharts
- Backend: Node.js + Express + Mongoose
- Database: MongoDB / MongoDB Atlas
- Auth: JWT access tokens + httpOnly refresh cookie + role-based authorization
- Files: Cloudinary
- AI: Google Gemini API (Gemini) behind server-side endpoints
- Frontend deployment: Vercel
- Backend deployment: Render

## Implemented product areas

### Candidate
- Registration, login, refresh/logout, password reset and email verification
- Professional profile with skills, education, experience, certifications, projects, achievements and preferences
- Resume upload/replace/remove
- AI resume parsing preview
- AI resume quality analysis
- Job-specific ATS analysis
- AI job recommendations with fit explanations
- Job readiness lab
- Skill-gap analysis
- Personalized AI learning roadmap
- AI career suggestions
- AI Career Copilot chat
- AI skill verification quizzes
- Job marketplace, filters, saved jobs and one-click applications
- Application tracking and notifications
- AI interview preparation

### Recruiter
- Company profile and logo
- Job creation, publishing, editing and closing
- Applicant management
- Candidate filtering / talent search
- AI candidate ranking with evidence and human-oversight messaging
- Recruitment analytics

### Admin
- User management
- Company verification
- Job moderation
- Platform analytics

## AI safety/product principles

AI outputs are advisory. Match/readiness/ATS scores are not model accuracy and are not guarantees of employment. Recruiters retain human decision authority. AI prompts are grounded in authorized profile/job data and should not use protected characteristics for ranking.

## Local development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Set at minimum:

- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL=http://localhost:5173`
- `GEMINI_API_KEY` for AI features
- Cloudinary credentials for resume/photo uploads
- SMTP credentials if email delivery is required

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Set:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=TalentForge
```

## Production deployment

### 1. MongoDB Atlas
Create a production database and set `MONGO_URI` in Render.

### 2. Render — backend
Create a Web Service from the repository:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check: `/health`

Use the variables in `backend/.env.example`. Render should generate or store the JWT secrets securely.

### 3. Vercel — frontend
Import the repository into Vercel:

- Root directory: `frontend`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Set:

```env
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api/v1
VITE_APP_NAME=TalentForge
```

The included `frontend/vercel.json` handles React Router fallback.

### 4. Connect both services
After Vercel is deployed, set Render:

```env
CLIENT_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
```

Redeploy the backend.

## Important production notes

- Never commit `.env` files or API keys.
- Use a real Google Gemini API key on Render; never expose it as a `VITE_` variable.
- Use HTTPS in production.
- Configure Cloudinary and SMTP before enabling resume uploads and verification emails.
- Test refresh-cookie behaviour after deployment because the frontend and backend are on different domains.
- Monitor AI rate limits and provider costs.

## Project structure

```text
talentforge/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   ├── vercel.json
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── render.yaml
```
