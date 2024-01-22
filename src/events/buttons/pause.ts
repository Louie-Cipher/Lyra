import { ButtonEvent } from 'classes/ButtonEvent';
import canExecuteButton from 'utils/canExecuteButton';
import embedGenerator from 'utils/embedGenerator';

export default new ButtonEvent({
	name: 'pause',
	execute: async ({ client, interaction, guildDB, queue }) => {
		if (
			!(await canExecuteButton({
				client,
				interaction,
				guildDB,
				guildConfigAllowed: guildDB.config.everyonePause,
			}))
		)
			return;

		interaction.deferReply({ ephemeral: false }).then((i) => i.delete());

		queue.paused ? queue.resume() : queue.pause();
		embedGenerator(queue);
	},
});
