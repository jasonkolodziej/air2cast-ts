import type { ParamMatcher } from '@sveltejs/kit';

const Runner = ['connect', 'disconnect'];
export const match: ParamMatcher = (param: string) => {
	return Runner.includes(param);
};
