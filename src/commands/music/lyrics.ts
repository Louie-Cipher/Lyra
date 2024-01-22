import {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ComponentType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Command } from 'classes/Command';
import locale from 'localization/commands/music/lyrics.json';
import { Client as GeniusClient, Song as GeniusSong } from 'genius-lyrics';
import { Song } from 'distube';

const genius = new GeniusClient();

export default new Command({
	// prettier-ignore
	data: new SlashCommandBuilder()
		.setName(locale.cmdName['en-US'])
		.setDescription(locale.cmdDesc['en-US'])
		.setNameLocalizations(locale.cmdName)
		.setDescriptionLocalizations(locale.cmdDesc)
		.addStringOption(option => option
			.setName(locale.cmdOption.name['en-US'])
			.setDescription(locale.cmdOption.desc['en-US'])
			.setNameLocalizations(locale.cmdOption.name)
			.setDescriptionLocalizations(locale.cmdOption.desc)
			.setRequired(false)
		),

	execute: async ({ client, interaction, guildDB }) => {
		await interaction.deferReply({ ephemeral: false });
		const lang = guildDB.language;

		const query = interaction.options.getString(locale.cmdOption.name[lang]);
		const queue = client.distube.getQueue(interaction.guild);
		if (!queue && !query)
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle(locale.noQueue.title[lang])
						.setDescription(locale.noQueue.desc[lang]),
				],
			});

		const songName = query || (queue.songs[0] as Song).name;

		const lyrics = await genius.songs.search(songName);
		if (!lyrics || lyrics.length === 0)
			return interaction.reply({ content: locale.noLyrics[lang], ephemeral: true });

		if (lyrics.length === 1) {
			const embed = await lyricEmbed(lyrics[0]);
			return interaction.reply({ embeds: [embed] });
		}

		MultipleResults({ interaction, lyrics, lang });
	},
});

async function lyricEmbed(lyric: GeniusSong) {
	const text = await lyric.lyrics();

	const embed = new EmbedBuilder()
		.setTitle(lyric.title)
		.setDescription(text.substring(0, 2048))
		.setAuthor({ name: lyric.artist.name, iconURL: lyric.artist.image })
		.setThumbnail(lyric.thumbnail);

	return embed;
}

interface Options {
	interaction: ChatInputCommandInteraction;
	lyrics: GeniusSong[];
	lang: string;
}

async function MultipleResults({ interaction, lyrics, lang }: Options) {
	const embed = new EmbedBuilder()
		.setTitle(locale.multipleResults.title[lang])
		.setDescription(locale.multipleResults.desc[lang]);

	const buttonRows: ActionRowBuilder<ButtonBuilder>[] = [];

	let description = '';

	const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

	lyrics.forEach((lyric, i) => {
		if (i > 10) return;
		description += `${i}| ${lyric.artist.name} - ${lyric.title}\n`;

		const buttonRow = buttonRows[Math.floor(i / 5)];

		buttonRow.addComponents(
			new ButtonBuilder().setCustomId(`lyric-${i}`).setEmoji(emojis[i]).setStyle(1)
		);

		if (i % 5 === 0) buttonRows.push(new ActionRowBuilder());
	});

	embed.setDescription(description);

	const message = await interaction.editReply({
		embeds: [embed],
		components: buttonRows,
	});
	const collector = message.createMessageComponentCollector({
		filter: (i) => i.user.id === interaction.user.id,
		componentType: ComponentType.Button,
		idle: 30_000,
	});

	collector.on('collect', async (buttonInt) => {
		buttonInt.deferReply({ ephemeral: false }).then(() => buttonInt.deleteReply());

		const lyric = lyrics[parseInt(buttonInt.customId.split('-')[1])];

		const embed = await lyricEmbed(lyric);

		interaction.editReply({ embeds: [embed], components: [] });
	});

	collector.on('end', (): any => interaction.editReply({ components: [] }));
}
