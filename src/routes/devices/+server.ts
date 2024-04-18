import { PWD } from "$env/static/private";
import { json } from "@sveltejs/kit";
import * as fs from 'fs';

export async function POST({ request, cookies, route }) {
    console.debug(`${route.id}.${request.method}`)
	const { description } = await request.json();

	// const userid = cookies.get('userid');
	// const { id } = await database.createTodo({ userid, description });
	// return json({ id }, { status: 201 });
	return json({
        data: JSON.parse(fs.readFileSync(PWD+"/src/lib/server/spsConf.json", 'utf-8'))
    })

    // return json('', {status: 201})
}

