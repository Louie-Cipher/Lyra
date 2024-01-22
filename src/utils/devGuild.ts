import { BaseGuildTextChannel, BaseGuildVoiceChannel, Guild } from 'discord.js';
import client from 'client';

let devGuild: Guild;
let guildJoinChannel: BaseGuildTextChannel;
let guildLeaveChannel: BaseGuildTextChannel;
let countChannel: BaseGuildVoiceChannel;

export const getDevGuild = async () => {
	if (!devGuild) await fetchDevGuild();
	return devGuild;
};

export const getGuildJoinChannel = async () => {
	if (!guildJoinChannel) await fetchGuildJoinChannel();
	return guildJoinChannel;
};

export const getGuildLeaveChannel = async () => {
	if (!guildLeaveChannel) await fetchGuildLeaveChannel();
	return guildLeaveChannel;
};

export const getCountChannel = async () => {
	if (!countChannel) await fetchCountChannel();
	return countChannel;
};

export const fetchDevGuild = async () => {
	devGuild = (await client.guilds.fetch(process.env.devGuildId)) as Guild;
	// devGuild = (await client.shard
	// 	.broadcastEval((cl) => cl.guilds.cache.get(process.env.devGuildId))
	// 	.then((res) => res[0])) as Guild;
};

export const fetchGuildJoinChannel = async () => {
	if (!devGuild) await fetchDevGuild();
	guildJoinChannel = (await devGuild.channels.fetch(
		process.env.GUILD_CREATE_CHANNEL
	)) as BaseGuildTextChannel;
};

export const fetchGuildLeaveChannel = async () => {
	if (!devGuild) await fetchDevGuild();
	guildLeaveChannel = (await devGuild.channels.fetch(
		process.env.GUILD_DELETE_CHANNEL
	)) as BaseGuildTextChannel;
};

export const fetchCountChannel = async () => {
	if (!devGuild) await fetchDevGuild();
	countChannel = (await devGuild.channels.fetch(
		process.env.GUILD_COUNT_CHANNEL
	)) as BaseGuildVoiceChannel;
};
