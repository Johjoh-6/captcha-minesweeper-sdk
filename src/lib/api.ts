import { CaptchaState, CaptchaSweeperOptions } from "./type";

/**
 * CaptchaSweeper API Client
 * Provides methods to interact with the Captcha Sweeper backend API
 */
export class CaptchaSweeper {
	private baseUrl: string;
	private version: string;
	private timeout: number;
	private headers: Record<string, string>;
	private credentials: RequestCredentials;

	/**
	 * Creates a new CaptchaSweeper API client instance
	 * @param baseUrl - The API endpoint URL (required)
	 * @param version - The API version to use (optional)
	 * @param options - Configuration options
	 * @throws Error if baseUrl is not provided
	 */
	constructor(
		baseUrl: string,
		version: string = "v1",
		options: CaptchaSweeperOptions = {},
	) {
		if (!baseUrl) {
			throw new Error("baseUrl is required for CaptchaSweeper SDK");
		}

		this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
		this.version = version;
		this.timeout = options.timeout ?? 10000;
		this.headers = {
			"Content-Type": "application/json",
			...(options.headers ?? {}),
		};
		this.credentials = options.credentials ?? "include";
	}

	/**
	 * Makes an HTTP request with timeout handling
	 * @param endpoint - API endpoint path
	 * @param options - Fetch options
	 * @returns The JSON response from the server
	 * @throws Error if request fails or times out
	 */
	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseUrl}/${this.version}${endpoint}`;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(url, {
				...options,
				headers: {
					...this.headers,
					...(options.headers ?? {}),
				},
				credentials: options.credentials ?? this.credentials,
				signal: controller.signal,
			});

			if (!response.ok) {
				const error = await response
					.json()
					.catch(() => ({ Error: `HTTP ${response.status}` }));
				throw new Error(
					error.Error ||
						`HTTP ${response.status}: ${response.statusText}`,
				);
			}

			return (await response.json()) as T;
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					throw new Error(`Request timeout after ${this.timeout}ms`);
				}
			}
			throw error;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	/**
	 * Checks the API status
	 * @returns API status response
	 */
	async getStatus(): Promise<{ status: string }> {
		return this.request("/status");
	}

	/**
	 * Retrieves the current active captcha for the session
	 * @returns The current captcha state
	 * @throws Error with message 'NO_CAPTCHA' if no active captcha exists
	 */
	async getCaptcha(): Promise<CaptchaState> {
		try {
			return await this.request<CaptchaState>("/captcha/");
		} catch (error) {
			if (
				error instanceof Error &&
				error.message.includes("not be foun")
			) {
				throw new Error("NO_CAPTCHA");
			}
			throw error;
		}
	}

	/**
	 * Creates a new captcha game
	 * @param difficultyLevel - Difficulty level from 1-5
	 * @returns The newly created captcha state
	 * @throws Error if difficulty level is invalid
	 */
	async createCaptcha(difficultyLevel: number = 1): Promise<CaptchaState> {
		if (
			!Number.isInteger(difficultyLevel) ||
			difficultyLevel < 1 ||
			difficultyLevel > 5
		) {
			throw new Error(
				"Difficulty level must be an integer between 1 and 5",
			);
		}

		return this.request<CaptchaState>("/captcha/new", {
			method: "POST",
			body: JSON.stringify({ difficulty_level: difficultyLevel }),
		});
	}

	/**
	 * Makes a move in the current captcha game
	 * @param row - Grid row index
	 * @param col - Grid column index
	 * @returns Updated captcha state after the move
	 * @throws Error if row or col are not integers
	 */
	async makeMove(row: number, col: number): Promise<CaptchaState> {
		if (!Number.isInteger(row) || !Number.isInteger(col)) {
			throw new Error("Row and column must be integers");
		}

		return this.request<CaptchaState>("/captcha/move", {
			method: "POST",
			body: JSON.stringify({ row, col }),
		});
	}

	/**
	 * Reloads the current captcha game state
	 * @returns Updated captcha state
	 */
	async reload(): Promise<CaptchaState> {
		return this.getCaptcha();
	}
}
