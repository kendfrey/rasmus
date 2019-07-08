"use strict";

const Discord = require("discord.js");
const Rss = require("./rss");

const bot = {};
bot.config = require("./config.json");

bot.commands = new Map();
addCommand(require("./commands/add"));
addCommand(require("./commands/help"));
addCommand(require("./commands/list"));
addCommand(require("./commands/remove"));

function addCommand(command)
{
	bot.commands.set(command.name, command);
}

bot.rss = new Rss(bot.config.pollInterval);
bot.rss.load("feeds.json");

bot.discord = new Discord.Client();
bot.discord.once("ready", () => bot.rss.on("item", onItem));
bot.discord.on("message", onMessage);
bot.discord.login(bot.config.token);

function onItem(item)
{
	const channel = bot.discord.channels.get(item.channel);
	if (channel)
	{
		channel.send(`**${Discord.Util.escapeMarkdown(item.title)}**\n${Discord.Util.escapeMarkdown(item.content)}`);
	}
}

function onMessage(message)
{
	if (message.content.startsWith(bot.config.prefix))
	{
		const [commandName, ...args] = message.content.substr(bot.config.prefix.length).split(" ");
		const command = bot.commands.get(commandName);
		if (command)
		{
			if (command.admin && !bot.config.admins.includes(message.author.id))
			{
				message.channel.send("You do not have permission to use this command.");
				return;
			}

			command.invoke(args, message, bot);
		}
	}
}
