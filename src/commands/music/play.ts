import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from 'classes/Command';
import locale from 'localization/commands/music/play.json';
import { InteractionMember } from 'utils';

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

	execute: async ({ client, interaction, userDB }) => {
		await interaction.deferReply({ ephemeral: true });

		const channel = InteractionMember(interaction).voice.channel;
		const clientMember = interaction.guild?.members.me;

		if (!channel)
			return interaction.editReply({ content: locale.noChannel[userDB.language] });

		if (!channel.joinable && clientMember.voice.channelId !== channel.id)
			return interaction.editReply({ content: locale.noJoinable[userDB.language] });

		const query = interaction.options.getString(locale.cmdOption.name['en-US']);

		client.distube
			.play(channel, query, {
				member: InteractionMember(interaction),
				textChannel: interaction.channel,
			})
			.then(() =>
				interaction.editReply({ content: locale.success[userDB.language] })
			)
			.catch((err) =>
				interaction.editReply({ content: locale.error[userDB.language] })
			);
	},
});
