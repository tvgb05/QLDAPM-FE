const API_ORIGIN = 'http://222.255.214.35.nip.io';

export async function onRequest(context) {
  const { request, params } = context;

  const incomingUrl = new URL(request.url);
  const rawPath = params.path;
  const pathSegments = Array.isArray(rawPath) ? rawPath : rawPath ? [rawPath] : [];
  const upstreamPath = pathSegments.join('/');
  const upstreamUrl = `${API_ORIGIN}/api/${upstreamPath}${incomingUrl.search}`;

  const headers = new Headers();
  const headerAllowList = ['accept', 'accept-language', 'authorization', 'content-type'];
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

  const upstreamResponse = await fetch(upstreamUrl, init);
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: upstreamResponse.headers,
  });
}
