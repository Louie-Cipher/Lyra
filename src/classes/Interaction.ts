import { APIInteraction, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import LyraClient from 'classes/Client';

export class FixedInteraction extends ChatInputCommandInteraction {
	constructor(client: LyraClient, data: APIInteraction) {
		super(client, data);
	}

	member: GuildMember = this.guild?.members.cache.get(this.user.id);
}
