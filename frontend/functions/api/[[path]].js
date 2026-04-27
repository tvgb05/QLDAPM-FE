const API_ORIGIN = 'http://222.255.214.35';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Reconstruct the upstream URL
  // If request is /api/student-registrations/my-registration
  // It should go to http://222.255.214.35/api/student-registrations/my-registration
  const upstreamUrl = `${API_ORIGIN}${url.pathname}${url.search}`;

  const headers = new Headers();
  const headerAllowList = [
    'accept',
    'accept-language',
    'authorization',
    'content-type',
    'x-requested-with',
    'user-agent',
    'referrer',
    'userId'
  ];
  for (const name of headerAllowList) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  const isBodyAllowed = request.method !== 'GET' && request.method !== 'HEAD';
  const body = isBodyAllowed ? await request.arrayBuffer() : undefined;

  const init = {
    method: request.method,
    headers,
    body,
    redirect: 'follow',
  };

  try {
    const upstreamResponse = await fetch(upstreamUrl, init);
    const responseHeaders = new Headers(upstreamResponse.headers);
    const hopByHopHeaders = [
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailer',
      'transfer-encoding',
      'upgrade',
    ];
    for (const headerName of hopByHopHeaders) {
      responseHeaders.delete(headerName);
    }

    const responseBody = await upstreamResponse.arrayBuffer();
    responseHeaders.set('X-Proxy-Upstream-Url', upstreamUrl);
    responseHeaders.set('X-Proxy-Status', 'Success');

    return new Response(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'API gateway request failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 502,
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
