import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from '@discordjs/builders';
import { ButtonStyle, Colors } from 'discord.js';
import { ButtonEvent } from 'classes/ButtonEvent';
import canExecuteButton from 'utils/canExecuteButton';
import locale from 'localization/events/volume.json';

export default new ButtonEvent({
	name: 'volume',
	execute: async ({ client, interaction, guildDB, queue }) => {
		const canExecute = await canExecuteButton({
			client,
			interaction,
			guildDB,
			guildConfigAllowed: guildDB.config.everyoneStop,
		});

		if (!canExecute) return;

		const lang = guildDB.language;

		const embed = new EmbedBuilder()
			.setColor(Colors.Aqua)
			.setTitle(locale.title[lang])
			.setDescription(
				locale.description[lang].replace('{volume}', queue.volume.toString())
			);

		const buttons: ActionRowBuilder<ButtonBuilder>[] = [];

		for (let i = 0; i < 10; i++) {
			const button =
				i % 5 === 0
					? new ActionRowBuilder<ButtonBuilder>()
					: buttons[(i % 5) - 1];

			button.addComponents(
				new ButtonBuilder()
					.setCustomId(`volume-${i + 1}`)
					.setLabel(`${i + 1}`)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(queue.volume === i + 1)
			);
		}

		const message = await interaction.reply({
			embeds: [embed],
			components: buttons,
			fetchReply: true,
		});

		const collector = message.createMessageComponentCollector({
			filter: (i) => i.user.id === interaction.user.id,
			time: 30_000,
		});

		collector.on('collect', async (buttonInt) => {
			const volume = parseInt(buttonInt.customId.split('-')[1]);
			if (volume === queue.volume) return;

			client.distube.setVolume(interaction.guild, volume);
			await buttonInt.update({
				embeds: [
					new EmbedBuilder()
						.setColor(Colors.Aqua)
						.setTitle(locale.title[lang])
						.setDescription(
							locale.description[lang].replace(
								'{volume}',
								volume.toString()
							)
						),
				],
				components: [],
			});
		});
	},
});
