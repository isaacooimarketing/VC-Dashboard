# 🌀 Vortex Analytics Dashboard

A premium, state-of-the-art Sales Dashboard featuring real-time AI insights, high-performance charting, and a hybrid data layer supporting both CSV and Cloud Databases.

![Vortex Analytics Preview](file:///C:/Users/User/.gemini/antigravity/brain/c810bf5c-8241-4d06-9d20-79aa44148084/dashboard_populated_1772956549394.png)

## ✨ Features

- 🌓 **Dynamic Theme Engine**: Seamlessly switch between light and dark modes with a single click. High-contrast, premium aesthetic.
- 🤖 **AI-Powered Business Intelligence**: Integrated with Google Gemini (3.1 Pro/2.5 Flash) to generate automated alerts, opportunities, and business suggestions.
- 📊 **Interactive Data Visualizations**: Real-time charts powered by Recharts, enabling trends analysis by date, channel, and product.
- 📡 **Hybrid Data Layer**: High-performance Express API serving data from local CSV or Supabase Cloud DB.
- 🛠️ **Developer-First Design**: Fully responsive, built with React, Tailwind CSS, and Framer Motion.

---

## 🛠️ Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (one has been provided for you):
   ```env
   # Google Gemini AI
   VITE_GEMINI_KEY=your_gemini_key_here

   # Database Mode: 'CSV' or 'SUPABASE'
   DATA_SOURCE=CSV

   # Supabase Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

3. **Start the Dashboard**:
   ```bash
   npm run dev:all
   ```
   - Frontend: [http://localhost:5180](http://localhost:5180)
   - API Server: [http://localhost:5001](http://localhost:5001)

---

## ⚡ Connect to Supabase Cloud (Easy Setup)

The backend is configured to read data from a local CSV by default, but it’s fully ready to connect to a real database on the cloud! Follow these simple steps:

### 1. Create a Project
Sign up at **[Supabase.com](https://supabase.com)** and create a new project.

### 2. Prepare the Database Table
Go to the **SQL Editor** on the left menu and paste/run this code to create your table:

```sql
CREATE TABLE sales_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    product TEXT,
    channel TEXT,
    orders INTEGER,
    revenue NUMERIC(15, 2),
    cost NUMERIC(15, 2),
    visitors INTEGER,
    customers INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Import Your Data
1. Go to the **Table Editor** icon.
2. Select the `sales_data` table you just created.
3. Click **Insert → Import CSV**.
4. Upload `data/sales_data.csv` from this project folder.
5. Click **Import Data**.

### 4. Link & Activate (Step-by-Step)
Now we need to tell your local dashboard how to talk to your new Supabase cloud database.

1.  **Find your credentials**: In your Supabase dashboard, click the **Settings Cog (⚙️)** at the bottom of the left menu.
2.  **Get the Project URL**: 
    - In the Settings menu, click on **Data API** (look under the "INTEGRATIONS" section on the left).
    - On that page, look for the box labeled **Project URL**. Copy that address (starting with `https://`).
3.  **Get the Anon Key**: 
    - Go back to the Settings menu and click on **API Keys** (under the "CONFIGURATION" section).
    - Look for the row labeled `anon` and the column labeled `public`. Click **Copy** on that key.
4.  **Edit your local .env file**: 
    - Open your project folder and open the file named `.env`.
    - Change `DATA_SOURCE=CSV` to `DATA_SOURCE=SUPABASE`.
    - Paste your URL next to `SUPABASE_URL=`.
    - Paste your key next to `SUPABASE_ANON_KEY=`.
5.  **Save the file**.

Your `.env` file should now look something like this:
```env
# Database Mode
DATA_SOURCE=SUPABASE

# Cloud Credentials
SUPABASE_URL=https://xyzaabbbcc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...
```

### 5. Start Browsing
Restart your development server. The dashboard will now serve live data directly from your Supabase cloud database!
```bash
npm run dev:all
```

---

## 🤖 AI Model Selection

The dashboard supports the latest Gemini models for free-tier users. You can switch models directly in the UI:
- **Gemini 2.5 Flash**: Default & Recommended for fast, free-tier testing.
- **Gemini 3.1 Pro**: Best for complex logical reasoning and business strategies.
- **Gemini 3.1 Flash-Lite**: Optimized for speed.

---

## 📜 Development Notes

- **API Layer**: `server.js` serves the data.
- **Data Logic**: `data-layer.js` handles the switching logic between CSV and DB.
- **Components**: The UI is modularized in `src/App.jsx` for easy styling.

*Built for high-performance analytics by Vortex Intelligence.*
