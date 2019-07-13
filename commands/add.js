"use strict";

const Discord = require("discord.js");

module.exports =
{
	name: "add",
	help: prefix => `Adds a feed to this channel. Usage: \`${prefix}add url\``,
	admin: true,
	invoke: async (args, message, bot) =>
	{
		if (args.length < 1)
		{
			await bot.commands.get("help").invoke(["add"], message, bot);
			return;
		}

		const result = await bot.rss.add(args[0], message.channel.id);
		if (!result)
		{
			await message.channel.send("That feed already exists.");
		}
		else
		{
			await message.channel.send(`Feed added: **${Discord.Util.escapeMarkdown(result.title)}**`);
		}
	}
};
