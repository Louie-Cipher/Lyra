import {
	ChatInputCommandInteraction,
	Client,
	SlashCommandSubcommandBuilder,
} from 'discord.js';
import { GuildEntity } from 'db/entities';

interface executeOptions {
	client: Client;
	interaction: ChatInputCommandInteraction;
	guildDB: GuildEntity;
}

type executeFunction = (options: executeOptions) => any;

export type SubCommandType = {
	data: SlashCommandSubcommandBuilder;
	execute: executeFunction;
};
