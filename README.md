# Parametric Loom Designer

**Live site:** https://loom-designer.com/

Parametric Loom Designer is a browser-based design tool for creating 3D-printable knitting looms. Adjust the loom shape, peg count, spacing, gauge, board dimensions, and peg details, then preview the geometry in 3D and export a binary STL for printing.

## Features

- Interactive 3D preview built with React Three Fiber and Three.js
- Round, rectangular-frame, and straight-row loom layouts
- Gauge presets for fine, regular, and chunky yarn
- Peg count or peg spacing driven layout modes
- Millimeter and inch display modes
- Configurable peg diameter, height, and tip style
- Build plate presets with fit validation before export
- Binary STL export for slicing and 3D printing
- Light and dark theme support

## Tech Stack

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

The site is deployed to GitHub Pages with GitHub Actions. The workflow builds the Vite app and publishes the generated `dist` folder.

The custom domain is configured through `public/CNAME`:

```text
loom-designer.com
```

## Project Status

The current version focuses on practical loom geometry, live visualization, and STL export. Oval looms and threaded peg attachment are planned areas for future expansion.
