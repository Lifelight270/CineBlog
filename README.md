# Afterglow — a MERN blog with a scroll-driven colour journey

**Stack:** MongoDB · Express · React (Vite) · Node
**Front-end libraries:** Motion · GSAP + ScrollTrigger · Lenis · Three.js + React Three Fiber + drei · Tailwind · shadcn/ui (Radix) · Aceternity UI · Magic UI · React Bits · glassmorphism

## Run it

You need Node 18+ and a MongoDB instance (local or Atlas).

```bash
# 1. API
cd server
cp .env.example .env        # set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run dev                 # on start, creates YOUR admin from .env if it doesn't exist
npm run seed                # optional: adds 6 sample articles (add --reset to wipe first)
npm run dev                 # http://localhost:5000

# 2. Client (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173  (proxies /api to :5000)
```

If the API is not running, the public pages fall back to bundled sample articles so you can preview the design on its own. Writing, liking and commenting need the API.

## Security notes

- **Only the admin can publish.** Creating, editing and deleting articles (and the dashboard and editor pages) are admin-only, enforced on the server with a `requireAdmin` middleware and mirrored in the UI. Regular accounts can like and comment.
- `/register` always creates a plain `user`. The `role` field is never read from requests.
- The only admin is the one you define in `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) and create with `npm run seed`. To promote someone later, set `role: "admin"` on their user document in MongoDB.
- The server refuses to start without a `JWT_SECRET` of 16+ characters. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- Never commit `.env`.

## Features

- Register / sign in (JWT, bcrypt), role-based access (admin publishes, readers like and comment)
- Articles: create, edit, delete, draft or publish, Markdown with live preview, tags, topics, optional cover URL (generated gradient otherwise)
- Search, topic filter, pagination (state kept in the URL)
- Likes, comments (delete your own), view counter, reading-time estimate, reading progress bar
- Newsletter sign-up stored in MongoDB
- Helmet, CORS, rate limiting, input validation, consistent error responses

## How the motion works

| Effect | Where |
| --- | --- |
| Page palette (surface / ink / accent) changes per section | `lib/scenes.js` + `ScrollColorProvider.jsx`. Put `data-scene="dusk | plum | lagoon | amber"` on any section. |
| 3D knot moves, rotates, scales and recolours with scroll | `components/three/Scene.jsx` reads `live.progress` and the live accent colour every frame |
| Manifesto lines slide in alternating directions, words light up, colour travels ink → accent → ink | `components/ScrollText.jsx` |
| Smooth scrolling in sync with ScrollTrigger | `components/SmoothScroll.jsx` |
| Glass surfaces | `.glass` / `.glass-strong` in `index.css` |

To add a palette, add an entry to `SCENES` in `lib/scenes.js`.

## About the UI component libraries

shadcn/ui, Aceternity UI, Magic UI and React Bits are copy-paste libraries rather than npm packages, so their components live in `src/components/{ui,aceternity,magicui,reactbits}`. They are written in each library's style (Spotlight, 3D Card, Text Generate Effect; Marquee, Shimmer Button, Border Beam, Number Ticker; Split Text, Magnet) and wired to the theme tokens. You can swap any of them for the official version from each library's registry.

## Project layout

```
server/  src/{models,routes,middleware,config}, seed.js
client/  src/{pages,components,context,lib}
```

`client/src/lib/seedData.js` is a copy of `server/src/seedData.js`; keep them in sync if you edit the sample articles.
