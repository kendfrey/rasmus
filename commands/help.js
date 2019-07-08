"use strict";

const Discord = require("discord.js");

module.exports =
{
	name: "help",
	help: prefix => `Shows help text. Usage: \`${prefix}help command\``,
	admin: false,
	invoke: (args, message, bot) =>
	{
		let commands;
		if (bot.commands.has(args[0]))
		{
			commands = [bot.commands.get(args[0])];
		}
		else
		{
			commands = [...bot.commands.values()];
		}
		message.channel.send(commands.map(c => `**${Discord.Util.escapeMarkdown(bot.config.prefix + c.name)}**: ${c.help(bot.config.prefix)}`).join("\n"));
	}
};
