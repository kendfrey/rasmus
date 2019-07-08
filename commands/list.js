"use strict";

const Discord = require("discord.js");

module.exports =
{
	name: "list",
	help: prefix => `Lists all active feeds for this channel. Usage: \`${prefix}list\``,
	admin: false,
	invoke: (args, message, bot) =>
	{
		message.channel.send(bot.rss.list(message.channel.id).map(f => `**${Discord.Util.escapeMarkdown(f.title)}**\n<${f.url}>\n${Discord.Util.escapeMarkdown(f.description)}`).join("\n\n"));
	}
};
