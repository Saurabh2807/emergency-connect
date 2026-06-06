# Emergency Connect

A modern, professional, hackathon-winning emergency response and resource-sharing platform designed to assist communities, NGOs, hospitals, and volunteers during floods, earthquakes, medical emergencies, and local crises.

---

## 🌟 Key Features

1. **SOS Emergency Beacon**: An instant, high-priority distress system that captures location details and immediately pushes alerts to all nearby volunteer nodes.
2. **Interactive GIS Map**: Powered by Leaflet.js and OpenStreetMap, featuring styled custom SVG markers mapping emergency requests (red), resources (green), and volunteer responders (blue).
3. **Responsive Control Panel (Dashboard)**: Real-time graphs/logs representing active incidents, logistics offers, and network logs.
4. **Verified Blood Donor Registry**: An interactive network filtered by blood group and compatibility matrices (with universal O-negative highlights) allowing direct call coordination.
5. **Aid & Logistics Directory**: Multi-criteria search and filter systems supporting additions, deletions, and fulfillment actions.
6. **Volunteer Mesh Network**: A roster indexing available skills (First Aid, Medical, Rescue, logistics, translation) with direct dispatcher calling.
7. **Admin System Console**: Fully operational moderator dashboard with user metrics, active resource deletion, and a live background simulation matching engine log.
8. **Toast Alert Engine**: A sliding alert drawer demonstrating incoming distress matches and incident registrations.
9. **Dark Mode & Glassmorphism**: Complete CSS custom variables adapting to user theme selections with Backdrop Filters for visual excellence.

---

## 🛠️ Architecture & Tech Stack

This platform is structured as a zero-build client-side **Single Page Application (SPA)** to ensure instant loading speed and cross-platform accessibility out-of-the-box:

- **HTML5**: Structured semantic interface.
- **Vanilla CSS3**: Layouts powered by Flexbox and Grid. CSS Variables drive the Dark Mode configuration.
- **Vanilla ES6 JavaScript**: State engine, hash router, and dynamic DOM rendering.
- **Leaflet.js & OpenStreetMap (via CDN)**: Interactive mapping controls.
- **Lucide Icons (via CDN)**: High-resolution iconography.

---

## 🚀 How to Run Locally

Since this project has no heavy Node.js or npm compiler dependencies, you can serve it using the system's pre-installed Python interpreter:

1. Open your terminal and navigate to the project directory:
   ```bash
   cd /Users/saurabh/Documents/hackathon
   ```

2. Spin up Python's built-in lightweight HTTP server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and navigate to:
   ```url
   http://localhost:8000
   ```

---

## 🔐 Authentication Guide

For testing and demonstration, you can log in through the **Sign In** modal at the top right:

- **Simulate Google Authentication**: Click "Continue with Google" to automatically log in as **Saurabh Dev** with **Admin** access and unlock the Admin Console tab immediately.
- **Simulate Admin Account**: Sign in with email `admin@emergencyconnect.org` and any password to unlock the admin panel.
- **Simulate User Account**: Sign in with any other email address to log in as a normal user.
