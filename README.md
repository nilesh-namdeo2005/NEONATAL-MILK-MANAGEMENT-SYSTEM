# Neonatal Milk Management System

The runnable application is the MERN app in `client/` and `server/`. The older
`neonatal-milk-management/` folder is a separate Flask/MySQL scaffold; it is not
used by the React/Vite front end.

## Requirements

- Node.js 18 or later
- MongoDB 6 or later (local service or MongoDB Atlas)

## Configure and start

In PowerShell, configure the API:

```powershell
Set-Location .\server
Copy-Item .env.example .env
```

Edit `server/.env` and set `MONGO_URI` to a development database, for example:

```text
MONGO_URI=mongodb://127.0.0.1:27017/neonatal_milk_mgmt
```

Install dependencies and start the API:

```powershell
npm install
npm run dev
```

In a second PowerShell window, start the web app:

```powershell
Set-Location .\client
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL printed in the client terminal (default:
`http://localhost:5173`). The Vite development proxy forwards `/api` requests to
`http://localhost:5000`. For a deployed client, set `VITE_API_URL` to the
deployed API base URL.

## Seed development data

With MongoDB running and `server/.env` configured, run:

```powershell
Set-Location .\server
npm run seed
```

Seeding is additive and safe to re-run: it creates missing demo accounts and
records but does not drop the database, replace existing passwords, or reset
workflow state. Use a dedicated development database in `MONGO_URI`; do not
use these demonstration credentials in production.

The demo password for accounts newly created by the seed script is
`password123`:

| Role | Email | Seeded state |
|---|---|---|
| Admin | `admin@nmm.com` | Active |
| Hospital | `hospital1@nmm.com` | Approved, 300 ml O+ in stock |
| Hospital | `hospital2@nmm.com` | Approved |
| Hospital | `hospital3@nmm.com` | Pending admin approval |
| Donor | `donor1@nmm.com` | Screening approved; collected donation |
| Donor | `donor2@nmm.com` | Screening approved; verified donation |
| Donor | `donor3@nmm.com` | Screening pending; pending donation |
| Recipient | `recipient1@nmm.com` | Registered O+ baby and emergency request |
| Recipient | `recipient2@nmm.com` | Registered A+ baby |

If an account with one of these emails already exists, the seeder preserves its
password. Use a fresh development database if you need to guarantee the demo
passwords.

## End-to-end workflow

1. Sign in as `admin@nmm.com`, approve `hospital3@nmm.com`, and confirm it can
   then sign in as a hospital.
2. Sign in as `hospital1@nmm.com`. In **Donor Screening**, approve the pending
   screening for Donor 3. In **Donation Queue**, verify that donor's pending
   donation. The donor will see its token and QR code.
3. Collect a verified donation from the hospital dashboard. Its measured
   quantity increases that blood group's available inventory and receives a
   six-month expiry date.
4. Sign in as `recipient1@nmm.com`. The seeded emergency 150 ml request is
   already in the hospital queue. Try the 400 ml request to confirm that an
   over-stock acceptance is rejected; accept the 150 ml request to generate
   its token and reserve the required stock.
5. Process and complete the accepted request. Available stock decreases by
   150 ml when it is completed. The request token and QR code are available in
   the recipient's tracking page.
6. Sign in as the admin and confirm the dashboard counts, charts, hospital
   approval state, and activity history reflect the operations.

The expiry cron runs daily at midnight. To run the same expiry check
immediately after setting a collected donation's `expiryDate` in the past, use:

```powershell
Set-Location .\server
npm run check-expiry
```

## Build

```powershell
Set-Location .\client
npm run build
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production environment settings,
hosting guidance, and a post-deployment verification checklist.
