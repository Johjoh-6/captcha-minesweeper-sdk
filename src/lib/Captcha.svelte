<svelte:options customElement="captcha-sweeper" />

<script lang="ts">
	import type { CaptchaState } from "./type";
	import { CaptchaSweeper } from "./api";

	// --- Props ---
	let {
		title = "Captcha Sweeper",
		subtitle = "",
		baseurl = "https://YOUR_GCLOUD_URL",
		difficulty = 1,
		autoinit = true,
	} = $props<{
		title?: string;
		subtitle?: string;
		baseurl?: string;
		difficulty?: number | string;
		autoinit?: boolean | string;
	}>();

	// --- State ---
	let api = $derived(baseurl ? new CaptchaSweeper(baseurl) : null);
	let state: CaptchaState | null = $state(null);
	let loading = $state(false);
	let error: string | null = $state(null);

	function dispatch(type: "solved" | "failed") {
		$host().dispatchEvent(new CustomEvent(type));
	}

	function normalizeDifficulty(value: number | string | undefined): number {
		if (typeof value === "number") return value;
		if (typeof value === "string") {
			const parsed = Number.parseInt(value, 10);
			return Number.isFinite(parsed) ? parsed : 1;
		}
		return 1;
	}

	function normalizeBoolean(value: boolean | string | undefined): boolean {
		if (typeof value === "boolean") return value;
		if (typeof value === "string") return value.toLowerCase() !== "false";
		return true;
	}

	$effect(() => {
		if (normalizeBoolean(autoinit) && !state) initCaptcha();
	});

	// --- Methods ---
	async function initCaptcha() {
		if (!api) {
			error = "Missing baseurl";
			return;
		}
		loading = true;
		error = null;
		try {
			try {
				state = await api.getCaptcha();
			} catch (e) {
				if (e instanceof Error && e.message.includes("NO_CAPTCHA")) {
					const difficultyLevel = normalizeDifficulty(difficulty);
					state = await api.createCaptcha(difficultyLevel);
				} else throw e;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : "Failed to load";
		} finally {
			loading = false;
		}
	}

	async function handleClick(row: number, col: number) {
		if (!api || state?.game_over || loading) return;
		loading = true;
		try {
			state = await api.makeMove(row, col);
			console.log(state);
			if (state.solved) dispatch("solved");
			if (state.mine_hit) dispatch("failed");
		} catch (e) {
			error = e instanceof Error ? e.message : "Move failed";
		} finally {
			loading = false;
		}
	}

	// --- Helpers ---
	function getCellClass(row: number, col: number): string {
		const cell = state?.grid_revealed?.[row]?.[col];
		if (cell === -2) return "unrevealed";
		if (cell === -1) return "mine";
		if (cell === 0) return "empty";
		return `number-${cell}`;
	}

	function getCellContent(row: number, col: number): string {
		const cell = state?.grid_revealed?.[row]?.[col];
		if (cell === -2) return "";
		if (cell === -1) return "💣";
		if (cell === 0) return "";
		return String(cell);
	}
</script>

<!-- Custom Element Template (no Svelte-specific features) -->
<div class="captcha-sweeper">
	<h2>{title}</h2>
	<span>{subtitle}</span>
	{#if error}
		<div class="error">{error}</div>
		<button onclick={initCaptcha}>Retry</button>
	{:else if state}
		<div class="grid" style={`--size: ${state.grid_size}`}>
			{#each Array.from({ length: state.grid_size }) as _, r}
				{#each Array.from({ length: state.grid_size }) as _, c}
					<button
						class="cell {getCellClass(r, c)}"
						onclick={() => handleClick(r, c)}
						disabled={state.game_over || loading}
					>
						{getCellContent(r, c)}
					</button>
				{/each}
			{/each}
		</div>
		{#if state.solved}
			<div class="status solved">✅ Solved!</div>
		{:else if state.mine_hit}
			<div class="status failed">❌ Mine Hit!</div>
		{/if}
	{:else if loading}
		<div class="loading">Loading...</div>
	{:else}
		<button onclick={initCaptcha}>Start</button>
	{/if}
</div>

<style>
	:host {
		display: block;
	}
	.captcha-sweeper {
		width: clamp(200px, 100%, 400px);
		height: clamp(200px, 100%, 400px);
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
		font-family: system-ui, sans-serif;
		margin: 0 auto;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(var(--size), 1fr);
		gap: 2px;
		margin: 16px 0;
	}
	.cell {
		aspect-ratio: 1;
		border: none;
		border-radius: 2px;
		background: #ccc;
		cursor: pointer;
		font-size: 1.2rem;
		transition: all 0.1s;
	}
	.cell.unrevealed {
		background: #667eea;
		color: white;
	}
	.cell.mine {
		background: #ff6b6b;
	}
	.cell.empty {
		background: #f0f0f0;
	}
	.cell.number-1 {
		color: #0000ff;
	}
	.cell.number-2 {
		color: #008000;
	}
	.cell.number-3 {
		color: #ff0000;
	}
	.cell:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}
	.status {
		padding: 8px;
		border-radius: 4px;
		text-align: center;
		font-weight: bold;
	}
	.status.solved {
		background: #4caf50;
		color: white;
	}
	.status.failed {
		background: #ff6b6b;
		color: white;
	}
	.error {
		color: #ff6b6b;
	}
	.loading {
		color: #667eea;
	}
</style>
