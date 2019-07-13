# rasmus

Rasmus is a Discord bot for posting RSS feeds.

## Usage

- **~add** - Adds a feed to this channel. Usage: `~add url`
- **~help** - Shows help text. Usage: `~help command`
- **~list** - Lists all active feeds for this channel. Usage: `~list`
- **~remove** - Removes a feed from this channel. Usage: `~remove url`

<sup>*Note: The default command prefix is `~`, but this can be changed by the bot's owner.*</sup>

## Running the bot

1. Install dependencies with `npm install`.
2. Create a file `config.json` with the bot's configuration. See `config.json.example` for an example.
	1. Set `token` to your bot's token (from the Discord developer portal).
	2. Set `admins` to contain your personal Discord user id. Otherwise you won't be allowed to add feeds using the Discord commands.
	3. Set `pollInterval` to the number of minutes between updates.
	4. Set `prefix` to the prefix you want to use for Discord commands.
3. Run the bot with `node main` or `run.bat`.
