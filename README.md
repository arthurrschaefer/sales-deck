# Sales Link Tracker & Feedback System

A lightweight, self-hosted, **vibe-coded**, system for sales teams to share resources, track usage (clicks), and collect feedback on sales collateral.

## 🚀 Features
- **Link Gateway:** Tracks every click before redirecting to the destination (Drive, YouTube, etc.).
- **Feedback Loop:** Simple buttons for sales reps to mark content as "Helpful," "Outdated," or "No-brainer."
- **Admin Dashboard:** Manage links and view real-time analytics on resource performance.
- **Privacy Focused:** Anonymous feedback options and self-hosted data (SQLite).

## 🛠️ Tech Stack
- **Backend:** Node.js, Express
- **Database:** SQLite (No external database setup required)
- **Frontend:** HTML5, Vanilla JS, Water.css (Lightweight)

## 📦 Installation

1. **Clone the repository**
```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
   cd sales-deck

```


2. **Install dependencies**
```bash
   npm install

```


3. **Configure Environment Variables**
Create a `.env` file in the root directory:

```text
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_random_secret_string
PORT=3000
```


4. **Initialize Database**

The system automatically builds the database from `schema.sql` the first time you run it.

7. **Start the server**
```bash
node server.js

```



## 🔒 Security & Privacy

* **.gitignore:** The `database.sqlite` and `.env` files are ignored to ensure your internal sales data and passwords never reach GitHub.
* **Session Auth:** Admin routes are protected; only the `/go/` links and feedback submission are public.

## 📁 Project Structure

* `server.js`: The core logic and API.
* `schema.sql`: Database table definitions.
* `/public`: Frontend interface.
   * `login.html`: Entry point for admins.
   * `dashboard.html`: Analytics and link management.
   * `feedback.html`: The page where sales reps leave reviews.



## 📝 License
Licensed under the GNU General Public License v3.0 (GPL-3). 
See the [LICENSE](LICENSE) file for details.
