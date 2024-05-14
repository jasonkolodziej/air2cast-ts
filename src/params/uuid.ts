import type { ParamMatcher } from '@sveltejs/kit';
// import { validate } from 'uuid';
export const match: ParamMatcher = (param) => {
	console.log(param);
	return /^\d+$/.test(param);
	// return validate(param);
};
