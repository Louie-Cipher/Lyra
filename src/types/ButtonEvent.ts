import { ButtonInteraction } from 'discord.js';
import { Queue } from 'distube';
import { GuildEntity } from 'db/entities';
import LyraClient from 'classes/Client';

interface ExecuteOptions {
	client: LyraClient;
	interaction: ButtonInteraction;
	guildDB: GuildEntity;
	queue: Queue;
}

type ExecuteFunction = (options: ExecuteOptions) => any;

export type ButtonEventType = {
	name: string;
	execute: ExecuteFunction;
	topggUpvote?: boolean | undefined;
};
