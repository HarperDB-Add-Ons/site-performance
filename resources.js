import Sitemapper from 'sitemapper';
import prerender from 'prerender';

const USER_AGENT = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/W.X.Y.Z Safari/537.36';
const CHROME_LOCATON = '/opt/homebrew/bin/Chromium';

const prerenderServer = prerender({
	logRequests: true,
	userAgent: USER_AGENT,
	chromeLocation: CHROME_LOCATON
});
prerenderServer.start();

export class pagebank extends Resource {
	async get(query) {
		const url = query?.get?.('url');

		const hasCached = await databases.siteperformance.Pagebank.get(url);
		if (hasCached) {
			return { status: 200, headers: { 'Content-Type': 'text/html' }, data: hasCached.content };
		}

		const response = await fetch('http://localhost:3000/render', {
			method: "POST",
			body: JSON.stringify({ renderType: 'html', url }),
		});
		const content = await response.text();

		await databases.siteperformance.Pagebank.put({
			url,
			content,
			updatedDate: Date.now()
		});

		return { status: 200, headers: { 'Content-Type': 'text/html' }, data: content };
	}
};

export class sitemap extends Resource {
	async get(query)	{
		const url = query?.get?.('url');

		const OriginSitemap = new Sitemapper({
			url,
			timeout: 15000, // 15 seconds
			fields: {
				loc: true,
				lastmod: true
			},
			concurrency: 5,
		});

		try {
			const result = await OriginSitemap.fetch();
			await databases.siteperformance.Sitemap.delete({});
			const pages = result.sites.filter((s) => s.loc).slice(0, 10);
			for (const page of pages) {
				await databases.siteperformance.Sitemap.put({
					url: page.loc, lastModified: page.lastmod, indexed: Date.now()
				});
			}
		} catch (error) {
			console.log(error);
		}
	}
};
