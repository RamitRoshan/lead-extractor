# LeadExtractor - Screen Scraping B2B Lead Generator

LeadExtractor is a modern, screen-scraping-based lead generation platform designed to identify offline businesses (those without websites) to prioritize for high-intent B2B cold outreach. 

The application utilizes **Playwright** for browser automation, **FastAPI** for modular backend services, **Supabase / PostgreSQL** for storing dynamic search results, and **React + Tailwind CSS** for a responsive executive dashboard.

## 🚀 Key Features

1. **Active Screen Scraping**: Uses Playwright to navigate Google Maps, scroll listing feeds, and scrape detail panels.
2. **Website Filter Policy**: Ignores businesses with websites completely. Only saves offline businesses to optimize outreach.
3. **Indian Mobile Number Priority**: Cleans phone numbers, formats them, and sorts lists prioritizing active mobile availability.
4. **Dynamic Supabase Schema**: Every search (e.g. `gym in chennai`) dynamically generates a new database table (e.g., `gym_chennai_2026_05_27_113000`) storing the search meta and leads list.
5. **Dashboard Analytics**: Shows previous scraping histories, total lead counts, and lets users preview old run tables or export them as CSV.
6. **Harmonious Premium UI**: Clean dark mode layout, responsive mobile drawer, visual console logs, and hover micro-animations.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Python 3.10+, FastAPI, Playwright (Python), BeautifulSoup4, SQLAlchemy, PostgreSQL (`psycopg2`).
- **Database**: Supabase PostgreSQL / Local Postgres.

---

## 📂 Project Structure

```
lead-extractor/
├── frontend/             # React + Tailwind Frontend
│   ├── src/
│   │   ├── components/   # UI elements (SearchForm, LeadsTable, HistoryList, etc.)
│   │   ├── pages/        # DashboardPage, LeadsPage
│   │   ├── layouts/      # MainLayout
│   │   ├── services/     # api.js connection client
│   │   ├── hooks/        # useLocalStorage (Dark mode)
│   │   ├── utils/        # String & date formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/              # Python FastAPI Backend
│   ├── app/
│   │   ├── api/          # Route handlers (search, history, leads)
│   │   ├── scraper/      # Playwright script & parse engines
│   │   ├── database/     # DB connections & CRUD repositories
│   │   ├── models/       # Pydantic schemas & SQLAlchemy models
│   │   ├── services/     # Scraper orchestration services
│   │   ├── utils/        # Phone formatter & logger
│   │   ├── middleware/   # CORS configuration
│   │   └── main.py       # Main API entrypoint
│   ├── requirements.txt
│   └── .env
│
├── docker-compose.yml    # Docker services config
└── README.md
```

---

## 🐳 Quickstart: Docker Compose (Recommended)

To run the entire stack with a local Postgres database, Docker Compose makes it a single command:

1. Clone or navigate to the repository directory.
2. Build and run:
   ```bash
   docker-compose up --build
   ```
3. Open your browser:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

---

## 💻 Manual Local Development

If you prefer to run services manually without docker containers:

### 1. Database Setup
Create a PostgreSQL database (e.g. on Supabase) and grab the connection URI string.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Install Playwright browser binaries:
   ```bash
   playwright install chromium
   ```
5. Create a `.env` file based on the environment variables configuration:
   ```env
   PORT=8000
   HOST=127.0.0.1
   PLAYWRIGHT_HEADLESS=True
   DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]
   ```
   *Note: If `DATABASE_URL` is empty, it will fall back automatically to a local SQLite database file `lead_extractor.db` in the root workspace!*
6. Start the API server:
   ```bash
   python app/main.py
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. View the dashboard at [http://localhost:5173](http://localhost:5173).

---

## 💡 Scraping Logic Walkthrough

When you click "Find Offline Leads":
1. **Navigates to Google Maps**: Encodes search parameters into `https://www.google.com/maps/search/industry+in+location`.
2. **Scrolls Results Sidebar**: Runs a page loop scrolling the list container down to load up to `50` businesses.
3. **Pre-Filter Verification**: Inspects card HTML in the feed. If a "Website" icon button exists, it skips the business immediately to save time.
4. **Card Click & Detail Reading**: Click each potential lead, wait for the details panel, and verify if a website link `a[data-item-id="authority"]` is missing.
5. **Data Extraction**: Extracts Name, Rating, Category, Address, and Phone Number (`button[data-item-id^="phone:"]`).
6. **Phone Number Formatting**: Strips punctuation, isolates Indian numbers, and appends `+91` standard formats.
7. **Supabase DDL Injection**: Generates an isolated, indexed table based on current query parameters and saves all leads.
8. **Sorting Priority**: Results are sorted with active phone numbers at the top, followed by rating values descending.
