import {
	ApplicationCommandDataResolvable,
	ClientEvents,
	Collection,
	Guild,
} from 'discord.js';
import { readdirSync } from 'fs';
import { consoleError, consoleLog } from './log';
import { CommandType } from 'types/Command';
import Event from 'classes/Event';
import LyraClient from 'classes/Client';
import { ButtonEventType } from 'types/ButtonEvent';

const commandsToAPI: ApplicationCommandDataResolvable[] = [];

const importFile = async (filePath: string) => (await import(filePath))?.default;

export async function loadCommands() {
	const commands = new Collection<string, CommandType>();
	const commandsPath = readdirSync(`${__dirname}/../commands/`);

	for (const category of commandsPath) {
		const categoryPath = readdirSync(`${__dirname}/../commands/${category}`).filter(
			(file) => file.endsWith('.ts') || file.endsWith('.js')
		);

		if (categoryPath.length === 0) continue;

		for (const file of categoryPath) {
			const command: CommandType = await importFile(
				`${__dirname}/../commands/${category}/${file}`
			);
			if (!command || !command.data) continue;

			commands.set(command.data.name, command);
			commandsToAPI.push(command.data.toJSON());
		}
	}
	consoleLog('LOADER', `${commands.size} commands loaded`);
	return commands;
}

export function registerCommands(client: LyraClient) {
	client.guilds.cache.forEach(registerCommandsInGuild);

	consoleLog('LOADER', `Commands registered in ${client.guilds.cache.size} guilds`);
}

export function registerCommandsInGuild(guild: Guild) {
	guild.commands
		.set(commandsToAPI)
		.catch((err) => consoleError('LOADER:REGISTER', err));
}

export async function loadEvents(client: LyraClient) {
	const files = readdirSync(`${__dirname}/../events`).filter(
		(file) => file.endsWith('.js') || file.endsWith('.ts')
	);

	for (const file of files) {
		const event: Event<keyof ClientEvents> = await importFile(
			`${__dirname}/../events/${file}`
		);
		client.on(event.name, event.run);
	}

	consoleLog('LOADER', `${files.length} Events loaded`);
	import('../events/distube').then(() => consoleLog('LOADER', 'Distube events loaded'));
}

export async function loadButtons() {
	const buttons = new Collection<string, ButtonEventType>();
	const buttonsPath = readdirSync(`${__dirname}/../events/buttons/`);

	for (const buttonPath of buttonsPath) {
		const button: ButtonEventType = await importFile(
			`${__dirname}/../events/buttons/${buttonPath}`
		);
		if (!button) continue;

		buttons.set(button.name, button);
	}

	consoleLog('LOADER', `${buttons.size} buttons loaded`);
	return buttons;
}
