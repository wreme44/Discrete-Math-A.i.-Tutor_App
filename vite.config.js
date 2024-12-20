import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['mathlive']
  },
  define: {
    'process.env': {},
  },
})



// package json new

// {
//     "name": "discrete-mentor",
//     "private": true,
//     "version": "0.0.0",
//     "type": "module",
//     "scripts": {
//       "dev": "vite",
//       "build": "vite build",
//       "lint": "eslint .",
//       "preview": "vite preview",
//       "server": "node server/server.mjs",
//       "start": "vite build",
//       "dev:all": "concurrently \"npm run dev\" \"npm run server\""
//     },
//     "dependencies": { 
//       "@excalidraw/excalidraw": "^0.17.6",
//       "@heroicons/react": "^2.1.5",
//       "@supabase/supabase-js": "^2.45.4",
//       "@tailwindcss/typography": "^0.5.15",
//       "@vitejs/plugin-react": "^4.3.3",
//       "axios": "^1.7.7",
//       "concurrently": "^8.0.1",
//       "cors": "^2.8.5",
//       "discrete-mentor": "file:",
//       "dompurify": "^3.1.6",
//       "dotenv": "^16.4.5",
//       "express": "^4.21.0",
//       "framer-motion": "^11.11.11",
//       "highlight.js": "^11.10.0",
//       "lodash": "^4.17.21",
//       "marked": "^14.1.2",
//       "mathlive": "^0.101.2",
//       "openai": "^4.72.0",
//       "postcss": "^8.4.45",
//       "re-resizable": "^6.9.18",
//       "react": "^18.3.1",
//       "react-dom": "^18.3.1",
//       "react-katex": "^3.0.1",
//       "react-markdown": "^9.0.1",
//       "react-modal": "^3.16.1",
//       "react-resizable": "^3.0.5",
//       "react-router-dom": "^6.28.0",
//       "react-toastify": "^10.0.6",
//       "rehype-katex": "^7.0.1",
//       "rehype-sanitize": "^6.0.0",
//       "remark-gfm": "^4.0.0",
//       "remark-html": "^16.0.1",
//       "remark-math": "^6.0.0",
//       "tailwindcss": "^3.4.15",
//       "vite": "^5.4.11"
//     },
//     "devDependencies": {
//       "@eslint/js": "^9.9.0",
//       "@types/react": "^18.3.3",
//       "@types/react-dom": "^18.3.0",
//       "autoprefixer": "^10.4.20",
//       "eslint": "^9.9.0",
//       "eslint-plugin-react": "^7.35.0",
//       "eslint-plugin-react-hooks": "^5.1.0-rc.0",
//       "eslint-plugin-react-refresh": "^0.4.9",
//       "globals": "^15.9.0"
//     },
//     "engines": {
//       "node": "20.x",
//       "npm": "10.x"
//     }
//   }
  


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { resolve } from 'path';

// // https://vitejs.dev/config/


// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     include: ['mathlive'],
//   },
//   resolve: {
//     alias: {
//       react: resolve('./node_modules/react'),
//       'react-dom': resolve('./node_modules/react-dom'),
//     },
//   },
//   build: {
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           vendor: ['react', 'react-dom'],
//         },
//       },
//     },
//   },
//   define: {
//     'process.env': {},
//   },
// });
