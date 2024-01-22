import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../classes/Command';
import locale from '../../localization/commands/general/ping.json';

export default new Command({
	// prettier-ignore
	data: new SlashCommandBuilder()
		.setName(locale.cmdName['en-US'])
		.setDescription(locale.cmdDesc['en-US'])
		.setNameLocalizations(locale.cmdName)
		.setDescriptionLocalizations(locale.cmdDesc),

	execute: async ({ client, interaction }) => {
		const now = Date.now();
		await interaction.deferReply({ ephemeral: false });
		const ping = now - interaction.createdTimestamp;

		interaction.editReply({
			embeds: [
				{
					color: 1752220, // Colors.Aqua
					title: '🏓 | Pong!',
					description:
						`Tempo de resposta do bot: ${ping}ms\n` +
						`Ping de conexão ao Discord: ${client.ws.ping}ms`,
				},
			],
		});
	},
});
