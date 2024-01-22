import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Message,
} from 'discord.js';
import { Queue, Song } from 'distube';
import { CanSendMsg } from '.';
import { GuildRepo } from 'db/repositories';
import locale from 'localization/other/embedGenerator.json';
import { PlayingMessageEntity } from 'db/entities';

export default async (queue: Queue) => {
	if (!CanSendMsg(queue)) return;

	const guildDB = await GuildRepo.findOrCreate(queue.voiceChannel.guild);
	const lang = guildDB.language;
	const onOffOption = (value: boolean) => (value ? locale.on[lang] : locale.off[lang]);

	const playingMessage = guildDB.playingMessage || new PlayingMessageEntity();
	if (!guildDB.playingMessage) guildDB.playingMessage = playingMessage;

	const skipLabel =
		playingMessage && playingMessage.skipVotesRequired
			? `${locale.skip[lang]} ` +
			  `(${playingMessage.skipVoteUsers.length}/${playingMessage.skipVotesRequired})`
			: `${locale.skip[lang]}`;

	let buttons: ActionRowBuilder<ButtonBuilder>[] = [
		new ActionRowBuilder(),
		new ActionRowBuilder(),
		new ActionRowBuilder(),
	];

	buttons[0].addComponents(
		// Previous
		new ButtonBuilder()
			.setCustomId('player-previous')
			.setLabel(locale.previous[lang])
			.setEmoji('⏮️')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(queue.previousSongs.length === 0),
		// Pause/Resume
		new ButtonBuilder()
			.setCustomId('player-pause')
			.setLabel(locale[queue.paused ? 'resume' : 'pause'][lang])
			.setEmoji(queue.paused ? '▶️' : '⏸️')
			.setStyle(ButtonStyle.Secondary),
		// Skip
		new ButtonBuilder()
			.setCustomId('player-skip')
			.setEmoji('⏭️')
			.setStyle(ButtonStyle.Secondary)
			.setLabel(skipLabel)
			.setDisabled(!queue.songs[1] && !queue.autoplay)
	);

	buttons[1].addComponents(
		// Volume
		new ButtonBuilder()
			.setCustomId('player-volume')
			.setLabel(`${locale.volume[lang]} |  ${queue.volume * 2}`)
			.setEmoji('🔊')
			.setStyle(ButtonStyle.Primary),
		// Autoplay
		new ButtonBuilder()
			.setCustomId('player-autoplay')
			.setLabel(`${locale.autoplay[lang]} | ${onOffOption(queue.autoplay)}`)
			.setEmoji(queue.autoplay ? '✅' : '✖')
			.setStyle(buttonColor(queue.autoplay))
	);
	buttons[2].addComponents(
		// Filter
		new ButtonBuilder()
			.setCustomId('player-filter')
			.setLabel(`${locale.filter[lang]} | ${onOffOption(queue.filters.size > 0)}`)
			.setEmoji('🎛')
			.setStyle(buttonColor(queue.filters.size > 0)),
		// Repeat
		new ButtonBuilder()
			.setCustomId('player-repeat')
			.setLabel(`${locale.repeat[lang]} | ${onOffOption(queue.repeatMode !== 0)}`)
			.setEmoji('🔁')
			.setStyle(buttonColor(queue.repeatMode !== 0)),
		// Stop
		new ButtonBuilder()
			.setCustomId('player-stop')
			.setLabel(locale.stop[lang])
			.setEmoji('⏹️')
			.setStyle(ButtonStyle.Secondary)
	);

	const embed = new EmbedBuilder()
		.setColor(1752220) // Colors.Aqua
		.setTitle('Lyra Player');

	for (const song of queue.songs)
		if (song.thumbnail) {
			embed.setThumbnail(song.thumbnail);
			break;
		}

	const firstSong = queue.songs[0];

	const requestedBy: string =
		!firstSong.user || firstSong.user.id === queue.client.user?.id
			? locale.addedByAutoplay[lang]
			: locale.requestedBy[lang].replace('{user}', firstSong.user.toString());

	let description =
		`${locale.inChannel[lang]} ${queue.voiceChannel.toString()}\n\n` +
		`**${locale.nowPlaying[lang]}**\n` +
		songDescription(firstSong, lang) +
		'\n' +
		requestedBy;

	if (queue.songs.length > 1) {
		description += `\n\n⏳ **${locale.upNext[lang]}**\n`;

		for (let i = 1; i < queue.songs.length; i++) {
			if (i === 11) {
				description += moreSongs(queue.songs.length - i, lang);
				break;
			}

			const song = queue.songs[i];
			const newDescription = `**${i}•** ${songDescription(song, lang)}\n`;

			if (description.length + newDescription.length > 4000) {
				description += moreSongs(queue.songs.length - i, lang);
				break;
			}
			description += newDescription;
		}
	}
	embed.setDescription(description.substring(0, 4096));

	if (playingMessage.messageId) {
		const message = await queue.textChannel?.messages.fetch(playingMessage.messageId);

		if (message) {
			if (message.id === queue.textChannel.lastMessageId)
				return message.edit({
					embeds: [embed],
					components: buttons,
					content: null,
				});
			else message.delete();
		}
	}
	const message = await queue.textChannel.send({
		embeds: [embed],
		components: buttons,
	});

	playingMessage.messageId = message.id;
	playingMessage.channelId = message.channelId;
	playingMessage.guild = guildDB;
	await playingMessage.save();
	guildDB.playingMessage = playingMessage;
	await guildDB.save();
};

const buttonColor = (value: boolean) =>
	value ? ButtonStyle.Success : ButtonStyle.Danger;

const songDescription = (song: Song<unknown>, lang: string) =>
	`[${song.name}](${song.url}) | ` +
	`\`${song.isLive ? locale.live[lang] : song.formattedDuration}\``;

const moreSongs = (num: number, lang: string) =>
	`\n**${locale.andMore[lang].replace('{num}', `${num}`)}**`;

export function disableButtons(message: Message) {
	const oldRows = message.components;
	const newRows: ActionRowBuilder<ButtonBuilder>[] = [];

	for (const row of oldRows) {
		const newRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

		for (const component of row.components) {
			if (component instanceof ButtonBuilder) {
				component.setDisabled(true);
				newRow.addComponents(component);
			}
		}
		newRows.push(newRow);
	}
	return newRows;
}
