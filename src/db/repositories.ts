import { BaseGuildTextChannel, Guild, User } from 'discord.js';
import { Repository } from 'typeorm';
import { DB } from '.';
import {
	UserEntity,
	GuildEntity,
	PlayingMessageEntity,
	DJRoleEntity,
	FavoriteSongEntity,
	GuildConfigEntity,
} from './entities';

class userRepo extends Repository<UserEntity> {
	constructor() {
		super(UserEntity, DB.manager);
	}

	public async findOrCreate(user: User) {
		const memberDB = await this.findOneBy({ id: user.id });

		if (!memberDB) {
			const newMemberDB = new UserEntity();
			newMemberDB.username = user.tag;
			newMemberDB.id = user.id;
			newMemberDB.createdAt = new Date();
			newMemberDB.updatedAt = new Date();
			return await this.save(newMemberDB);
		}
		return memberDB;
	}
}

class guildRepo extends Repository<GuildEntity> {
	constructor() {
		super(GuildEntity, DB.manager);
	}

	public async findOrCreate(guild: Guild) {
		let guildDB = await this.findOneBy({ id: guild.id });

		if (!guildDB) {
			guildDB = new GuildEntity();
			guildDB.id = guild.id;
			guildDB.name = guild.name;
			guildDB.ownerId = guild.ownerId;
			guildDB.language = guild.preferredLocale == 'pt-BR' ? 'pt-BR' : 'en-US';

			const guildConfig = new GuildConfigEntity();
			guildConfig.guildId = guild.id;
			guildDB.config = guildConfig;
			guildConfig.guild = guildDB;

			await guildConfig.save();
			await this.save(guildDB);
		}
		return guildDB;
	}

	public async findOrCreatePlayingMessage(guild: Guild, messageId: string, channelId: string) {
		const guildDB = await this.findOneBy({ id: guild.id });

		let playingMessage = guildDB.playingMessage;
		if (!playingMessage) {
			playingMessage = new PlayingMessageEntity();
			playingMessage.guild = guildDB;
			playingMessage.messageId = messageId;
			playingMessage.channelId = channelId;
			await playingMessage.save();
			guildDB.playingMessage = playingMessage;
			await guildDB.save();
		}
		return playingMessage;
	}

	public async deletePlayingMessage(guild: Guild) {
		const guildDB = await this.findOneBy({ id: guild.id });

		const playingMessage = guildDB.playingMessage;
		if (!playingMessage) return;

		try {
			const channel = await guild.channels.fetch(playingMessage.channelId);
			if (!channel || !(channel instanceof BaseGuildTextChannel)) return;

			const message = await channel.messages.fetch(playingMessage.messageId);
			if (message) await message.delete();
		} catch (err) {}
		guildDB.playingMessage = null;
		await guildDB.save();
		await playingMessage.remove();

		return guildDB;
	}
}

export const UserRepo = new userRepo();
export const GuildRepo = new guildRepo();
export const GuildConfigRepo = DB.getRepository(GuildConfigEntity);
export const DJRoleRepo = DB.getRepository(DJRoleEntity);
export const FavoriteSongRepo = DB.getRepository(FavoriteSongEntity);
export const PlayingMessageRepo = DB.getRepository(PlayingMessageEntity);
