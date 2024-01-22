import { ButtonEvent } from 'classes/ButtonEvent';
import { HasDJRole, HumanMembers, InteractionMember } from 'utils';

export default new ButtonEvent({
	name: 'stop',
	execute: async ({ interaction, guildDB, queue }) => {
		interaction
			.deferReply({ ephemeral: false })
			.then(() => interaction.deleteReply());

		const playingMessage = guildDB.playingMessage;

		if (
			guildDB.config.everyoneStop ||
			HumanMembers(queue.voiceChannel) === 1 ||
			HasDJRole(InteractionMember(interaction), guildDB)
		)
			return queue.stop();

		if (playingMessage.stopVoteUsers.includes(interaction.user.id)) return;

		playingMessage.stopVoteUsers.push(interaction.user.id);

		playingMessage.stopVotesRequired = Math.ceil(
			HumanMembers(queue.voiceChannel) / 2
		);

		if (playingMessage.stopVoteUsers.length >= playingMessage.stopVotesRequired) {
			queue.stop();
			playingMessage.stopVoteUsers = [];
			playingMessage.stopVotesRequired = 0;
		}
		await playingMessage.save();
		guildDB.playingMessage = playingMessage;
		await guildDB.save();
	},
});
