import {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
} from 'discord.js';
import { Command } from 'classes/Command';
import moment from 'moment';
import locale from 'localization/commands/general/botInfo.json';

const dependencies = require('@root/package.json').dependencies;

export default new Command({
	// prettier-ignore
	data: new SlashCommandBuilder()
		.setName(locale.cmdName['en-US'])
		.setDescription(locale.cmdDesc['en-US'])
		.setNameLocalizations(locale.cmdName)
		.setDescriptionLocalizations(locale.cmdDesc),

	execute: async ({ client, interaction, guildDB }) => {
		await interaction.deferReply({ ephemeral: false });

		const lang = guildDB.language;
		moment.updateLocale(lang, {});

		const count = client.distube.queues.size;

		const embed = new EmbedBuilder()
			.setTitle(locale.title[lang])
			.setFooter({ text: locale.footer[lang] })
			.addFields(
				{
					name: `⏰ ${locale.onlineSince[lang]}`,
					value: moment(client.readyAt).fromNow(true),
					inline: true,
				},
				{
					name: `🌐 ${locale.servers[lang]}`,
					value: `${client.guilds.cache.size}`,
					inline: true,
				},
				{
					name: `🎶 ${locale.playingOn[lang]}`,
					value: `${count} ${locale[count > 1 ? 'servers' : 'server'][lang]}`,
					inline: true,
				},
				{
					name: `🏓 ${locale.ping[lang]}`,
					value: `${Math.round(client.ws.ping)}ms`,
					inline: true,
				},
				{
					name: `<:node:896823449182429234> ${locale.nodeVersion[lang]}`,
					value: process.version.substring(1),
					inline: true,
				},
				{
					name: `<:discordjs:896824144979718146> ${locale.discordjsVersion[lang]}`,
					value: `${dependencies['discord.js'].substring(1)}`,
					inline: true,
				}
			);

		const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel(locale.invite[lang])
				.setStyle(5) // ButtonStyle.link
				.setURL(
					'https://discord.com/api/oauth2/authorize?client_id=' +
						client.user.id +
						'&permissions=277062404096&scope=bot%20applications.commands'
				),
			new ButtonBuilder()
				.setLabel(locale.sourceCode[lang])
				.setStyle(5) // ButtonStyle.link
				.setURL('https://github.com/louie-cipher/lyra')
		);

		interaction.editReply({
			embeds: [embed],
			components: [buttons],
		});
	},
});
