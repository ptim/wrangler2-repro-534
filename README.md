# wrangler2-repro-534

[🐛 BUG: Image resizing is not supported by `wrangler2 dev` · Issue #534 · cloudflare/wrangler2](https://github.com/cloudflare/wrangler2/issues/534)

## Setup

Update the route in wrangler.toml to point to an image-resizing enabled zone.

(not a subdomain - don't know how to get `wrangler dev` working there)

```shell
$ npm install

# unsure whether `publish` is required first - probably!
$ npx @cloudflare/wrangler publish
```

## Steps to reproduce

### Test `wrangler1` (known good)

```shell
$ npx @cloudflare/wrangler dev
$ open http://127.0.0.1:8787/wrangler2-repro-534
# and click the link or add ?url=ex.com/yourimage.jpg
```

Expect to see a short JSON response like:

```json
{
  "width": 748,
  "height": 404,
  "original": {
    "file_size": 263301,
    "width": 748,
    "height": 404,
    "format": "image/png"
  }
}
```

### Test `wrangler2`

```shell
$ npx wrangler@beta dev
$ open http://127.0.0.1:8787/wrangler2-repro-534
```

I see errorJson, because the script received `content-type=image/*` instead of JSON.

---

This is an example [Cloudflare Workers](https://workers.cloudflare.com/) project that uses [Miniflare](https://github.com/cloudflare/miniflare) for local development, [TypeScript](https://www.typescriptlang.org/), [esbuild](https://github.com/evanw/esbuild) for bundling, and [Jest](https://jestjs.io/) for testing, with [Miniflare's custom Jest environment](https://v2.miniflare.dev/jest.html).
