import { SubCommand } from 'classes/SubCommand';
import { SlashCommandSubcommandBuilder, CommandInteraction, Role } from 'discord.js';
import { DJRoleEntity, GuildEntity } from 'db/entities';
import locale from 'localization/commands/admin/djRole.json';

const maxDJRoles = 5;

export default new SubCommand({
	// prettier-ignore
	data: new SlashCommandSubcommandBuilder()
		.setName(locale.cmdName['en-US'])
		.setDescription(locale.cmdDesc['en-US'])
		.setNameLocalizations(locale.cmdName)
		.setDescriptionLocalizations(locale.cmdDesc)
		.addRoleOption(option => option
			.setName(locale.cmdOption.name['en-US'])
			.setDescription(locale.cmdOption.desc['en-US'])
			.setNameLocalizations(locale.cmdOption.name)
			.setDescriptionLocalizations(locale.cmdOption.desc)
			.setRequired(false)
		),

	execute: async ({ interaction, guildDB }) => {
		const newValue = interaction.options.getRole(
			locale.cmdOption.name['en-US']
		) as Role;

		if (!newValue)
			return showRoles({ interaction, guildDB, newValue, lang: guildDB.language });

		const alreadyDJRole = await DJRoleEntity.countBy({ roleId: newValue.id });

		if (alreadyDJRole > 0)
			return removeRole({ interaction, guildDB, newValue, lang: guildDB.language });
		else if (guildDB.djRoles && guildDB.djRoles.length >= maxDJRoles)
			return fullOfRoles({
				interaction,
				guildDB,
				newValue,
				lang: guildDB.language,
			});
		else return addRole({ interaction, guildDB, newValue, lang: guildDB.language });
	},
});

interface Options {
	interaction: CommandInteraction;
	guildDB: GuildEntity;
	lang: string;
	newValue: Role;
}

const showRoles = ({ interaction, guildDB, lang }: Options) =>
	interaction.editReply({
		content:
			guildDB.djRoles.length === 0
				? `${locale.noRoles[lang]}`
				: `${locale.showRoles[lang].replace(
						'{roles}',
						guildDB.djRoles.map((roleID) => `<@&${roleID}>`).join(', ')
				  )}`,
	});

async function addRole({ interaction, guildDB, newValue, lang }: Options) {
	const djRole = new DJRoleEntity();
	djRole.roleId = guildDB.id;
	djRole.guild = guildDB;
	await djRole.save();

	interaction.editReply({
		content: `${locale.addRole[lang].replace('{role}', newValue.toString())}}`,
	});
}

async function removeRole({ interaction, guildDB, newValue, lang }: Options) {
	const djRole = await DJRoleEntity.findOne({ where: { roleId: newValue.id } });

	if (!djRole)
		return interaction.editReply({
			content: `${locale.notDJRole[lang].replace('{role}', newValue.toString())}`,
		});
	djRole.remove();

	guildDB.djRoles = guildDB.djRoles.filter(
		(DJRoleData) => DJRoleData.roleId !== newValue.id
	);
	await guildDB.save();

	interaction.editReply({
		content: `${locale.removeRole[lang].replace('{role}', newValue.toString())}`,
	});
}

const fullOfRoles = ({ interaction, lang }: Options) =>
	interaction.editReply({
		content: `${locale.fullOfRoles[lang]}`,
	});
