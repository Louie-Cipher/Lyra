import { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder } from '@discordjs/builders';
import { Colors, APIMessageComponentEmoji, ComponentType } from 'discord.js';
import { ButtonEvent } from 'classes/ButtonEvent';
import canExecuteButton from 'utils/canExecuteButton';
import locale from 'localization/events/filter.json';
import embedGenerator from 'utils/embedGenerator';

export default new ButtonEvent({
	name: 'filter',
	topggUpvote: true,
	execute: async ({ client, interaction, guildDB }) => {
		if (
			!(await canExecuteButton({
				client,
				interaction,
				guildDB,
				guildConfigAllowed: guildDB.config.everyoneStop,
			}))
		)
			return;

		const lang = guildDB.language;

		const message = await interaction.reply(updateMessage());

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			filter: (i) => i.user.id === interaction.user.id,
			time: 60_000,
		});

		collector
			.on('collect', async (selectInt) => {
				selectInt
					.deferReply({ ephemeral: false })
					.then(() => selectInt.deleteReply());

				let queue = client.distube.getQueue(interaction.guildId);
				if (!queue) return selectInt.deleteReply();

				const selectedFilters = selectInt.values;

				queue.filters.add(selectedFilters);
				embedGenerator(queue);
				interaction.editReply(updateMessage());
			})
			.on('end', () => {
				interaction.editReply({ components: [] });
			});

		function updateMessage() {
			const queue = client.distube.getQueue(interaction.guild);

			const embed = new EmbedBuilder()
				.setColor(Colors.Aqua)
				.setTitle(locale.title[lang])
				.setDescription(
					`${locale.description[lang]}\n` +
						`${queue.filters || locale.noFilters[lang]}}`
				);

			const selectMenu = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
				new SelectMenuBuilder()
					.setCustomId('filter')
					.setPlaceholder('Select a filter')
					.setMinValues(1)
			);

			const filters = client.distube.filters;

			for (let i = 0; i < filters.names.length; i++) {
				const emoji = queue.filters.names.includes(filters.names[i])
					? '✅'
					: '❌';

				selectMenu.components[0].addOptions({
					label: filters.names[i],
					value: filters.names[i],
					emoji: emoji as APIMessageComponentEmoji,
				});
			}

			return {
				embeds: [embed],
				components: [selectMenu],
				fetchReply: true,
			};
		}
	},
});
