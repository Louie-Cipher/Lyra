import { SubCommand } from 'classes/SubCommand';
import { SlashCommandSubcommandBuilder, CommandInteraction } from 'discord.js';
import { GuildEntity } from 'db/entities';

export default new SubCommand({
	// prettier-ignore
	data: new SlashCommandSubcommandBuilder()
		.setName('language')
		.setDescription('Set the language for the server')
		.addStringOption(option => option
			.setName('language')
			.setDescription('The language to set for the server')
			.setRequired(false)
		),

	execute: async ({ interaction, guildDB }) => {
		const newValue = interaction.options.getString('language');

		if (!newValue) return showLanguages({ interaction, guildDB, newValue });
		else return changeLanguage({ interaction, guildDB, newValue });
	},
});

interface Options {
	interaction: CommandInteraction;
	guildDB: GuildEntity;
	newValue: string;
}

const showLanguages = ({ interaction, guildDB }: Options) =>
	interaction.editReply({
		content: `The language for this server are: ${guildDB.language}`,
	});

async function changeLanguage({ interaction, guildDB, newValue }: Options) {
	guildDB.language = newValue;
	await guildDB.save();

	interaction.editReply({
		content: `Changed the language to ${newValue}`,
	});
}
