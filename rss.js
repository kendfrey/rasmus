"use strict";

const fs = require("fs").promises;
const EventEmitter = require("events");
const RssParser = require("rss-parser");
const parser = new RssParser();

module.exports = class Rss extends EventEmitter
{
	feedSubscriptions = new Map();
	feeds = new Map();

	constructor(pollInterval)
	{
		super();
		this.pollInterval = pollInterval * 60 * 1000;
		setTimeout(() => this.poll(), this.pollInterval);
	}

	async load(file)
	{
		try
		{
			const feeds = JSON.parse(await fs.readFile(file));
			for (const feed of feeds)
			{
				await this.add(feed.url, feed.channel);
			}
		}
		catch (err)
		{
			// Make sure the file doesn't get overwritten if it already exists and is broken.
			if (err.code !== "ENOENT")
			{
				throw err;
			}
		}
		this.feedsFile = file;
	}

	async add(url, channel)
	{
		const key = `${url};${channel}`;
		if (this.feedSubscriptions.has(key))
		{
			return null;
		}
		console.log(`Adding ${url} to ${channel}`);

		this.feedSubscriptions.set(key, { url, channel });
		await this.save();

		if (!this.feeds.has(url) && !await this.initializeFeed(url))
		{
			const unknown = { url, title: "Unknown", description: "Unknown", initialized: false };
			this.feeds.set(url, unknown);
		}

		return this.feeds.get(url);
	}

	async initializeFeed(url)
	{
		try
		{
			console.log(`Initializing ${url}`);
			const feedData = await parser.parseURL(url);
			const feed = { url, title: feedData.title || "No title", description: feedData.description || "No description", seen: new Set(feedData.items.map(id)), initialized: true };
			this.feeds.set(url, feed);
			return true;
		}
		catch (err)
		{
			console.error(`Error initializing ${url}: ${err}`);
			return false;
		}
	}

	async remove(url, channel)
	{
		const key = `${url};${channel}`;
		if (!this.feedSubscriptions.has(key))
		{
			return null;
		}
		console.log(`Removing ${url} from ${channel}`);

		this.feedSubscriptions.delete(key);
		await this.save();

		const feed = this.feeds.get(url);
		if (![...this.feedSubscriptions.values()].some(f => f.url === url))
		{
			this.feeds.delete(url);
		}

		return feed;
	}

	list(channel)
	{
		return [...this.feedSubscriptions.values()].filter(f => f.channel === channel).map(f => this.feeds.get(f.url));
	}

	async poll()
	{
		const startPoll = Date.now();
		console.log(`\nUpdating feeds ${new Date(startPoll).toISOString()}`);
		for (const feed of this.feeds.values())
		{
			try
			{
				if (!feed.initialized)
				{
					await this.initializeFeed(feed.url);
					continue;
				}

				const startFeed = Date.now();
				console.log(`Fetching ${feed.url}`);
				const feedData = await parser.parseURL(feed.url);
				for (const itemData of feedData.items.filter(item => !feed.seen.has(id(item))))
				{
					const item = { title: itemData.title || "No title", content: itemData.link || itemData.description || "No content" };
					console.log(`New item: ${id(itemData)}`);
					feed.seen.add(id(itemData));

					for (const subscription of [...this.feedSubscriptions.values()].filter(f => f.url === feed.url))
					{
						this.emit("item", { channel: subscription.channel, ...item });
					}
				}
				console.log(`${(Date.now() - startFeed) / 1000}s`);
			}
			catch (err)
			{
				console.error(`Error fetching ${feed.url}: ${err}`);
			}
		}
		console.log(`Done ${(Date.now() - startPoll) / 1000}s`);
		setTimeout(() => this.poll(), this.pollInterval);
	}

	async save()
	{
		if (this.feedsFile)
		{
			await fs.writeFile(this.feedsFile, JSON.stringify([...this.feedSubscriptions.values()], null, "\t"));
		}
	}
}

function id(item)
{
	return item.guid || item.pubDate || item.link || item.title || item.description;
}
