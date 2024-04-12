// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in prod
// import type { PageLoad } from "./$types";
export const prerender = true;

// export const load: PageLoad = ({params}) => {
//     return {
//         sections: [
//             { slug: 'profile', title: 'Profile' },
//             { slug: 'notifications', title: 'Notifications' }
//         ]
//     };
// }