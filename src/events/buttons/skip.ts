import { ButtonEvent } from 'classes/ButtonEvent';
import { HasDJRole, HumanMembers, InteractionMember } from 'utils';

export default new ButtonEvent({
	name: 'skip',
	execute: async ({ interaction, guildDB, queue }) => {
		interaction
			.deferReply({ ephemeral: false })
			.then(() => interaction.deleteReply());

		const playingMessage = guildDB.playingMessage;

		if (!queue.songs[1] && !queue.autoplay) return;

		if (
			guildDB.config.everyoneSkip ||
			HumanMembers(queue.voiceChannel) === 1 ||
			HasDJRole(InteractionMember(interaction), guildDB) ||
			queue.songs[0].member.id === interaction.user.id
		)
			return queue.skip();

		if (playingMessage.skipVoteUsers.includes(interaction.user.id)) return;

		playingMessage.skipVoteUsers.push(interaction.user.id);

		playingMessage.skipVotesRequired = Math.ceil(
			HumanMembers(queue.voiceChannel) / 2
		);

		if (playingMessage.skipVoteUsers.length >= playingMessage.skipVotesRequired) {
			if (queue.songs[1] || queue.autoplay) queue.skip();
			playingMessage.skipVoteUsers = [];
			playingMessage.skipVotesRequired = 0;
		}
		await playingMessage.save();
		guildDB.playingMessage = playingMessage;
		await guildDB.save();
	},
});
