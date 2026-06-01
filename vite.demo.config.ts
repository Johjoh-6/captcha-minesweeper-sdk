import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = repo ? `/${repo}/` : "/";

export default defineConfig({
	plugins: [svelte()],
	base,
	build: {
		outDir: "demo-dist",
		emptyOutDir: true,
		rollupOptions: {
			input: "demo/index.html",
		},
	},
});
