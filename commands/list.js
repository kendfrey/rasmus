"use strict";

const Discord = require("discord.js");

module.exports =
{
	name: "list",
	help: prefix => `Lists all active feeds for this channel. Usage: \`${prefix}list\``,
	admin: false,
	invoke: async (args, message, bot) =>
	{
		let messageText = bot.rss.list(message.channel.id).map(f => `**${Discord.Util.escapeMarkdown(f.title)}**\n<${f.url}>\n${Discord.Util.escapeMarkdown(f.description)}`).join("\n\n");
		if (messageText === "")
		{
			messageText = "There are no feeds in this channel.";
		}
		await message.channel.send(messageText);
	}
};
