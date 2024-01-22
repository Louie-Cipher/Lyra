import { ButtonEvent } from 'classes/ButtonEvent';
import { HasDJRole, HumanMembers, InteractionMember } from 'utils';

export default new ButtonEvent({
	name: 'previous',
	execute: async ({ interaction, guildDB, queue }) => {
		interaction
			.deferReply({ ephemeral: false })
			.then(() => interaction.deleteReply());

		const playingMessage = guildDB.playingMessage;

		if (!queue.previousSongs[0]) return;

		if (
			guildDB.config.everyoneSkip ||
			HumanMembers(queue.voiceChannel) === 1 ||
			HasDJRole(InteractionMember(interaction), guildDB)
		)
			return queue.previous();

		if (playingMessage.previousVoteUsers.includes(interaction.user.id)) return;

		playingMessage.previousVoteUsers.push(interaction.user.id);

		playingMessage.previousVotesRequired = Math.ceil(
			HumanMembers(queue.voiceChannel) / 2
		);

		if (playingMessage.previousVoteUsers.length >= playingMessage.previousVotesRequired) {
			if (queue.previousSongs[0]) queue.previous();
			playingMessage.previousVoteUsers = [];
			playingMessage.previousVotesRequired = 0;
		}
		await playingMessage.save();
		guildDB.playingMessage = playingMessage;
		await guildDB.save();
	},
});
