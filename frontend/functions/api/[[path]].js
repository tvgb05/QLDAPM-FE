const API_ORIGIN = 'http://222.255.214.35';

export async function onRequest(context) {
  const { request, params } = context;

  const incomingUrl = new URL(request.url);
  const rawPath = params.path;
  const pathSegments = Array.isArray(rawPath) ? rawPath : rawPath ? [rawPath] : [];
  const upstreamPath = pathSegments.join('/');
  const upstreamUrl = `${API_ORIGIN}/api/${upstreamPath}${incomingUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const init = {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'follow',
  };

  const upstreamResponse = await fetch(upstreamUrl, init);
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: upstreamResponse.headers,
  });
}
