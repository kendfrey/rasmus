"use strict";

const Discord = require("discord.js");

module.exports =
{
	name: "latest",
	help: prefix => `Posts the most recent item from a feed. Usage: \`${prefix}latest url\``,
	admin: false,
	invoke: async (args, message, bot) =>
	{
		if (!bot.rss.postLatest(args[0], message.channel.id))
		{
			await message.channel.send("There are no posts.");
		}
	}
};
