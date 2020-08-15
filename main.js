"use strict";

const Discord = require("discord.js");
const Rss = require("./rss");

process.on('unhandledRejection', err => { throw err; });

const bot = {};
bot.config = require("./config.json");

bot.commands = new Map();
addCommand("add");
addCommand("help");
addCommand("latest");
addCommand("list");
addCommand("remove");

function addCommand(name)
{
	const command = require(`./commands/${name}`);
	bot.commands.set(command.name, command);
}

bot.rss = new Rss(bot.config.pollInterval);
bot.rss.load("feeds.json");

bot.discord = new Discord.Client();
bot.discord.on("error", err => console.error(`Error: ${err.error}`));
bot.discord.once("ready", () => bot.rss.on("item", onItem));
bot.discord.on("message", onMessage);
bot.discord.login(bot.config.token);

async function onItem(item)
{
	try
	{
		const channel = await bot.discord.channels.fetch(item.channel);
		if (channel)
		{
			let content = item.content;
			if (!content.toLowerCase().startsWith("http")) // Discord replaces \ with / in links, so escaping them is bad.
			{
				content = Discord.Util.escapeMarkdown(content);
			}
			await channel.send(`**${Discord.Util.escapeMarkdown(item.title)}**\n${content}`);
		}
	}
	catch (err)
	{
		console.error(`Error sending message for ${item.content} to ${item.channel}: ${err}`);
	}
}

async function onMessage(message)
{
	if (message.content.startsWith(bot.config.prefix))
	{
		try
		{
			const [commandName, ...args] = message.content.substr(bot.config.prefix.length).split(" ");
			const command = bot.commands.get(commandName);
			if (command)
			{
				if (command.admin && !bot.config.admins.includes(message.author.id))
				{
					await message.channel.send("You do not have permission to use this command.");
					return;
				}

				await command.invoke(args, message, bot);
			}
		}
		catch (err)
		{
			console.error(`Error processing command from ${message.channel}: ${err}`);
		}
	}
}
