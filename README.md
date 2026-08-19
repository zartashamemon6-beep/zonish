# ZONISH COMPUTER ACADEMY NEWJAOTI - Online Student Attendance & Fee System

A responsive, high-performance web portal for **ZONISH COMPUTER ACADEMY NEWJAOTI** to track **Student Attendance** and **Monthly Fee Collection Records** remotely from any city, hostable for free on **GitHub Pages**.

---

## 🌟 Key Features

1. **Academy Branding**: Customized for **ZONISH COMPUTER ACADEMY NEWJAOTI**.
2. **All-Months Student Fee Ledger & Total Revenue Tracking**:
   - Maintains a complete **month-by-month fee history** for every student from their joining month.
   - Interactive **All-Months Fee Card Modal** showing clean student name sizing, payment dates, fee amounts (PKR / Rs.), and `Paid` / `Unpaid` status per month.
   - **Total Fees Paid Badge**: Displays the cumulative total money collected from that student so far in Pakistani Rupees (e.g. **Total Fees Paid: Rs. 8,000 (8 Months)**).
   - 1-click **Mark Paid** / **Mark Unpaid** toggle for any specific month.
3. **Student Management**:
   - Database fields: **Student Name**, **Father's Name (F/Name)**, **Class / Course**, **Monthly Fee (PKR - Rs.)**, **Date of Fees Paid**.
   - Search & filter by student name, father's name, or computer course.
4. **Daily Attendance Register**:
   - Quick attendance toggles: **Present** (Green), **Absent** (Red), **Late** (Yellow).
   - Date selector to mark or view attendance for any date.
5. **Password Protected Admin Panel**:
   - **Password Security Check**: Password protected lock screen (Default password: `admin123` with option to change password).
   - **Card 1: Admin Control Center**: Shows Academy Name (`ZONISH COMPUTER ACADEMY NEWJAOTI`), enrolled student count, password update input, and 1-click **Lock Panel** button.
   - **Card 2: Danger Zone**: Safe bulk deletion (`DELETE` confirmation lock) and demo data reset.
   - **Card 3: Month-Wise Payment Collection Ledger**: Comprehensive table listing every month (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug...), total revenue collected (₹), total paid students, total unpaid students, and collection rate (%).

3. **Remote Access & Fee Alerts**:
   - Calculates fee payment status (Paid, Due Soon <7 days, Overdue >30 days).
   - Quick "Paid Today" fee renewal button.
   - **Live Cloud Sync** (via Supabase / Firebase REST API) so the teacher in your village and you in the city see real-time updates.

4. **100% Free Hosting on GitHub Pages**:
   - Single-page application architecture (HTML, CSS, JavaScript).
   - Offline fallback using browser LocalStorage and JSON Backup/Restore.

---

## 🚀 How to Upload & Publish on GitHub Pages (Step-by-Step)

Follow these simple steps to deploy your attendance portal online for free:

### Step 1: Create a GitHub Account & Repository
1. Go to [GitHub.com](https://github.com) and log in (or create a free account).
2. Click the **`+`** icon in the top right corner and select **New repository**.
3. Name your repository `academy-attendance` (or any name you like).
4. Select **Public**.
5. Click **Create repository**.

### Step 2: Upload Files to GitHub
1. In your newly created repository page, click **uploading an existing file**.
2. Drag and drop all the files from this directory:
   - `index.html`
   - `style.css`
   - `app.js`
   - `README.md`
3. Scroll down and click **Commit changes**.

### Step 3: Enable GitHub Pages
1. Go to your repository's **Settings** tab.
2. On the left sidebar, click on **Pages** (under the "Code and automation" section).
3. Under **Build and deployment** -> **Source**, select **`Deploy from a branch`**.
4. Set Branch to **`main`** (or `master`) and folder to **`/ (root)`**.
5. Click **Save**.

🎉 **Your website is live!** Within 1-2 minutes, GitHub will give you a live public URL like:
`https://YOUR-GITHUB-USERNAME.github.io/academy-attendance/`

Open this link on your mobile phone or laptop in the city to track your students anytime!

---

## 💾 Setting up Free Live Cloud Database (For City & Village Sync)

By default, data is stored in the browser's local memory. To share live updates between your village teacher and your city phone:

1. Create a free account on [Supabase.com](https://supabase.com).
2. Create a new project and copy your **Project URL** and **Anon Key**.
3. In your live AcademyTrack website, click on **Cloud & Sync** tab.
4. Paste your Project URL & Anon Key and click **Save & Test Connection**.
5. Both you and your village teacher will now see real-time student updates!

---

## 🛠 Database Schema

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `name` | String | Full Name of the Student |
| `fname` | String | Father's Name (`f/name`) |
| `class` | String | Course / Class Name |
| `feedate` | Date | Date when fees were last paid |
| `phone` | String | Contact Number |
