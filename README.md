# Site Performance

A HarperDB component that dynamically pre-renders html pages from an origin based on the entries in that site's `sitemap.xml`. This uses the open source `prerender` and `sitemapper` packages.

## Getting Started

This component runs a headless (no UI) version of Chrome to render pages in the background.

- If you're on a Mac, install it using homebrew: `brew install chromium --no-quarantine`
- If not, you may [Download It Here](https://www.chromium.org/getting-involved/download-chromium/).

Next:

- Clone this repository into your HarperDB components directory (`~/hdb/components`)
- Update `CHROME_LOCATON` at the top of `resources.js` to match the result of `which Chromium`
- Restart the HarperDB http process

## Using The Component

This component exports 2 endpoints:

### GET /pagebank

Accepts a `url` parameter and either delivers the content for that page, or kicks off a pre-render process to capture the page content, store it in the database, and return it to the client. The primary key is the URL. Other columns include:

- `earlyHint`: used to power a 103 response allowing browsers to preload the hero image for the page in advance of the browser render process. @TODO The url of the hero image should be extracted from the rendered HTML.
- `redirectUrl` and `redirectType`: In the event that an SEO optiimization has resulted in a page being moved, some records may no hold rendered content, but instead the URL of the new destination for that content.

#### EXAMPLE URL:

- https://localhost:9926/pagebank?url=https://www.harperdb.io/solutions/digital-commerce

#### @TODO
- The url of the hero image should be extracted from the rendered HTML and set as the `earlyHint` value
- Add a background process to crawl pages based on the flag set in the Sitemap table
- Employ queue/worker logic to allow for multiple threads to work through the render backlog

### GET /sitemap

Accepts a `url` parameter for a site's `sitemap.xml` and inserts all the records into the Sitemap table. 

#### @TODO
- This table should be used as the input for the pagebank crawl process.
- Add the ability to crawl a specified sitemap on an interval
- Add the ability to handle recursive sitemaps
- Flag records in need of re-rendering based on the lasMod date in the sitemap

#### EXAMPLE URL:

- https://localhost:9926/sitemap?url=https://harperdb.io/sitemap.xml
