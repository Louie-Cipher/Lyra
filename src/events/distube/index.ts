import { GuildRepo } from 'db/repositories';
import embedGenerator from 'utils/embedGenerator';
import { Queue } from 'distube';
import { ChannelType, Colors, EmbedBuilder } from 'discord.js';
import locale from 'localization/events/distube.json';
import client from 'client';
import { consoleLog } from 'utils/log';

client.distube
	.on('playSong', (queue) => embedGenerator(queue))
	.on('addSong', (queue) => embedGenerator(queue))
	.on('addList', (queue) => embedGenerator(queue))
	.on('empty', (queue) => queue.pause())
	.on('initQueue', async (queue) => {
		const guildDB = await GuildRepo.findOrCreate(queue.voiceChannel.guild);

		queue.setVolume(guildDB.config.volume);
		if (guildDB.config.autoplay) queue.toggleAutoplay();

		if (queue.voiceChannel.type === ChannelType.GuildStageVoice)
			queue.voiceChannel.guild.members.me.voice.setSuppressed(false);
	})
	.on('deleteQueue', async (queue) => deletePlayingMessage(queue))
	.on('disconnect', async (queue) => deletePlayingMessage(queue))
	.on('finish', async (queue) => {
		const guildDB = await GuildRepo.findOneBy({ id: queue.voiceChannel.guild.id });

		if (!guildDB.playingMessage) return;

		const message = await fetchPlayingMessage(queue);

		const embed = new EmbedBuilder()
			.setColor(Colors.Yellow)
			.setTitle(locale.finish.title[guildDB.language])
			.setDescription(
				locale.finish.description[guildDB.language].replace(
					'{time}',
					`${guildDB.config.emptyCooldown}`
				)
			)
			.setFooter({ text: locale.finish.footer[guildDB.language] });

		if (message) message.edit({ embeds: [embed], components: [] });
		else queue.textChannel.send({ embeds: [embed] });
	})
	.on('error', async (channel, error) => {
		// prettier-ignore
		channel.send({
			embeds: [{
					color: 15548997, // Colors.Red
					title: '⚠ oh no, An error occurred!',
					description: `${error}`.substring(0, 2048),
				}],
			}).catch(() => {});
		consoleLog('[DISTUBE_ERROR]', `at guild: ${channel.guildId}`, error);
	});

async function deletePlayingMessage(queue: Queue) {
	GuildRepo.deletePlayingMessage(queue.voiceChannel.guild);
}

async function fetchPlayingMessage(queue: Queue) {
	const guildDB = await GuildRepo.findOneBy({ id: queue.voiceChannel.guildId });

	if (!guildDB.playingMessage) return null;

	try {
		const message = await queue.textChannel.messages.fetch(
			guildDB.playingMessage.messageId
		);
		return message;
	} catch {
		return null;
	}
}
