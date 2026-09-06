# Essential Soul Recruitment CRM & ATS

A full-stack, enterprise-grade Recruitment & ATS Management System with direct Supabase PostgreSQL database integration. Built for high-volume hiring pipelines, candidate tracking, interview evaluation, offer letter generation, and recruitment metrics.

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion (Framer Motion)
- **Backend**: Node.js & Express API proxy with dynamic Supabase client management
- **Database**: Supabase PostgreSQL (`snvgarluywefmlsimikf`)
- **Bundler**: Vite 6 + esbuild

---

## 📦 Getting Started

### 1. Clone or Download Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):

```env
# Server-Side Supabase Configuration (Hidden from client browser)
SUPABASE_URL="https://snvgarluywefmlsimikf.supabase.co"
SUPABASE_SECRET_KEY="your-supabase-secret-or-service-role-key"

# Client-Side Public Configuration
VITE_SUPABASE_URL="https://snvgarluywefmlsimikf.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Optional Gemini API Key
GEMINI_API_KEY=""
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### 5. Production Build & Start
```bash
# Build frontend and compile backend
npm run build

# Start production server
npm run start
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** &rarr; **New query**.
3. Run the SQL Schema DDL provided in the app's **Supabase DB** &rarr; **SQL Schema Script** tab (or check the schema script in `src/lib/supabase.ts`).
4. Once created, click **Connect & Verify** in the CRM UI, followed by **Push CRM Data** to populate your tables.

---

## 📤 Publishing to GitHub from Google AI Studio

If you are exporting this project directly from Google AI Studio:
1. Click on the **Settings** menu (three dots or gear icon in the top header).
2. Select **Export to GitHub** (or **Download ZIP**).
3. Authorize your GitHub account and select or create a new repository.
4. If pushing via Git CLI manually:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Recruitment CRM"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
