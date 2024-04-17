import { json } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import * as fs from "fs";
export const load: LayoutLoad = async ({params, data}) => {
	console.info("LayoutLoad")
	// const {data} = await parent();// fetch("https://google.com");
	// console.log(parent())
	return { 
		data: data
	};
};