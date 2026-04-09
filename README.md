# 🚀 Zenniths (ClubFlow)

# live link

https://clubflowcmr.netlify.app/

**Build. Compete. Innovate.** 

Zenniths (powered by ClubFlow) is a modern, real-time platform designed specifically for college technical clubs. It serves as the ultimate central hub where students can register for upcoming events, showcase the projects they've poured their hearts into, compete in coding challenges, and climb the ranks on a live club leaderboard.

Instead of managing your club through messy WhatsApp groups, scattered Google Forms, and endless spreadsheets, Zenniths brings everything together into one beautiful, streamlined experience.

---

## ✨ Why We Built This

Running a technical club shouldn't feel like a chore. We wanted a space that felt truly *alive*—where an announcement immediately pings everyone, where a hackathon project looks like a professional portfolio piece, and where club members feel genuinely motivated to contribute and learn. 

## 🎯 Key Features

- **⚡ Real-Time Everything**: Powered by WebSockets, announcements and leaderboard changes happen instantly without refreshing the page.
- **📅 Seamless Event Management**: Members can explore and register for events with one click. Admins can track attendance and export lists straight to Excel.
- **🛠️ Project Showcase**: A stunning gallery where members can upload their hackathon wins, complete with GitHub links, live demos, and cover images. 
- **🏆 Gamified Leaderboard**: Participation earns you points! Climb the ranks from *Newbie* to *Legend* by engaging with challenges and club activities.
- **🔐 Bulletproof Security**: We utilize dual JWT tokens, httpOnly cookies (to prevent XSS), and OTP-based email verification using the Resend API to ensure every account belongs to a real student.

---

## 💻 The Tech Stack

We built Zenniths using the **MERN** stack, supercharged with a few awesome tools:

- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion (for buttery-smooth animations)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Cloud)
- **Real-Time Engine**: Socket.io
- **Media Storage**: Cloudinary (because your server shouldn't hold images!)
- **Email Delivery**: Resend HTTP API (bypassing strict SMTP blockades)

---

## 🛠️ Getting Started Locally

Want to spin this up on your own machine? It's easy!

### 1. Clone the repository
```bash
git clone https://github.com/vikasvkori1290/zenniths.git
cd zenniths
```

### 2. Set up the Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` folder (use `.env.example` as a template) and add your MongoDB, Cloudinary, Google OAuth, and Resend credentials.
```bash
npm run dev
```

### 3. Set up the Frontend
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```

The frontend will start on exactly `http://localhost:5173`. 

---

## 🌐 Production Deployment

Zenniths is fully optimized for cloud deployment! 
- The **backend** is hosted on Render and includes a self-pinging mechanism so the server never falls asleep.
- The **frontend** is deployed on Netlify with automated continuous deployment from the `main` branch.

---

*Made with ❤️ for the next generation of campus builders and innovators.*
