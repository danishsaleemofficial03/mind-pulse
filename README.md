# MindPulse CS — GUTECH Al-Ghazali University

Digital well-being web app for CS students.
Design Thinking Midterm Project | Fall 2026 | Dr. Rauf Ahmed Shams Malick

## Run
```bash
npm install
npm run dev      # open the printed local URL
npm run build    # production build in /dist
```

## Features
- Home / Dashboard with focus streak and points
- Focus Guard: Pomodoro timer (25 min), 5-min break, 10-second demo break (+10 Focus Points per completed break)
- Anonymous Vent Space with client-side moderation (PII / abuse / crisis keyword checks)
- Campus Counseling: Direct Line and Emergency Distress modals
- B&W Sleep Mode (grayscale toggle)

## Before deployment
Replace the demo counseling number in `DirectModal` (src/App.jsx) with the official extension.
Data (points, posts) is stored only in each user's browser localStorage.
