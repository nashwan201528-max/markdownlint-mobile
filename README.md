# markdownlint-mobile

Mobile app for linting Markdown files using markdownlint, packaged for Android via Capacitor.

## Features

- Edit Markdown content directly in the app
- Open `.md` and `.markdown` files from the device
- Run lint checks using `markdownlint`
- View rule violations with line numbers and details
- Package the web app for Android with Capacitor

## Getting started
##p
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Build the production bundle:
   ```bash
   npm run build
   ```
4. Sync the Android project:
   ```bash
   npm run cap:sync
   ```
5. Open Android Studio:
   ```bash
   npm run cap:open:android
   ```

## Project structure

```text
.
├── capacitor.config.ts
├── index.html
├── package.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```
