"use strict";

const fs = require("fs").promises;
const EventEmitter = require("events");
const RssParser = require("rss-parser");
const parser = new RssParser();

module.exports = class Rss extends EventEmitter
{
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
			this.feedsFile = file;
		}
		catch (err)
		{
			// Make sure the file doesn't get overwritten if it already exists and is broken.
			if (err.code === "ENOENT")
			{
				this.feedsFile = file;
			}
			else
			{
				throw err;
			}
		}
	}

	async add(url, channel)
	{
		const key = `${url};${channel}`;
		if (this.feeds.has(key))
		{
			return null;
		}
		console.log(`Adding ${url} to ${channel}`);

		try
		{
			const feedData = await parser.parseURL(url);
			const feed = { url, channel, title: feedData.title || "No title", description: feedData.description || "No description", seen: new Set(feedData.items.map(id)) };
			this.feeds.set(key, feed);
			await this.save();
			return feed;
		}
		catch (err)
		{
			console.error(`Error adding ${url} to ${channel}: ${err}`);
			return err;
		}
	}

	async remove(url, channel)
	{
		const key = `${url};${channel}`;
		if (!this.feeds.has(key))
		{
			return null;
		}
		console.log(`Removing ${url} from ${channel}`);

		try
		{
			const feed = this.feeds.get(key);
			this.feeds.delete(key);
			await this.save();
			return feed;
		}
		catch (err)
		{
			console.error(`Error removing ${url} from ${channel}: ${err}`);
			return err;
		}
	}

	list(channel)
	{
		return [...this.feeds.values()].filter(f => f.channel === channel);
	}

	async poll()
	{
		const startPoll = Date.now();
		console.log(`\nUpdating feeds ${new Date(startPoll).toISOString()}`);
		for (const feed of this.feeds.values())
		{
			try
			{
				const startFeed = Date.now();
				console.log(`Fetching ${feed.url} for ${feed.channel}`);
				const feedData = await parser.parseURL(feed.url);
				for (const itemData of feedData.items.filter(item => !feed.seen.has(id(item))))
				{
					const item = { url: feed.url, channel: feed.channel, title: itemData.title || "No title", content: itemData.link || itemData.description || "No content" };
					console.log(`New item: ${id(itemData)}`);
					feed.seen.add(id(itemData));
					this.emit("item", item);
				}
				console.log(`${(Date.now() - startFeed) / 1000}s`);
			}
			catch (err)
			{
				console.error(`Error fetching ${feed.url} for ${feed.channel}: ${err}`);
			}
		}
		console.log(`Done ${(Date.now() - startPoll) / 1000}s`);
		setTimeout(() => this.poll(), this.pollInterval);
	}

	async save()
	{
		if (this.feedsFile)
		{
			await fs.writeFile(this.feedsFile, JSON.stringify([...this.feeds.values()].map(f => ({ url: f.url, channel: f.channel })), null, 2));
		}
	}
}

function id(item)
{
	return item.guid || item.pubDate || item.link || item.title || item.description;
}
