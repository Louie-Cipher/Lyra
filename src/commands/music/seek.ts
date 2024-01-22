import { SlashCommandBuilder } from 'discord.js';
import { Command } from 'classes/Command';
import { HasDJRole, InteractionMember } from 'utils';
import locale from 'localization/commands/music/seek.json';
import ms from 'ms';

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
			.setRequired(true)
		),

	execute: async ({ client, interaction, guildDB }) => {
		await interaction.deferReply({ ephemeral: true });
		const lang = guildDB.language;

		const member = InteractionMember(interaction);

		const hasPermission = HasDJRole(member, guildDB);

		if (!hasPermission && (!guildDB.config || !guildDB.config.everyoneSkip))
			return interaction.editReply({ content: locale.noPermission[lang] });

		const queue = client.distube.getQueue(interaction.guild);
		if (!queue)
			return interaction.editReply({
				embeds: [
					{
						color: 15548997, // Colors.Red
						title: locale.noQueue.title[lang],
						description: locale.noQueue.desc[lang],
					},
				],
			});

		const time =
			ms(interaction.options.getString(locale.cmdOption.name[lang])) / 1000;
		if (time > queue.songs[0].duration)
			return interaction.reply({
				content: locale.invalidTime[lang],
				ephemeral: true,
			});

		queue.seek(time);
		interaction.editReply({
			content: locale.success[lang].replace('{time}', `${time}`),
		});
	},
});
