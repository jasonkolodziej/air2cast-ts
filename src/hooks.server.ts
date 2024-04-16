// ? https://kit.svelte.dev/docs/hooks#server-hooks
import type { Handle } from '@sveltejs/kit';
import {discoverChromeCast, IsTv} from '$lib/server/mdns.server';
import { Parse } from '$lib/server/libconfig.server';

export const handle: Handle = async ({ event, resolve }) => {
    // console.log(event);
    // const cast = discoverChromeCast;
    // cast.onAvailable(service => {
    //     console.log(service)
    //     IsTv(service) ? console.warn("Device is a TV") : undefined
    // });

    const tresty = `// Diagnostic settings. These are for diagnostic and debugging only. Normally you should leave them commented out
    diagnostics =
    {
    //	disable_resend_requests = "no"; // set this to yes to stop Shairport Sync from requesting the retransmission of missing packets. Default is "no".
    //	log_output_to = "syslog"; // set this to "syslog" (default), "stderr" or "stdout" or a file or pipe path to specify were all logs, statistics and diagnostic messages are written to. If there's anything wrong with the file spec, output will be to "stderr".
    //	statistics = "no"; // set to "yes" to print statistics in the log
    //	log_verbosity = 0; // "0" means no debug verbosity, "3" is most verbose.
    //	log_show_file_and_line = "yes"; // set this to yes if you want the file and line number of the message source in the log file
    //	log_show_time_since_startup = "no"; // set this to yes if you want the time since startup in the debug message -- seconds down to nanoseconds
    //	log_show_time_since_last_message = "yes"; // set this to yes if you want the time since the last debug message in the debug message -- seconds down to nanoseconds
    //	drop_this_fraction_of_audio_packets = 0.0; // use this to simulate a noisy network where this fraction of UDP packets are lost in transmission. E.g. a value of 0.001 would mean an average of 0.1% of packets are lost, which is actually quite a high figure.
    //	retain_cover_art = "no"; // artwork is deleted when its corresponding track has been played. Set this to "yes" to retain all artwork permanently. Warning -- your directory might fill up.
    };
`
    let oo = Parse(tresty) as Object
    console.log(oo)

    // console.log("ll", ll);
    // cast.onAvailable();
	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}

	const response = await resolve(event);
	return response;
};