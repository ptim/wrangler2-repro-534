/**
 * Debug route expects a valid image URL passed as a query string `?url=<imageUrl>`
 *
 * - if the sub-request was processed by cloudflare, JSON describing the image will be returned (not an image!)
 * - otherwise, return JSON with debug info
 *
 * http://127.0.0.1:8787/?url=https://i.imgur.com/tuJY33L.png
 */
export async function handleRequest(request: Request, env: Bindings) {
  const url = new URL(request.url);
  const { searchParams } = url;

  let imageURL = searchParams.get("url");

  if (!imageURL) {
    url.searchParams.set("url", "https://i.imgur.com/tuJY33L.png");

    const html = /* html */ `
      <p style="margin: 10rem auto; font-size: 24px; text-align: center;">
        Pass an image url via query string, like: <br>
        <a href="${url.toString()}">?url=https://i.imgur.com/tuJY33L.png</a>
      </p>
    `;
    return new Response(html, {
      headers: {
        "content-type": "text/html",
      },
    });
  }

  // OK, got an image URL...

  const requestInit: RequestInit = {
    cf: {
      image: {
        format: "json",
      },
    },
  };
  const response = await fetch(imageURL, requestInit);
  const contentType = response.headers.get("content-type") || "";

  // Image resizing is available! Return the JSON we expected
  if (contentType.includes("application/json")) return response;

  // Image resizing was not run!
  const errorJson = {
    error:
      "Aborted! The image request received an actual image rather than JSON",
    request: {
      url: response.url,
      cf: requestInit.cf,
    },
    response: {
      headers: Object.fromEntries(response.headers),
    },
  };

  return new Response(JSON.stringify(errorJson, null, 2), {
    headers: {
      "content-type": "application/json",
    },
  });
}

const worker: ExportedHandler<Bindings> = { fetch: handleRequest };

export default worker;
