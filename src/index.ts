const images = [
  "https://i.imgur.com/tuJY33L.png&format=json",
  "https://i.imgur.com/tuJY33L.png&format=webp",
  "https://i.imgur.com/tuJY33L.png&format=avif",
  "https://i.imgur.com/tuJY33L.png&format=jpeg",
  "https://i0.wp.com/thegameofnerds.com/wp-content/uploads/2018/11/maxresdefault-1-3167651902-1543090438171.jpg&format=avif",
];

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

  const tempUrl = "http://localhost:8787/wrangler2-repro-534/";

  let imageURL = searchParams.get("url");

  if (!imageURL) {
    url.searchParams.set("url", "https://i.imgur.com/tuJY33L.png");

    const html = /* html */ `
      <main style="max-width: 920px; margin: 4rem auto; font-size: 24px;">
        Image resize format tests
        <h3>Pass an image url via query string, like: </h3>

        <ul>
          ${images
            .map(
              (img: string) =>
                `<li><a href="${tempUrl + "?url=" + img}">?url=${img}</a></li>`
            )
            .join("")}
        </ul>

        <h3>Available formats</h3>
        <blockquote>
          ERROR 9401: <a href="${
            tempUrl + "?url=https://i.imgur.com/tuJY33L.png&format=jpg"
          }">Missing or invalid resizing parameters: 'jpg'</a> is not a supported output format. Use 'jpeg', 'webp', 'avif', or 'json'
        </blockquote>
      </main>
    `;
    return new Response(html, {
      headers: {
        "content-type": "text/html",
      },
    });
  }

  // OK, got an image URL...

  const qFormat = url.searchParams.get("format");
  let fCandidate: string | undefined = "";
  if (!qFormat || qFormat === "auto") fCandidate = undefined;
  else fCandidate = qFormat;

  const requestInit: RequestInit = {
    cf: {
      image: {
        format: fCandidate as RequestInitCfPropertiesImage["format"],
      },
    },
  };

  const response = await fetch(imageURL, requestInit);
  const contentType = response.headers.get("content-type") || "";

  // Image resizing is available! Return the JSON we expected
  if (
    fCandidate !== "json" ||
    (fCandidate === "json" && contentType.includes("application/json"))
  )
    return response;

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
