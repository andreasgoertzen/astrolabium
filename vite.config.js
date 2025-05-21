import { defineConfig } from 'vite'
import path from "path";
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "./public"),
    }
  },
  server: {
    proxy: {
      proxy: {
        '/xmatch': { target: 'http://cdsxmatch.u-strasbg.fr', changeOrigin: true, rewrite: p => p.replace(/^\/xmatch/, '') },
        '/skies':    { target: 'https://skies.esac.esa.int',        changeOrigin: true, rewrite: p => p.replace(/^\/skies/, '') },
      }
    }
  }
})
