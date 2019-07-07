"use strict";

const Discord = require("discord.js");
const Rss = require("./rss");
const config = require("./config.json");

const rss = new Rss(config.pollInterval);
rss.load("feeds.json");

const discord = new Discord.Client();
discord.once("ready", () => rss.on("item", onItem));
discord.login(config.token);

function onItem(item)
{
	const channel = discord.channels.get(item.channel);
	if (channel)
	{
		channel.send(`**${Discord.Util.escapeMarkdown(item.title)}**\n${Discord.Util.escapeMarkdown(item.content)}`);
	}
}
