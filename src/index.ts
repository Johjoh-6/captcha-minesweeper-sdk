import Captcha from "./lib/Captcha.svelte";

// Register custom element (Svelte 5: cast to CustomElementConstructor)
if (
	typeof customElements !== "undefined" &&
	!customElements.get("captcha-sweeper")
) {
	customElements.define(
		"captcha-sweeper",
		Captcha as unknown as CustomElementConstructor,
	);
}

// Export for direct usage
export { Captcha };
export { CaptchaSweeper } from "./lib/api";
export type { CaptchaState, CaptchaSweeperOptions } from "./lib/type";
