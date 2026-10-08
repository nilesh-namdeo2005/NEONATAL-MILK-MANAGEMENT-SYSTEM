# Deployment

The application is split into a React/Vite static client and a Node/Express API
backed by MongoDB. Deploy the client and API over HTTPS. A custom domain with
the client and API on the same site (for example, `app.example.com` and
`api.example.com`) is recommended so browsers can send the authentication
cookie reliably.

## 1. Prepare MongoDB

- Create a production MongoDB database and a dedicated database user.
- Restrict network access to the API host where your MongoDB provider supports
  it.
- Keep a production backup and use a separate database for development.
- Do not run `npm run seed` against production. The demo accounts use a known
  password and the seed script is intended for development only.

## 2. Deploy the API

Use Node.js 18 or later. From `server/`, install locked dependencies with
`npm ci` and run the service with `npm start`. Configure these environment
variables in the hosting provider (do not commit a `.env` file):

| Variable | Required | Production value |
|---|---|---|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Provider-specific | The port assigned by the hosting provider |
| `MONGO_URI` | Yes | Production MongoDB connection string |
| `JWT_SECRET` | Yes | A unique, cryptographically random secret of at least 32 characters |
| `JWT_EXPIRE` | No | Token lifetime; defaults to `7d` |
| `CLIENT_URL` | Yes | Exact HTTPS origin of the deployed client, without a path |
| `COOKIE_SAME_SITE` | No | Defaults to `lax`; use `none` only when the client and API are cross-site |

The API validates required production settings before connecting to MongoDB.
Its readiness endpoint is `https://<api-host>/api/health`; it returns HTTP 200
only when MongoDB is connected. Configure the hosting provider's health check
to use that path.

The API uses credentialed CORS and an HTTP-only authentication cookie. Keep the
client on the same site as the API when possible. If cross-site hosting is
unavoidable, set `COOKIE_SAME_SITE=none`, use HTTPS for both services, and
allow only the exact client origin through `CLIENT_URL`. Some browsers block
third-party cookies regardless of this setting.

## 3. Deploy the client

Set `VITE_API_URL` at **build time** to the API base URL, including `/api`, for
example `https://api.example.com/api`. From `client/`, run `npm ci` and
`npm run build`, then publish the generated `client/dist/` directory using a
static hosting provider. Configure the static host to serve `index.html` for
client-side routes such as `/login` and `/recipient/dashboard`.

## 4. Validate the deployment

1. Confirm the API health endpoint returns HTTP 200.
2. Open the public landing page and availability search.
3. Register test accounts for recipient, donor, and hospital roles. Approve a
   test hospital using an administrator account before trying hospital
   operations.
4. Exercise baby registration, donation screening/verification/collection,
   request acceptance/processing/completion, and logout/login.
5. Review browser console and API logs; verify no secrets or production
   connection strings are exposed in build output or logs.

Use non-production accounts and data for acceptance testing. The repository
does not create or reset production accounts automatically.
