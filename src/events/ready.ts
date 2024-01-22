import { ActivityOptions, ActivityType, BaseGuildTextChannel } from 'discord.js';
import client from 'client';
import { consoleError, consoleLog } from 'utils/log';
import { registerCommands } from 'utils/loader';
import moment from 'moment';
import Event from 'classes/Event';
import { GuildRepo, PlayingMessageRepo } from 'db/repositories';

export default new Event('ready', async () => {
	try {
		consoleLog('READY', `"${client.user.tag}" online`);

		// const devGuild = client.guilds.cache.get(process.env.devGuild);

		// deleteAllPlayingMessages();
		registerCommands(client);

		updateActivity(10_000);
	} catch (err) {
		consoleError('EVENT:READY', err);
	}
});

function readySince() {
	moment.updateLocale('pt-br', {});
	return moment(client.readyAt).fromNow();
}

const guildCount = async () => client.guilds.cache.size;
// await client.shard
// 	.broadcastEval((cl) => cl.guilds.cache.size)
// 	.then((res) => res.reduce((prev, val) => prev + val, 0));

const playingCount = async () => client.voice.adapters.size;
// await client.shard
// 	.broadcastEval((cl) => cl.voice.adapters.size)
// 	.then((res) => res.reduce((prev, val) => prev + val, 0));

function updateActivity(updateInterval: number) {
	let i = 0;

	const activities: ActivityOptions[] = [
		{ name: 'Estou Online {readySince}', type: ActivityType.Playing },
		{ name: 'Estou em {guildCount} servidores', type: ActivityType.Playing },
		{ name: 'música em {playingCount} servidores', type: ActivityType.Listening },
		{ name: 'Ping: {ping}ms', type: ActivityType.Playing },
	];

	setInterval(async () => {
		const activity = activities[i];

		if (activity.name.includes('{readySince}')) {
			const placeholder = await readySince();
			activity.name = activity.name.replace('{readySince}', placeholder);
		}

		if (activity.name.includes('{guildCount}')) {
			const placeholder = await guildCount();
			activity.name = activity.name.replace('{guildCount}', placeholder.toString());
		}

		if (activity.name.includes('{playingCount}')) {
			const placeholder = await playingCount();
			activity.name = activity.name.replace(
				'{playingCount}',
				placeholder.toString()
			);
		}

		client.user.setActivity(activity);

		i === activities.length - 1 ? (i = 0) : i++;
	}, updateInterval);
}

export async function deleteAllPlayingMessages() {
	const guilds = await GuildRepo.find();

	consoleLog('READY', `Deleting ${guilds.length} playing messages`);

	for (const guild of guilds) {
		if (!guild.playingMessage) continue;
		const playingMessage = guild.playingMessage;

		try {
		const channel = await client.channels.fetch(playingMessage.channelId);
		if (!channel || !(channel instanceof BaseGuildTextChannel)) continue;

			const message = await channel.messages.fetch(playingMessage.messageId);
			if (message) await message.delete();
		} catch {}

		guild.playingMessage = null;
		await guild.save();
		await playingMessage.remove();
	}

	PlayingMessageRepo.clear();
}
