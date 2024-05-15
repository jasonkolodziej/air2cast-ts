import type { ParamMatcher } from '@sveltejs/kit';
import { validate, parse } from 'uuid';
export const match: ParamMatcher = (param) => {
	console.log(parse(param));
	console.log(validate(param));
	// return /^\d+$/.test(param);
	return validate(param);
};
