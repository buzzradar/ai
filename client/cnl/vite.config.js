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
		open: "./src/index.html"
	},
	build: {
		rollupOptions: {
		  input: {
			main: './src/index.html'
		  }
		}
	},
	base: ''
});
