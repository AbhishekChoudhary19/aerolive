# ✈️ AeroLive — Full Stack MERN Live Flight & Cargo Tracker

A complete real-time flight and cargo tracking application matching the AeroLive frontend design, built with the MERN stack.

---

## 🚀 Features

- **Live Flight Map** — Real-time aircraft positions from OpenSky Network API
- **Flight Search** — Search by callsign, route, or airline
- **Flight Detail Panel** — Altitude, speed, heading, route progress, timeline
- **Cargo / AWB Tracking** — Real-time parcel tracking with event history
- **Airports Dashboard** — Indian airports with live weather & delay info
- **AeroAI Chatbot** — Powered by Claude AI for smart flight assistance
- **User Auth** — JWT-based register/login with saved flights
- **Socket.IO** — Real-time push updates every 15 seconds
- **Dark Glass UI** — Matches the original AeroLive design exactly

---

## 📁 Project Structure

```
aerolive/
├── server/                     # Express + MongoDB backend
│   ├── controllers/
│   │   ├── flightController.js  # OpenSky API + enrichment
│   │   ├── cargoController.js   # AWB tracking
│   │   ├── airportController.js # Airport data
│   │   └── authController.js    # JWT auth
│   ├── models/
│   │   ├── User.js
│   │   ├── Flight.js
│   │   └── Cargo.js
│   ├── routes/
│   │   ├── flights.js
│   │   ├── cargo.js
│   │   ├── airports.js
│   │   └── auth.js
│   ├── middleware/
│   │   └── auth.js
│   ├── index.js                 # Main server + Socket.IO
│   └── .env.example
│
├── client/                     # React frontend
│   ├── public/index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.js
│       │   ├── Hero.js
│       │   ├── LiveMap.js       # Leaflet map with live planes
│       │   ├── FlightList.js
│       │   ├── FlightDetail.js
│       │   ├── CargoTracker.js
│       │   ├── AirportGrid.js
│       │   ├── ChatBot.js       # AI-powered chatbot
│       │   ├── AuthModal.js
│       │   └── Toast.js
│       ├── context/
│       │   ├── FlightContext.js  # Global flight state + sockets
│       │   └── AuthContext.js
│       ├── services/
│       │   ├── api.js            # Axios API calls
│       │   └── socket.js         # Socket.IO client
│       ├── App.js
│       ├── index.js
│       └── index.css
│
└── package.json                 # Root scripts
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install all dependencies
npm run install:all
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/aerolive
JWT_SECRET=your_secret_key_here

# Optional: For higher rate limits on OpenSky (register free at opensky-network.org)
OPENSKY_USERNAME=your_username
OPENSKY_PASSWORD=your_password

# Optional: For enriched flight data (get free key at aviationstack.com)
AVIATIONSTACK_KEY=your_key_here

CLIENT_URL=http://localhost:3000
```

### 3. Run the App

```bash
# Run both server and client together
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend
npm run start:server

# Terminal 2 - Frontend
npm run start:client
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health check**: http://localhost:5000/api/health

---

## 🌐 API Endpoints

### Flights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights` | All live flights |
| GET | `/api/flights/stats` | Flight statistics |
| GET | `/api/flights/route?from=BLR&to=DEL` | Flights by route |
| GET | `/api/flights/:callsign` | Specific flight details |

### Cargo
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cargo` | All cargo |
| GET | `/api/cargo/:awb` | Track by AWB |
| POST | `/api/cargo` | Create cargo (auth) |
| PATCH | `/api/cargo/:awb/status` | Update status (auth) |

### Airports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/airports` | All airports |
| GET | `/api/airports/:code` | Airport with live status |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (auth) |

### Socket.IO Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `flights:update` | Server → Client | New flight positions |
| `stats:update` | Server → Client | Live statistics |
| `flight:subscribe` | Client → Server | Watch specific flight |

---

## 🔑 API Keys

### OpenSky Network (FREE, no key required)
- Works without any key
- Register at https://opensky-network.org for higher rate limits
- Covers all aircraft worldwide in real-time

### AviationStack (FREE tier available)
- Get a key at https://aviationstack.com
- Enriches flights with airline names, schedules, and status
- Without key: OpenSky raw data is used with demo enrichment

---

## 🎯 Demo Data

Without API keys the app falls back to 10 realistic demo Indian flights that update with simulated movement.

Demo AWB numbers for cargo testing:
- `AWB998877665` — Electronics cargo BLR→DEL on AI101
- `AWB123456789` — Textiles cargo BOM→MAA on 6E456

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Leaflet, TailwindCSS |
| Backend | Express.js, Node.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| Auth | JWT + bcryptjs |
| Maps | Leaflet + CartoDB dark tiles |
| Flight Data | OpenSky Network API |
| AI Chat | Claude claude-sonnet-4-20250514 |
| Scheduling | node-cron |

---

## 📝 Notes

- The ChatBot uses the Anthropic API. Without a key it uses smart local fallbacks.
- Flight positions update every 15 seconds via Socket.IO.
- MongoDB is used for users and cargo. Flights are fetched live and cached in memory.
- The dark map uses CartoDB dark tiles (no API key needed).
