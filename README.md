# ORN SKY 27 — Landing page

Sponsor-facing landing page for **ORN SKY 27**, the International Aircraft Exhibition at Le Méridien Oran, September 2027.

- React 18 + Vite, Three.js via @react-three/fiber (procedural airliner, dusk sky shader)
- English / French / Arabic (RTL)
- Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`

## Develop

```bash
npm install
npm run dev
```

Event figures and the contact email live in `src/config.js`; all copy is in `src/i18n.jsx`.
