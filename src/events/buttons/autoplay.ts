import { ButtonEvent } from 'classes/ButtonEvent';
import embedGenerator from 'utils/embedGenerator';

export default new ButtonEvent({
	name: 'autoplay',
	execute: async ({ interaction, queue }) => {
		interaction.deferReply({ ephemeral: false });

		if (queue) {
			queue.toggleAutoplay();
			embedGenerator(queue);
		}

		interaction.deleteReply();
	},
});
