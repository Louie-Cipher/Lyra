import { SubCommand } from 'classes/SubCommand';
import { SlashCommandSubcommandBuilder, CommandInteraction } from 'discord.js';
import { GuildEntity } from 'db/entities';
import locale from 'localization/commands/admin/volume.json';

export default new SubCommand({
	// prettier-ignore
	data: new SlashCommandSubcommandBuilder()
		.setName(locale.cmdName['en-US'])
		.setDescription(locale.cmdDesc['en-US'])
		.setNameLocalizations(locale.cmdName)
		.setDescriptionLocalizations(locale.cmdDesc)
		.addIntegerOption(option => option
			.setName(locale.cmdOption.name['en-US'])
			.setDescription(locale.cmdOption.desc['en-US'])
			.setNameLocalizations(locale.cmdOption.name)
			.setDescriptionLocalizations(locale.cmdOption.desc)
			.setRequired(false)
			.setMinValue(0)
			.setMaxValue(100)
		),

	execute: async ({ interaction, guildDB }) => {
		const newValue = interaction.options.getInteger(locale.cmdOption.name['en-US']);

		if (!newValue)
			return show({ interaction, guildDB, newValue, lang: guildDB.language });
		else return edit({ interaction, guildDB, newValue, lang: guildDB.language });
	},
});

interface Options {
	interaction: CommandInteraction;
	guildDB: GuildEntity;
	newValue: number;
	lang: string;
}

const show = ({ interaction, guildDB, lang }: Options) =>
	interaction.editReply({
		content: `${locale.show[lang].replace('{volume}', `${guildDB.config.volume}`)}`,
	});

async function edit({ interaction, guildDB, newValue, lang }: Options) {
	guildDB.config.volume = newValue;
	await guildDB.config.save();
	await guildDB.save();

	interaction.editReply({
		content: `${locale.edit[lang].replace('{volume}', `${newValue}`)}`,
	});
}
