// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in prod

import type { PageLoad } from "./$types";
// export const prerender = true;

export const load: PageLoad = async ({params, parent, data}) => {
    console.log("PageLoad");
    const pageData = data;
    const layoutData = await parent();
    console.log(pageData)

    return {
        sections: [
            { slug: 'profile', title: 'Profile' },
            { slug: 'notifications', title: 'Notifications' }
        ]
    };
}


// export const load: PageLoad = async ({ parent }) => {
// 	const { a, b } = await parent();
// 	return { c: a + b };
// };

// export const loadFromServer: PageServerData = ({params}) => {
//     // console.log(params);
//     // loadW({}).then((response) => {
//     //     return response
//     // })
//     return {
//         parsedJson
//     };
// }

// export const load = async ({ fetch }) => {
//     const response = await fetch(
//       '../lib/server/spsConf.json'
//     )
//     const currencies = await response.json()
//     return currencies
//   }