import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from 'classes/Command';
import { SearchResultType } from 'distube';
import locale from 'localization/commands/fun/silenceBrokenBy.json';
import { InteractionMember } from 'utils';
import { downloadFromInfo, getInfo } from '@distube/ytdl-core';
import {
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	StreamType,
} from '@discordjs/voice';
import { BaseGuildVoiceChannel, ChannelType, VoiceChannel } from 'discord.js';

export default new Command({
	// prettier-ignore
	data: new SlashCommandBuilder()
		.setName(locale.cmdName['en-US'])
		.setDescription(locale.cmdDesc['en-US'])
		.setNameLocalizations(locale.cmdName)
		.setDescriptionLocalizations(locale.cmdDesc)
		.addStringOption(option => option
			.setName(locale.cmdOption.song.name['en-US'])
			.setDescription(locale.cmdOption.song.desc['en-US'])
			.setNameLocalizations(locale.cmdOption.song.name)
			.setDescriptionLocalizations(locale.cmdOption.song.desc)
			.setRequired(true)
		),

	execute: async ({ client, interaction, userDB }) => {
		await interaction.deferReply({ ephemeral: true });

		const channel = InteractionMember(interaction).voice.channel;
		const clientMember = interaction.guild?.members.me;

		if (!channel)
			return interaction.editReply({ content: locale.noChannel[userDB.language] });

		if (!channel.joinable && clientMember.voice.channelId !== channel.id)
			return interaction.editReply({ content: locale.noJoinable[userDB.language] });

		const query = interaction.options.getString(locale.cmdOption.song.name['en-US']);
		const songs = await client.distube.search(query, {
			limit: 1,
			type: SearchResultType.VIDEO,
		});

		if (!songs || !songs[0])
			return interaction.editReply({ content: locale.noSong[userDB.language] });

		const song = songs[0];
		const songInfo = await getInfo(song.url);
		const downloadedSong = await downloadFromInfo(songInfo);

		const player = createAudioPlayer();

		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});

		connection.subscribe(player);

		const resource = createAudioResource(downloadedSong, {
			inputType: StreamType.Arbitrary,
			inlineVolume: true,
			silencePaddingFrames: 0,
		});

		player.play(resource);
	},
});

// random time between 2 min and 10 min
const randomSilenceTime = () =>
	// Math.floor(Math.random() * (10 - 2 + 1) + 2) * 60 * 1000;

	// debug mode: random time between 20 sec and 60 sec
	Math.floor(Math.random() * (60 - 20 + 1) + 20) * 1000;
