# 🌌 ExoFinder: Deep Space Telemetry & AI Analytics

> *"With billions of star systems in the Milky Way alone, and countless exoplanets resting in the habitable zones of their host stars... where is everybody?"*

## The Fermi Paradox Meets Data Science

The Fermi Paradox highlights the terrifying contradiction between the high probability of extraterrestrial life and the absolute lack of evidence for it. **ExoFinder** is built to bridge that gap by giving users a tactical, interactive dashboard to explore the actual telemetry of our universe.

By analyzing real-world astronomical data, mapping constellations, and highlighting **"Goldilocks zone" habitable planets**, ExoFinder provides a localized lens into the greatest mystery in astrophysics.
**Are we alone? Let's look at the data.**

---

## 🚀 What is ExoFinder?

ExoFinder is a **high-performance, full-stack data analytics dashboard** that parses, stores, and visualizes deep-space telemetry. It acts as a **"starship tactical computer,"** allowing users to search through real star systems, view orbiting planetary bodies, and interact with a **context-aware AI** to learn more about specific astronomical regions.

### ✨ Core Features

* **🎮 Gamified Exploration (Trial Mode)**
  Learning astrophysics shouldn't be boring. ExoFinder includes a built-in interactive game mode that bypasses standard pagination to pull from the **entire unrestricted database**, challenging users to test their knowledge of the cosmos.

* **🤖 Context-Aware AI Tactical Terminal**
  Powered by **Google's Gemini 2.5 Flash**, the integrated AI reads the specific database parameters of the star system you are viewing and answers questions with scientifically grounded, contextual accuracy.

* **📊 Deep Space Telemetry Grid**
  View precise data points including **Spectral Class, Lightyear Distance, Kelvin Temperature, and Apparent Magnitude**.

* **🌍 Habitability Scanner**
  Instantly flags planets as **Habitable** or **Hostile** based on their **mass, radius, and orbital period** data.

* **🔭 Observatory Routing**
  Built-in heuristics map **Right Ascension (RA)** and **Declination (Dec)** coordinates to local constellations, providing direct links to external **Stellarium tracking**.

* **⚡ Massive ETL Pipeline**
  The backend efficiently parses and serves a localized database of **40,000+ rows of astronomical telemetry** without memory bottlenecks.

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS (Custom glass-morphism & animations)
* React Router DOM
* Axios

### Backend & AI

* Node.js
* Express.js
* Google GenAI SDK (`gemini-2.5-flash`)
* Context-Aware Prompt Engineering

### Database & Cloud

* MySQL (Hosted on **Aiven Cloud**)
* Vercel (Frontend Deployment)
* Render (Backend Deployment)

---

# 💻 Local Setup & Installation

Want to boot up the **tactical computer** on your local machine? Follow these steps:

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/SiddhanthChauhan/ExoFinder.git
cd ExoFinder
```

---

## 2️⃣ Setup the Node Backend

Open a terminal and navigate to the **Server** directory:

```bash
cd Server
npm install
```

Create a `.env` file inside the **Server** directory with your database credentials and Google AI Key:

```env
PORT=3001
DB_HOST=your_aiven_db_host
DB_PORT=your_aiven_db_port
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=exofinder
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend server:

```bash
npm run dev
# or
node index.js
```

---

## 3️⃣ Setup the React Frontend

Open a **new terminal window** and navigate to the frontend directory:

```bash
npm install
npm run dev
```

Navigate to:

```
http://localhost:5173
```

(or the port provided by **Vite**) to access the dashboard.

---

# 🔮 Future Roadmap

* [ ] Add **user authentication (Appwrite/JWT)** for saving bookmarked star systems
* [ ] Expand the **ETL pipeline** to ingest daily updates from **NASA's Exoplanet Archive API**

Author

Siddhanth Chauhan

🚀 Live Deployment: ExoFinder Dashboard - https://exofinder.vercel.app
🔗 LinkedIn: https://linkedin.com/in/siddhanth-s-chauhan
💻 GitHub: https://github.com/SiddhanthChauhan

"Ad astra per aspera" — To the stars through difficulties.