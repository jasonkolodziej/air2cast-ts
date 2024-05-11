/* *
 * Article: https://jeffmcmorris.medium.com/awesome-logging-in-sveltekit-6afa29c5892c
 * Code: https://github.com/delay/sveltekit-auth-starter/blob/main
 /? app.d.ts
 *  ## Set with
 *  ```typescript
        declare global {
            namespace App {
                interface Locals {
                    startTimer: number;
                    error: string;
                    errorId: string;
                    errorStackTrace: string;
                    message: unknown;
                    track: unknown;
                }
                interface Error {
                    code?: string;
                    errorId?: string;
                }
            }
        }
    
    // in hooks.server.ts
    export const handleError: HandleServerError = async ({ error, event }) => {
        const errorId = crypto.randomUUID();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        event.locals.error = error?.toString() || undefined;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        event.locals.errorStackTrace = error?.stack || undefined;
        event.locals.errorId = errorId;
        log(500, event);
        return {
            message: 'An unexpected error occurred.',
            errorId
        };
    };


    export const handle: Handle = async ({ event, resolve }) => {
        const startTimer = Date.now();
        event.locals.startTimer = startTimer;
        const response = await resolve(event);
        log(response.status, event);
        return response;
    };
    ```
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export default async function scratchLog(statusCode: number, event) {
    try {
    //  const client = new Client({
    //   token: AXIOM_TOKEN,
    //   orgId: AXIOM_ORG_ID
    //  });
     let level = 'info';
     if (statusCode >= 400) {
      level = 'error';
     }
     const error = event?.locals?.error || undefined;
     const errorId = event?.locals?.errorId || undefined;
     const errorStackTrace = event?.locals?.errorStackTrace || undefined;
     let urlParams = {};
     if (event?.url?.search) {
      urlParams = await getAllUrlParams(event?.url?.search);
     }
     let messageEvents = {};
     if (event?.locals?.message) {
      messageEvents = await parseMessage(event?.locals?.message);
     }
     let trackEvents = {};
     if (event?.locals?.track) {
      trackEvents = await parseTrack(event?.locals?.track);
     }
   
     let referer = event.request.headers.get('referer');
     if (referer) {
      const refererUrl = await new URL(referer);
      const refererHostname = refererUrl.hostname;
      // e.g. export const DOMAIN = 'sveltekit-auth.uv-ray.com';
      if (refererHostname === 'localhost') { //* refererHostname === DOMAIN
       referer = refererUrl.pathname;
      }
     } else {
      referer = undefined;
     }
     const logData: object = {
      level: level,
      method: event.request.method,
      path: event.url.pathname,
      status: statusCode,
      timeInMs: Date.now() - event?.locals?.startTimer,
      user: event?.locals?.user?.email,
      userId: event?.locals?.user?.userId,
      referer: referer,
      error: error,
      errorId: errorId,
      errorStackTrace: errorStackTrace,
      ...urlParams,
      ...messageEvents,
      ...trackEvents
     };
     console.log('log: ', JSON.stringify(logData));
     // TODO: fix
     // await client.ingestEvents(AXIOM_DATASET, [logData]);
    } catch (err) {
     throw new Error(`Error Logger: ${JSON.stringify(err)}`);
    }
}

export const getAllUrlParams = async (url: string): Promise<object> => {
    let paramsObj = {};
    try {
     url = url?.slice(1); //remove leading ?
     if (!url) return {}; //if no params return
     paramsObj = await Object.fromEntries(await new URLSearchParams(url));
    } catch (error) {
     console.log('error: ', error);
    }
    return paramsObj;
}

export const parseMessage = async (message: unknown): Promise<object> => {
    let messageObj = {};
    try {
     if (message) {
      if (typeof message === 'string') {
       messageObj = { message: message };
      } else {
       messageObj = message;
      }
     }
    } catch (error) {
     console.log('error: ', error);
    }
    return messageObj;
}

export const parseTrack = async (track: unknown): Promise<object> => {
    let trackObj = {};
    try {
     if (track) {
      if (typeof track === 'string') {
       trackObj = { track: track };
      } else {
       trackObj = track;
      }
     }
    } catch (error) {
     console.log('error: ', error);
    }
    return trackObj;
}