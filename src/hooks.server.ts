// ? https://kit.svelte.dev/docs/hooks#server-hooks
import type { Handle } from '@sveltejs/kit';
import {discoverChromeCast, IsTv} from '$lib/server/mdns.server';
import { Parse } from '$lib/server/libconfig.server';
import { arp } from '$lib/server/arp.server';

export const handle: Handle = async ({ event, resolve }) => {
    // console.log(event);
    // const cast = discoverChromeCast;
    // cast.onAvailable(service => {
    //     console.log(service)
    //     IsTv(service) ? console.warn("Device is a TV") : undefined
    // });

    const test = `// Sample Configuration File for Shairport Sync
    // Commented out settings are generally the defaults, except where noted.
    // Some sections are operative only if Shairport Sync has been built with the right configuration flags.
    // See the individual sections for details.
    
    // General Settings
    general = {
        name = "%H"; // This means "Hostname" -- see below. This is the name the service will advertise to iTunes.
    //		The default is "Hostname" -- i.e. the machine's hostname with the first letter capitalised (ASCII only.)
    //		You can use the following substitutions:
    //				%h for the hostname,
    //				%H for the Hostname (i.e. with first letter capitalised (ASCII only)),
    //				%v for the version number, e.g. 3.0 and
    //				%V for the full version string, e.g. 3.3-OpenSSL-Avahi-ALSA-soxr-metadata-sysconfdir:/etc
    //		Overall length can not exceed 50 characters. Example: "Shairport Sync %v on %H".
    //	password = "secret"; // (AirPlay 1 only) leave this commented out if you don't want to require a password
        interpolation = "auto"; // aka "stuffing". Default is "auto". Alternatives are "basic" or "soxr". Choose "soxr" only if you have a reasonably fast processor and Shairport Sync has been built with "soxr" support.
        output_backend = "alsa"; // Run "shairport-sync -h" to get a list of all output_backends, e.g. "alsa", "pipe", "stdout". The default is the first one.
        mdns_backend = "avahi"; // Run "shairport-sync -h" to get a list of all mdns_backends. The default is the first one.
    //	interface = "name"; // Use this advanced setting to specify the interface on which Shairport Sync should provide its service. Leave it commented out to get the default, which is to select the interface(s) automatically.
        port = "<number>"; // Listen for service requests on this port. 5000 for AirPlay 1, 7000 for AirPlay 2
    //	udp_port_base = 6001; // (AirPlay 1 only) start allocating UDP ports from this port number when needed 
    //	udp_port_range = 10; // (AirPlay 1 only) look for free ports in this number of places, starting at the UDP port base. Allow at least 10, though only three are needed in a steady state.
    //	airplay_device_id_offset = 0; // (AirPlay 2 only) add this to the default airplay_device_id calculated from one of the device's MAC address
        airplay_device_id = 0x00L; // (AirPlay 2 only) use this as the airplay_device_id e.g. 0xDCA632D4E8F3L -- remember the "L" at the end as it's a 64-bit quantity!
    //	regtype = "<string>"; // Use this advanced setting to set the service type and transport to be advertised by Zeroconf/Bonjour. Default is "_raop._tcp" for AirPlay 1, "_airplay._tcp" for AirPlay 2.
    
    //	drift_tolerance_in_seconds = 0.002; // allow a timing error of this number of seconds of drift away from exact synchronisation before attempting to correct it
    //	resync_threshold_in_seconds = 0.050; // a synchronisation error greater than this number of seconds will cause resynchronisation; 0 disables it
    //	resync_recovery_time_in_seconds = 0.100; // allow this extra time to recover after a late resync. Increase the value, possibly to 0.5, in a virtual machine.
    //	playback_mode = "stereo"; // This can be "stereo", "mono", "reverse stereo", "both left" or "both right". Default is "stereo".
    //	alac_decoder = "hammerton"; // This can be "hammerton" or "apple". This advanced setting allows you to choose
    //		the original Shairport decoder by David Hammerton or the Apple Lossless Audio Codec (ALAC) decoder written by Apple.
    //		If you build Shairport Sync with the flag --with-apple-alac, the Apple ALAC decoder will be chosen by default.
    
    //	ignore_volume_control = "no"; // set this to "yes" if you want the volume to be at 100% no matter what the source's volume control is set to.
    //	volume_range_db = 60 ; // use this advanced setting to set the range, in dB, you want between the maximum volume and the minimum volume. Range is 30 to 150 dB. Leave it commented out to use mixer's native range.
    //	volume_max_db = 0.0 ; // use this advanced setting, which must have a decimal point in it, to set the maximum volume, in dB, you wish to use.
    //		The setting is for the hardware mixer, if chosen, or the software mixer otherwise. The value must be in the mixer's range (0.0 to -96.2 for the software mixer).
    //		Leave it commented out to use mixer's maximum volume.
    //	volume_control_profile = "standard" ; // use this advanced setting to specify how the airplay volume is transferred to the mixer volume.
    //		"standard" makes the volume change more quickly at lower volumes and slower at higher volumes.
    //		"flat" makes the volume change at the same rate at all volumes.
    //		"dasl_tapered" is similar to "standard" - it makes the volume change more quickly at lower volumes and slower at higher volumes.
    //			The intention behind dasl_tapered is that a given percentage change in volume should result in the same percentage change in
    //			perceived loudness. For instance, doubling the volume level should result in doubling the perceived loudness.
    //			With the range of AirPlay volume being from -30 to 0, doubling the volume from -22.5 to -15 results in an increase of 10 dB.
    //			Similarly, doubling the volume from -15 to 0 results in an increase of 10 dB.
    //			For compatibility with mixers having a restricted attenuation range (e.g. 30 dB), "dasl_tapered" will switch to a flat profile at low AirPlay volumes.
    
    //	volume_control_combined_hardware_priority = "no"; // when extending the volume range by combining the built-in software attenuator with the hardware mixer attenuator, set this to "yes" to reduce volume by using the hardware mixer first, then the built-in software attenuator.
    
    //	default_airplay_volume = -24.0; // this is the suggested volume after a reset or after the high_volume_threshold has been exceed and the high_volume_idle_timeout_in_minutes has passed
    
    //	The following settings are for dealing with potentially surprising high ("very loud") volume levels.
    //	When a new play session starts, it usually requests a suggested volume level from Shairport Sync. This is normally the volume level of the last session.
    //	This can cause unpleasant surprises if the last session was (a) very loud and (b) a long time ago.
    //	Thus, the user could be unpleasantly surprised by the volume level of the new session.
    
    //	To deal with this, when the last session volume is "very loud", the following two settings will lower the suggested volume after a period of idleness:
    
    //	high_threshold_airplay_volume = -16.0; // airplay volume greater or equal to this is "very loud"
    //	high_volume_idle_timeout_in_minutes = 0; // if the current volume is "very loud" and the device is not playing for more than this time, suggest the default volume for new connections instead of the current volume.
    //		Note 1: This timeout is set to 0 by default to disable this feature. Set it to some positive number, e.g. 180 to activate the feature.
    //		Note 2: Not all applications use the suggested volume: MacOS Music and Mac OS System Sounds use their own settings.
    
    //	run_this_when_volume_is_set = "/full/path/to/application/and/args"; //	Run the specified application whenever the volume control is set or changed.
    //		The desired AirPlay volume is appended to the end of the command line – leave a space if you want it treated as an extra argument.
    //		AirPlay volume goes from 0.0 to -30.0 and -144.0 means "mute".
    
    //	audio_backend_latency_offset_in_seconds = 0.0; // This is added to the latency requested by the player to delay or advance the output by a fixed amount.
    //		Use it, for example, to compensate for a fixed delay in the audio back end.
    //		E.g. if the output device, e.g. a soundbar, takes 100 ms to process audio, set this to -0.1 to deliver the audio
    //		to the output device 100 ms early, allowing it time to process the audio and output it perfectly in sync.
    //	audio_backend_buffer_desired_length_in_seconds = 0.2; // If set too small, buffer underflow occurs on low-powered machines.
    //		Too long and the response time to volume changes becomes annoying.
    //		Default is 0.2 seconds in the alsa backend, 0.35 seconds in the pa backend and 1.0 seconds otherwise.
    //	audio_backend_buffer_interpolation_threshold_in_seconds = 0.075; // Advanced feature. If the buffer size drops below this, stop using time-consuming interpolation like soxr to avoid dropouts due to underrun.
    //	audio_backend_silent_lead_in_time = "auto"; // This optional advanced setting, either "auto" or a positive number, sets the length of the period of silence that precedes the start of the audio.
    //		The default is "auto" -- the silent lead-in starts as soon as the player starts sending packets.
    //		Values greater than the latency are ignored. Values that are too low will affect initial synchronisation.
    
    //	dbus_service_bus = "system"; // The Shairport Sync dbus interface, if selected at compilation, will appear
    //		as "org.gnome.ShairportSync" on the whichever bus you specify here: "system" (default) or "session".
    //	mpris_service_bus = "system"; // The Shairport Sync mpris interface, if selected at compilation, will appear
    //		as "org.gnome.ShairportSync" on the whichever bus you specify here: "system" (default) or "session".
    //	resend_control_first_check_time = 0.10; // Use this optional advanced setting to set the wait time in seconds before deciding a packet is missing.
    //	resend_control_check_interval_time = 0.25; //  Use this optional advanced setting to set the time in seconds between requests for a missing packet.
    //	resend_control_last_check_time = 0.10; // Use this optional advanced setting to set the latest time, in seconds, by which the last check should be done before the estimated time of a missing packet's transfer to the output buffer.
    //	missing_port_dacp_scan_interval_seconds = 2.0; // Use this optional advanced setting to set the time interval between scans for a DACP port number if no port number has been provided by the player for remote control commands
    };`

   
    // gl-mt3000.localdomain (192.168.2.61) at 9e:83:c4:3d:ce:3d on en0 ifscope [ethernet]

    // let oo = Parse(test) as Object
    // console.log(oo)

    // console.log("ll", ll);
    // cast.onAvailable();
	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}

	const response = await resolve(event);
	return response;
};