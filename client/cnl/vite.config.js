import { resolve } from 'path'
import { defineConfig } from "vite";
import path from 'path';

export default defineConfig({
	root: path.resolve(__dirname, ''),
	resolve: {
		alias: {
		  '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
		}
	},
	server: {
		open: "./index.html"
	},
	build: {
		rollupOptions: {
		  input: {
			main: resolve(__dirname, '/index.html'),  
		  }
		}
	},
	base: ''
});
