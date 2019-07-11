"use strict";

const Discord = require("discord.js");

module.exports =
{
	name: "remove",
	help: prefix => `Removes a feed from this channel. Usage: \`${prefix}remove url\``,
	admin: true,
	invoke: async (args, message, bot) =>
	{
		if (args.length < 1)
		{
			await bot.commands.get("help").invoke(["remove"], message, bot);
			return;
		}

		const result = await bot.rss.remove(args[0], message.channel.id);
		if (!result)
		{
			await message.channel.send("That feed does not exist.");
		}
		else if (result instanceof Error)
		{
			await message.channel.send("There was an error removing the feed.");
		}
		else
		{
			await message.channel.send(`Feed removed: **${Discord.Util.escapeMarkdown(result.title)}**`);
		}
	}
};
