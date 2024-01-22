import { SubCommand } from 'classes/SubCommand';
import { SlashCommandSubcommandBuilder } from 'discord.js';

export default new SubCommand({
	// prettier-ignore
	data: new SlashCommandSubcommandBuilder()
		.setName('autoplay')
		.setDescription('Set the default autoplay for the server')
		.addBooleanOption(option => option
			.setName('enabled')
			.setDescription('The autoplay to set for the server')
			.setRequired(true)
		),

	execute: async ({ interaction, guildDB }) => {
		const enabled = interaction.options.getBoolean('enabled');

		guildDB.config.autoplay = enabled;
		await guildDB.config.save();
		await guildDB.save();

		interaction.editReply({
			content: `Autoplay is now ${enabled ? 'enabled' : 'disabled'} by default`,
		});
	},
});
