<div align="center">

# 🛡️ Zabih Ullah - Cybersecurity Portfolio

A high-tech, interactive portfolio built to showcase cybersecurity expertise, certifications, projects, and skills. Designed with a sleek, darker "Cosmic Slate" terminal-inspired theme.

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Site-success?style=for-the-badge&logo=vercel)](https://ais-pre-4kfj2ueziugirkfn6cbd7r-947675705208.asia-east1.run.app)
[![Tech Stack](https://img.shields.io/badge/React_18-TypeScript-blue?style=for-the-badge&logo=react)](#)
[![Tech Stack](https://img.shields.io/badge/Vite-TailwindCSS-purple?style=for-the-badge&logo=vite)](#)
[![Firebase](https://img.shields.io/badge/Firebase_Firestore-Auth-ffca28?style=for-the-badge&logo=firebase)](#)

</div>

---

## 📸 Front Page Preview

*(Replace the placeholder image below with a screenshot of your deployed application)*

<img src="https://via.placeholder.com/1200x600/0f172a/64748b?text=Cybersecurity+Portfolio+Preview+(Screenshot)" alt="Frontend View" width="100%">

---

## ✨ Key Features

- **🔒 Secure Admin Dashboard:** Protected via Firebase Authentication, allowing you to manage content seamlessly.
- **🛠️ Dynamic Projects & Malware Analysis Showcase:** Add, edit, and organize custom cybersecurity projects (e.g., malware sandboxes).
- **📜 Certifications Tracker:** Live tracking and display of your professional infosec and IT certifications.
- **🧠 Skills Registry:** Centralized matrix visually detailing technical proficiencies.
- **📝 Blog Integration:** In-house blogging system for incident write-ups, vulnerability disclosures, and research.
- **🎨 High-Tech Aesthetic:** "Cosmic Slate/Terminal" visual identity emphasizing a dark, modern, and high-contrast professional look.
- **🌩️ Cloud Persistence:** Uses Firebase Firestore for reliable, real-time data syncing and persistence so you don't lose data across devices.

## 💻 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React (Icons), Framer Motion (Animations)
- **Backend / Database:** Firebase Firestore (NoSQL), Firebase Authentication
- **Build Tool:** Vite
- **Deployment Ready:** Configured to be easily exported to GitHub and hosted on Vercel, Netlify, or Firebase Hosting.

## 🚀 Live Demo

You can view the latest live version of the project here:  
**[👉 View Live Portfolio](https://ais-pre-4kfj2ueziugirkfn6cbd7r-947675705208.asia-east1.run.app)**

---

## 📦 Setting Up for Deployment (e.g., GitHub to Vercel)

If you are exporting this project to deploy yourself on a platform like Vercel:

1. **Push to GitHub:** Commit your code and push it to a new GitHub repository.
2. **Connect to Vercel:** Open Vercel, click "Add New Project", and import your GitHub repository.
3. **Environment Variables:** During the Vercel setup, add all properties from your `.env.example` as actual environment variables inside Vercel. 
   - Ensure the Firebase API Keys and config values matching the project are added perfectly to allow the admin panel and live trackers to load.
4. **Deploy:** Click deploy. Vercel will auto-detect the Vite configuration and build your static site seamlessly!
5. **CRITICAL - FIX FIREBASE AUTHENTICATION DOMAIN ERROR (Handshake failed):** By default, Firebase restricts logins to `localhost` and your default Firebase URL. When you deploy to Vercel, your site gets a new URL (e.g., `my-portfolio.vercel.app`).
   - Go to your [Firebase Console](https://console.firebase.google.com/).
   - Click on **Authentication** > **Settings** (or Settings tab in older UI) > **Authorized domains**.
   - Click **Add domain** and enter your new Vercel domain (e.g., `my-portfolio.vercel.app`). Do not include `https://` or trailing slashes.
   - Wait 2-3 minutes, then refresh your deployed site. The login handshake will now succeed!

## 🔧 Local Development

1. Run `npm install` to install project dependencies.
2. Ensure you have copied `.env.example` to `.env` and populated your Firebase Configuration Details.
3. Run `npm run dev` to start the local development server.
