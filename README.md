# Quranic Translation Manager

A comprehensive meeting management system for tracking Quranic translation progress across multiple languages. Built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

## Features

### Dashboard
- **Overview Statistics**: Total languages, meetings this week, languages needing attention, priority breakdown
- **Recent Meetings**: View the 5 most recent meetings with language details
- **Follow-up Required (3+ Days)**: Languages that need a follow-up meeting
- **Immediate Follow-up Required (7+ Days)**: Languages requiring urgent review
- **High Priority Languages**: Quick access to high-priority translation projects

### Language Management
- Add, edit, and delete languages
- Set priority levels (Low, Medium, High)
- Assign responsible persons
- Track last meeting dates
- Country and language name tracking

### Meeting Management
- **Quick Meeting Entry**: Record meetings for any language
- **Language-Specific Meetings**: Add meetings directly from language detail pages
- **Edit Meetings**: Update meeting details, participants, discussion points, and action items
- **Delete Meetings**: Remove meetings with confirmation modal
- **Meeting History**: View all meetings for each language

### Reports
- **Weekly Report**: Summary of all meetings from the past 7 days
  - Copy report to clipboard
  - Grouped by language
  - Discussion points and action items
- **Monthly Report**: Summary of all meetings from the past 30 days
  - Same features as weekly report
  - Extended date range

### UI/UX Features
- **Dark Mode**: Full light/dark theme support with smooth transitions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Breadcrumb Navigation**: Easy navigation throughout the app
- **Real-time Updates**: Automatic page refresh after CRUD operations
- **Loading States**: Visual feedback during async operations
- **Error Handling**: User-friendly error messages

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Theme**: next-themes for dark mode
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git (for version control)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd quranic-translation-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database:**
   
   Create the following tables in your Supabase project:

   **languages table:**
   ```sql
   CREATE TABLE languages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     country TEXT NOT NULL,
     language TEXT NOT NULL,
     responsible_person TEXT,
     priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
     last_meeting_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **meetings table:**
   ```sql
   CREATE TABLE meetings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
     meeting_date DATE NOT NULL,
     meeting_type TEXT,
     participants TEXT,
     discussion_points TEXT,
     translation_progress TEXT,
     progress_percentage INTEGER,
     action_items TEXT,
     next_meeting_date DATE,
     meeting_notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **Row Level Security (RLS):**
   ```sql
   ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

   -- Allow all operations for languages (adjust based on your auth needs)
   CREATE POLICY "Allow all operations on languages" ON languages
     FOR ALL USING (true) WITH CHECK (true);

   -- Allow all operations for meetings
   CREATE POLICY "Allow all operations on meetings" ON meetings
     FOR ALL USING (true) WITH CHECK (true);
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
quranic-translation-manager/
├── app/
│   ├── actions/              # Server Actions
│   │   ├── languageActions.ts
│   │   └── meetingActions.ts
│   ├── dashboard/            # Dashboard components
│   │   ├── HighPriorityLanguages.tsx
│   │   ├── LanguagesNeedingAttention.tsx
│   │   ├── RecentMeetings.tsx
│   │   ├── ReportsDropdown.tsx
│   │   └── UrgentFollowUps.tsx
│   ├── languages/
│   │   ├── [id]/
│   │   │   ├── edit/
│   │   │   │   ├── EditLanguageForm.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── meetings/
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── MeetingCard.tsx
│   │   │   └── page.tsx
│   │   ├── LanguageActions.tsx
│   │   ├── LanguageList.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── meetings/
│   │   ├── [id]/
│   │   │   └── edit/
│   │   │       ├── EditMeetingForm.tsx
│   │   │       └── page.tsx
│   │   ├── MeetingActions.tsx
│   │   └── new/
│   │       ├── page.tsx
│   │       └── QuickMeetingForm.tsx
│   ├── reports/
│   │   ├── monthly/
│   │   │   ├── MonthlyReportContent.tsx
│   │   │   └── page.tsx
│   │   └── weekly/
│   │       ├── WeeklyReportContent.tsx
│   │       └── page.tsx
│   ├── weekly-report/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DashboardLayout.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── SummaryCard.tsx
│   └── ThemeProvider.tsx
├── lib/
│   ├── supabase.ts          # Database functions
│   └── supabaseClient.ts    # Supabase client setup
├── public/
├── .env.local
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Usage Guide

### Adding a Language
1. Navigate to **Languages** from the sidebar
2. Click **Add Language**
3. Fill in country, language name, responsible person, and priority
4. Click **Save Language**

### Recording a Meeting
1. From Dashboard, click **Quick Meeting**
2. Select a language from dropdown
3. Enter meeting date, participants, discussion points, and action items
4. Click **Save Meeting**

**Or from a language page:**
1. Go to **Languages** → Select a language
2. Click **Add Meeting** or **Add First Meeting**
3. Fill in meeting details
4. Click **Save Meeting**

### Editing a Meeting
1. Navigate to a language detail page
2. Find the meeting card
3. Click **Edit** button
4. Update the fields
5. Click **Save Changes**

### Deleting a Meeting
1. Navigate to a language detail page
2. Find the meeting card
3. Click **Delete** button
4. Confirm deletion in the modal

### Generating Reports
1. Click **Reports** dropdown in the dashboard header
2. Select **Weekly Report** or **Monthly Report**
3. Review the summary
4. Click **Copy Report** to copy to clipboard

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Production deploy:**
   ```bash
   vercel --prod
   ```

### GitHub + Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Configure environment variables
4. Vercel auto-deploys on every push

## Database Schema

### Languages Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| country | TEXT | Country name |
| language | TEXT | Language name |
| responsible_person | TEXT | Person responsible |
| priority | TEXT | low/medium/high |
| last_meeting_at | TIMESTAMP | Last meeting date |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

### Meetings Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| language_id | UUID | Foreign key to languages |
| meeting_date | DATE | Meeting date |
| meeting_type | TEXT | Type of meeting |
| participants | TEXT | Attendees |
| discussion_points | TEXT | Discussion summary |
| translation_progress | TEXT | Progress notes |
| progress_percentage | INTEGER | Progress % |
| action_items | TEXT | Next actions |
| next_meeting_date | DATE | Next meeting date |
| meeting_notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Update timestamp |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for Quranic translation management**
