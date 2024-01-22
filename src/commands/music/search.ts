import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from 'classes/Command';
import locale from 'localization/commands/music/search.json';
import { InteractionMember } from 'utils';
import { SearchResultType } from 'distube';
import {
	ActionRowBuilder,
	ButtonBuilder,
	Colors,
	ComponentType,
	EmbedBuilder,
} from 'discord.js';

export default new Command({
	// prettier-ignore
	data: new SlashCommandBuilder()
		.setName(locale.cmdName['en-US'])
		.setDescription(locale.cmdDesc['en-US'])
		.setNameLocalizations(locale.cmdName)
		.setDescriptionLocalizations(locale.cmdDesc)
		.addStringOption(option => option
			.setName(locale.cmdOptions.song.name['en-US'])
			.setDescription(locale.cmdOptions.song.desc['en-US'])
			.setNameLocalizations(locale.cmdOptions.song.name)
			.setDescriptionLocalizations(locale.cmdOptions.song.desc)
			.setRequired(true)
		)
		.addIntegerOption(option => option
			.setName(locale.cmdOptions.results.name['en-US'])
			.setDescription(locale.cmdOptions.results.desc['en-US'])
			.setNameLocalizations(locale.cmdOptions.results.name)
			.setDescriptionLocalizations(locale.cmdOptions.results.desc)
			.setMinValue(1)
			.setMaxValue(10)
			.setRequired(false)
		),
	execute: async ({ client, interaction, userDB }) => {
		await interaction.deferReply({ ephemeral: true });

		const channel = InteractionMember(interaction).voice.channel;
		const clientMember = interaction.guild?.members.me;

		if (!channel)
			return interaction.editReply({ content: locale.noChannel[userDB.language] });

		if (!channel.joinable && clientMember.voice.channelId !== channel.id)
			return interaction.editReply({ content: locale.noJoinable[userDB.language] });

		const query = interaction.options.getString(
			locale.cmdOptions.song.name['en-US'],
			true
		);

		const resultCount =
			interaction.options.getInteger(
				locale.cmdOptions.results.name['en-US'],
				false
			) || 10;

		const results = await client.distube.search(query, {
			limit: resultCount,
			retried: false,
			type: SearchResultType.VIDEO,
		});

		let embed = new EmbedBuilder().setColor(Colors.Aqua);

		if (results.length === 0)
			return interaction.editReply({ content: locale.noResults[userDB.language] });

		let buttons: ActionRowBuilder<ButtonBuilder>[] = [];
		let description = '';

		results.forEach((result, i) => {
			description +=
				`**${i + 1}・** [${result.name}](${result.url}) | ` +
				`\`${result.isLive ? 'LIVE' : result.formattedDuration}\` | ` +
				`${formattedViews(result.views)} views\n`;

			if (i % 5 === 0) buttons.push(new ActionRowBuilder());
			buttons[Math.floor(i / 5)].addComponents(
				new ButtonBuilder()
					.setCustomId(`search-${i}`)
					.setEmoji(emojiNumbers[i])
					.setStyle(2)
			);
		});

		embed.setDescription(description);

		const message = await interaction.editReply({
			embeds: [embed],
			components: buttons,
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			idle: 60_000,
		});

		collector.on('collect', async (buttonInt): Promise<any> => {
			buttonInt
				.deferReply({ ephemeral: false })
				.then(() => buttonInt.deleteReply());

			interaction.editReply({ components: [] });

			const member = InteractionMember(interaction);
			const channel = member.voice.channel;

			if (!channel)
				return interaction.editReply({
					content: locale.noChannel[userDB.language],
				});

			if (!channel.joinable && clientMember.voice.channelId !== channel.id)
				return interaction.editReply({
					content: locale.noJoinable[userDB.language],
				});

			const result = results[parseInt(buttonInt.customId.split('-')[1])];

			await client.distube.play(channel, result, {
				member: member,
				textChannel: interaction.channel,
			});
		});
	},
});

const formattedViews = (views?: number): string => {
	if (!views || views === 0) return '0';
	if (views >= 1_000_000_000) return `${Math.floor(views / 1_000_000_000)}B`;
	else if (views >= 1_000_000) return `${Math.floor(views / 1_000_000)}M`;
	else if (views >= 1000) return `${Math.floor(views / 1000)}K`;
	else return `${views}`;
};

const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
