import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

export default defineConfig({
	plugins: [svelte()],
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "CaptchaSweeper",
			formats: ["es", "umd"],
			fileName: (format) => `captcha-sweeper.${format}.js`,
		},
		rollupOptions: {
			output: {
				globals: {},
				assetFileNames: "assets/[name][extname]",
			},
		},
		codeSplitting: false,
		cssCodeSplit: false,
		minify: true,
	},
});
