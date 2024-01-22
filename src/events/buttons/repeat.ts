import { Colors } from 'discord.js';
import { ButtonEvent } from 'classes/ButtonEvent';
import canExecuteButton from 'utils/canExecuteButton';
import locale from 'localization/events/repeat.json';
import embedGenerator from 'utils/embedGenerator';

export default new ButtonEvent({
	name: 'repeat',
	execute: async ({ client, interaction, guildDB, queue }) => {
		const canExecute = await canExecuteButton({
			client,
			interaction,
			guildDB,
			guildConfigAllowed: guildDB.config.everyoneStop,
		});

		if (!canExecute) return;

		const lang = guildDB.language;

		const repeatModeCode = queue.setRepeatMode();
		const repeatMode = locale[repeatModeCode][lang];

		interaction.editReply({
			embeds: [
				{
					color: Colors.Aqua,
					title: locale.title[lang],
					description: locale.description[lang].replace(
						'${repeatMode}',
						repeatMode
					),
				},
			],
		});

		embedGenerator(queue);
	},
});
