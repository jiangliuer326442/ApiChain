export interface Options {
	/**
	Set to `false` to avoid spawning subprocesses and instead only resolve the locale from environment variables.

	@default true
	*/
	readonly spawn?: boolean;
}


export function osLocale(options?: Options): Promise<string>;

export function osLocaleSync(options?: Options): string;
