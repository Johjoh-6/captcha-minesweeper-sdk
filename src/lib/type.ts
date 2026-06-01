/**
 * Core type definitions for Captcha Sweeper SDK
 */
export interface CaptchaState {
	captcha_id: string;
	solved: boolean;
	game_over: boolean;
	mine_hit: boolean;
	grid_size: number;
	/** 2D array representing the revealed grid state:
	 * -2 = unrevealed cell
	 * -1 = mine
	 *  0 = empty cell
	 *  1-8 = count of adjacent mines
	 */
	grid_revealed: number[][];
	difficulty_level: 1 | 2 | 3 | 4 | 5;
	status: "unsolved" | "solved" | "mine_hit";
}

/**
 * Configuration options for the CaptchaSweeper API client
 */
export interface CaptchaSweeperOptions {
	/** Request timeout in milliseconds (default: 10000) */
	timeout?: number;
	/** Custom HTTP headers to include with requests */
	headers?: Record<string, string>;
	/**
	 * Fetch credentials mode (default: "include").
	 * Use "same-origin" for same-site cookies only.
	 */
	credentials?: RequestCredentials;
}

/**
 * Game context state for reactive updates
 */
export interface CaptchaGameContext {
	state: CaptchaState | null;
	loading: boolean;
	error: string | null;
	initialize: (difficultyLevel?: number) => Promise<void>;
	newGame: (difficultyLevel?: number) => Promise<void>;
	move: (row: number, col: number) => Promise<void>;
	reload: () => Promise<void>;
	isActive: () => boolean;
	isComplete: () => boolean;
}

/**
 * Game end event details
 */
export interface GameEndEvent {
	solved: boolean;
	mine_hit: boolean;
}
