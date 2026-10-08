# Deployment

The runnable application is a React/Vite client in `client/` and a Node/Express
API in `server/`. The API uses MongoDB through Mongoose; it does not use
Supabase. Deploy the client to Vercel, the API to Render, and use MongoDB Atlas
for the production database.

## 1. Create the MongoDB Atlas database

1. Create an Atlas project, cluster, database user, and database.
2. Copy the Node.js connection string and replace its username, password, and
   database name with the values for that database user and database.
3. In Atlas **Network Access**, allow connections from Render. Render's
   outbound IP ranges are listed in the Render service's dashboard; if the
   Atlas plan or network setup cannot use those ranges, Atlas may require a
   broader IP rule. Restrict access as much as the hosting setup permits.
4. Keep the connection string private. Set it as `MONGO_URI` in Render, not in
   source control or a Vite variable.

The API readiness endpoint is `/api/health`; it returns HTTP 200 only after the
database connection succeeds.

## 2. Create the Vercel project

Import the GitHub repository into Vercel and set **Root Directory** to
`client`. The Vercel configuration in `client/vercel.json` builds with
`npm run build`, publishes `dist`, and routes client-side paths back to
`index.html`.

Deploy once without setting `VITE_API_URL` so Vercel assigns the production
HTTPS origin. This initial deployment is only to establish the origin; API
requests will not work until the Render service is configured.

## 3. Deploy the API to Render

The repository includes a Render Blueprint at `render.yaml`. In Render, create
a new **Blueprint** from the GitHub repository and select this Blueprint file.
The service uses `server/`, runs `npm ci` and `npm start`, and uses
`/api/health` as its health check.

Set these environment variables for the API service:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Unique random secret with at least 32 characters |
| `JWT_EXPIRE` | `7d` (or another intended token lifetime) |
| `CLIENT_URL` | Exact production HTTPS origin assigned to the Vercel site |
| `COOKIE_SAME_SITE` | `none` for the default cross-site Vercel/Render hostnames |

The Blueprint marks `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` as secrets or
deployment-time values; enter them in Render when prompted. Generate the JWT
secret securely, for example with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.
Do not use the development secret from `server/.env.example`.

Wait for the service to become healthy and note its public HTTPS URL, for
example `https://<service>.onrender.com`. Render supplies `PORT` automatically.

## 4. Connect the client to the API

In Vercel, add this environment variable for the Production environment,
replacing the example with the Render service URL:

```text
VITE_API_URL=https://<service>.onrender.com/api
```

`VITE_API_URL` is embedded into the client at build time, so redeploy the
frontend after changing it.

## 5. Cookie and custom-domain note

The API authenticates with an HTTP-only cookie. The Render Blueprint sets
`COOKIE_SAME_SITE=none` and the API sets cookies as `Secure` in production.
Modern browsers may still block third-party cookies when the Vercel and Render
hostnames are cross-site. For more reliable authentication, configure custom
domains on the same registrable domain, such as `app.example.com` and
`api.example.com`, and update `CLIENT_URL` and `VITE_API_URL` to those
HTTPS domains. Keep `COOKIE_SAME_SITE=none` for cross-site custom domains; for
same-site sibling subdomains, `lax` is also appropriate.

Only the exact client origin in `CLIENT_URL` is allowed by the API's
credentialed CORS configuration. Vercel preview URLs are not automatically
allowed; use the production deployment for acceptance testing or explicitly
configure the API for a trusted preview origin before testing previews.

## 6. Validate the deployment

1. Open `https://<service>.onrender.com/api/health`; it should return HTTP 200.
2. Open the Vercel production URL and refresh a client-side route such as
   `/login`; Vercel should serve the application rather than a 404.
3. Register test accounts for recipient, donor, and hospital roles. Approve a
   test hospital using an administrator account before trying hospital
   operations.
4. Exercise baby registration, donation screening/verification/collection,
   request acceptance/processing/completion, and logout/login.
5. Review browser and Render logs for CORS, cookie, database, and API errors.

Use non-production accounts and data for acceptance testing. Do not run
`npm run seed` against the production database: the demo accounts use a known
password, and seeding is intended for development only.
