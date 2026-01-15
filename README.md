# Smart Restaurant Management System

A full-stack restaurant management system with AI assistant, order management, and reservation features.

## Quick Start

**Option 1: Use startup scripts (Recommended)**

Double-click `run.bat` (Windows) or run in PowerShell:

```powershell
.\run.ps1
```

The script will:

- Check Node.js installation
- Install dependencies automatically
- Create `.env` configuration file
- Start backend server (http://localhost:5000)
- Start frontend application (http://localhost:3000)

**Option 2: Manual startup**

```bash
npm install              # Install dependencies
npm run start-server     # Start backend
npm start                # Start frontend (in another terminal)
```

Then open http://localhost:3000 in your browser.

---

## Detailed Configuration

### Prerequisites

- Node.js 18+ (npm included)
- MongoDB (local service or cloud Atlas)
- Internet connection (first run only - for AI model download)

## Configure `.env`

Create or edit `.env` in the project root. Key fields:

- Database:

  - `MONGO_URI=mongodb://127.0.0.1:27017` for local; or your Atlas connection string
  - `DB_NAME=test` (change to your database name)

- Server & Domain:

  - Backend: `HOST=0.0.0.0`, `PORT=5000`
  - Frontend origin: `CLIENT_URL=http://localhost:3000`
  - For LAN or custom domains, set `CLIENT_URL` to your real frontend URL, e.g. `http://your-domain.com`

- Admin Key:

  - `ADMIN_SECRET=SRMS-ADMIN-2025`
  - Enter this on the frontend “Admin Register” page to create an administrator; otherwise accounts are customers

- JWT:
  - `JWT_SECRET=your-jwt-secret-here`
  - `JWT_EXPIRES=7d`

Example `.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=test
HOST=0.0.0.0
PORT=5000
CLIENT_URL=http://localhost:3000
ADMIN_SECRET=SRMS-ADMIN-2025
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES=7d
```

> Restart the backend after changing `.env` to apply updates.

## Connecting to MongoDB

- Local: Install MongoDB and start the Windows service “MongoDB”, or run `mongod`. Ensure `MONGO_URI` points to your local address.
- Atlas: Create a cluster, copy the connection string, and replace `MONGO_URI` in `.env`. Choose any `DB_NAME` you prefer.

## Run and Verify

1. Install dependencies:

```bash
npm install
```

2. Start backend and frontend (VS Code tasks or commands):

```bash
npm run start-server
npm start
```

3. Open the frontend: `http://localhost:3000`
4. On “Admin Register”, use `ADMIN_SECRET` to register an admin. Verify in Compass or via API that the `users` collection role is `admin`.

## Seed Demo Data (Optional)

**Note:** The database already contains 30 real menu items. This seeding script is optional and only needed if you want to add additional demo data.

Use the provided PowerShell script to create a demo admin and insert 12 more sample menu items:

```powershell
# Run from PowerShell (Windows)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
$env:ADMIN_SECRET="SRMS-ADMIN-2025"
PowerShell -NoProfile -ExecutionPolicy Bypass -File .\seed.ps1
```

**Optional parameters:**

```powershell
PowerShell -File .\seed.ps1 -ApiBase http://localhost:5000 -AdminEmail admin@example.com -AdminPassword Admin123! -AdminName "Demo Admin"
```

**What it does:**

- Registers an admin using `ADMIN_SECRET` (skips if email exists)
- Logs in to get a token
- Inserts 12 additional demo menu items via API (skips duplicates)
- Verifies the data was inserted

After seeding, refresh the Menu page or verify with:

```bash
curl http://localhost:5000/api/menu
```

## AI Assistant

This project includes an intelligent AI assistant powered by Groq API (Llama 3.3 70B).

### Features

- **Menu queries**: "show desserts", "what vegetarian dishes do you have"
- **Price filtering**: "dishes under $15", "what's the cheapest item"
- **Recommendations**: "suggest something spicy", "recommend popular dishes"
- **Category browsing**: "list beverages", "show starters"
- **Natural conversation** in both English and Chinese

**Note:** The AI requires internet connection. If the API is unavailable, users will see an error message directing them to contact staff.

## Troubleshooting

- **Port already in use**: Stop existing Node.js processes with `taskkill /F /IM node.exe` (Windows) or `killall node` (Mac/Linux)
- **No database visible**: MongoDB creates databases/collections on first write. Perform a registration or data insert, then check in Compass.
- **Admin registered as customer**: Ensure the key entered on "Admin Register" matches `.env` `ADMIN_SECRET` (default: `SRMS-ADMIN-2025`)
- **AI not responding**: Check internet connection. The AI requires Groq API access.
- **CORS errors**: Verify `CLIENT_URL` in `.env` matches your frontend URL exactly (default: `http://localhost:3000`)
