export async function handleRequest(request: Request, env: Bindings) {
  // Match route against pattern /:name/*action
  const url = new URL(request.url);

  return new Response(`OK ${url.search}`, {
    headers: {
      "content-type": "text/html",
    },
  });
}

const worker: ExportedHandler<Bindings> = { fetch: handleRequest };

export default worker;
