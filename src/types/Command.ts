import {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';
import { GuildEntity, UserEntity } from 'db/entities';
import LyraClient from 'classes/Client';

interface ExecuteOptions {
	client: LyraClient;
	interaction: ChatInputCommandInteraction;
	userDB: UserEntity;
	guildDB: GuildEntity;
}

type ExecuteFunction = (options: ExecuteOptions) => any;

export type CommandType = {
	data:
		| SlashCommandBuilder
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| SlashCommandSubcommandsOnlyBuilder;
	permissions?: PermissionResolvable[];
	execute: ExecuteFunction;
};
