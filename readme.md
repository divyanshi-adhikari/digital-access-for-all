# Digital Access For All
<p>
<em>
This project aims to make digital content easy and inclusive for everyone — especially those who might face challenges accessing important services online. A full-stack offline-first Progressive Web Application bridging the digital divide by enabling access to essential services—scholarships, ration distribution, emergency healthcare, and community resources—with or without internet connectivity. 
</em>
</p>
---

## About The Project

Millions lack reliable internet access, creating barriers to critical government services. Digital Access For All solves this through an installable PWA that works seamlessly offline and automatically synchronizes data when connectivity returns.


---

## Built With

Frontend   : HTML5, CSS3, JavaScript, PWA (Service Workers), IndexedDB
Backend    : Node.js, Express, SQLite
Tools      : Git, Ngrok

---

## Features

### Forms & Applications
- Government Scheme Application
- Class 10 Scholarship Form
- Class 12 Scholarship Form
- Ration Card Application

### Emergency & Healthcare
- Quick access to emergency information
- Offline availability

### Community Sharing
- Platform for sharing resources
- Support local community needs



### Service Portals


| Module | Purpose |
|--------|---------|
| Government Schemes | General scheme application forms |
| Scholarship (Class 10) | Offline Class 10 scholarship applications |
| Scholarship (Class 12) | Offline Class 12 scholarship applications |
| Ration Card | Offline ration application |
| Emergency Healthcare | Medical information & contacts |
| Community Sharing | QR code-based resource sharing |

### Administration
- Secure admin authentication
- Centralized dashboard with auto-refresh
- Application approval/rejection workflow

---

## Project Structure


```text
digital-access-for-all/
│
├── controllers/          # Business logic
├── models/              # Database models
├── routes/              # API endpoints
├── node_modules/        # Dependencies
├── backup/              # Database backups
│
├── index.html            # Landing page
├── home.html             # Main dashboard
├── community.html        # QR sharing portal
├── emergency.html        # Healthcare info
├── ration.html           # Ration services
├── scholarship10.html    # Class 10 scholarship
├── scholarship12.html    # Class 12 scholarship
├── admin-login.html      # Admin authentication
├── admin.html            # Admin dashboard
│
├── app.js                # Main PWA logic
├── db.js                 # IndexedDB handler
├── sw.js                 # Service worker
├── admin.js              # Admin functions
├── ration.js             # Ration form logic
├── scholarship10.js      # Class 10 logic
├── scholarship12.js      # Class 12 logic
├── community.js          # QR generator
│
├── server.js             # Express server
├── database.js           # SQLite setup
├── mock-server.js        # Development server
│
├── style.css             # Unified styling
├── manifest.json         # PWA config
│
├── package.json          # Dependencies
├── package-lock.json     # Lock file
├── .gitignore            # Git ignore
└── ngrok.exe              # Tunneling tool

 ```
---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

git clone https://github.com/divyanshi-adhikari/digital-access-for-all.git
cd digital-access-for-all
npm install
node database.js
npm run dev

Visit http://localhost:4000

---
## Offline Synchronization

1. When the user is offline, all form submissions are safely stored in the browser using IndexedDB.
2. If the internet connection is unavailable, submissions are automatically queued locally.
3. Once connectivity is restored, the service worker detects the network change and initiates background synchronization.
4. The stored data is then securely synced with the server, and the local queue is cleared to prevent duplication.
---

## Development Status

Completed
- Offline-first PWA with auto-sync capability
- Government scheme forms
- Scholarship application portals (Class 10 & 12)
- Ration services application system
- Emergency healthcare information
- Community sharing platform with QR generation
- Administrative authentication and dashboard
- Application approval/rejection workflow

##  Objective

- To create a simple, accessible, and offline-capable digital platform that helps underserved communities access essential services easily.
- Focus on improving usability, clarity, and reliability for both users and administrators, while supporting the vision of Atmanirbhar Bharat through inclusive and self-reliant digital access.

---

## Contributors

Divyanshi Adhikari
- BTech CSE Core

Pragati Bohra
- BTech CSE (AI & ML)

---

## Future Improvements

- **User Authentication** – Login system with role-based access
- **Cloud Sync** – Real-time data backup across devices
- **Mobile Apps** – Dedicated Android & iOS versions
- **Multi-language** – Support for Hindi and regional languages
- **SMS Notifications** – Offline users get application updates via text
- **Analytics Dashboard** – Visual insights and report generation
- **Voice Input** – Fill forms by speaking
- **Accessibility** – Screen reader & high contrast mode
- **Government Integration** – Direct Benefit Transfer (DBT) API
- **Community Chat** – In-app messaging for resource sharing

---
