import { Command } from 'classes/Command';
import locale from 'localization/commands/admin/config.json';
import { readdirSync } from 'fs';
import { SubCommandType } from 'types/SubCommand';
import { Collection, SlashCommandBuilder } from 'discord.js';

const subCommands = new Collection<string, SubCommandType>();

export default new Command({
	data: Data(),

	execute: async ({ client, interaction, guildDB }) => {
		await interaction.deferReply({ ephemeral: true });

		const subCmdName = interaction.options.getSubcommand();
		const subCmd = subCommands.get(subCmdName);
		if (!subCmd) return interaction.editReply({ content: 'Subcommand not found' });

		subCmd.execute({ client, interaction, guildDB });
	},
});

function Data() {
	const data = new SlashCommandBuilder()
		.setName(locale.cmdName['en-US'])
		.setDescription(locale.cmdDesc['en-US'])
		.setNameLocalizations(locale.cmdName)
		.setDescriptionLocalizations(locale.cmdDesc)
		.setDefaultMemberPermissions(8); // Administrator

	const subCmdPaths = readdirSync(
		`${process.env.NODE_ENV === 'prod' ? 'dist' : 'src'}/commands/admin/config`
	);

	for (const subCmdPath of subCmdPaths) {
		const subCmd: SubCommandType = require(`./config/${subCmdPath}`).default;

		subCommands.set(subCmd.data.name, subCmd);

		data.addSubcommand(subCmd.data);
	}
	return data;
}
