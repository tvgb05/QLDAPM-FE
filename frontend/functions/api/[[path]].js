const API_ORIGIN = 'http://222.255.214.35.nip.io';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Reconstruct the upstream URL
  const upstreamUrl = `${API_ORIGIN}${url.pathname}${url.search}`;

  // Clone headers from original request
  const headers = new Headers(request.headers);

  // Remove Cloudflare-specific headers that might confuse the backend
  headers.delete('cf-connecting-ip');
  headers.delete('cf-ray');
  headers.delete('cf-visitor');
  headers.delete('cf-ipcountry');
  headers.delete('x-real-ip');

  // Ensure we have Content-Type for POST/PUT requests
  if (request.method !== 'GET' && request.method !== 'HEAD' && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const isBodyAllowed = request.method !== 'GET' && request.method !== 'HEAD';
  let body;
  if (isBodyAllowed) {
    body = await request.arrayBuffer();
  }

  const init = {
    method: request.method,
    headers,
    body,
    redirect: 'follow',
  };

  try {
    const upstreamResponse = await fetch(upstreamUrl, init);

    // Copy headers and remove hop-by-hop ones
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

    // Add debug headers
    responseHeaders.set('X-Proxy-Upstream-Url', upstreamUrl);
    responseHeaders.set('X-Proxy-Status', 'Success');

    return new Response(upstreamResponse.body, {
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
        upstream: upstreamUrl
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
