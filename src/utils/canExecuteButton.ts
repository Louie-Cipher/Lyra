import { ButtonInteraction } from 'discord.js';
import { GuildEntity } from 'db/entities';
import { GuildRepo, PlayingMessageRepo } from 'db/repositories';
import LyraClient from 'classes/Client';
import { HasDJRole, HumanMembers, InteractionMember } from '.';

interface ButtonEventOptions {
	client: LyraClient;
	interaction: ButtonInteraction;
	guildDB: GuildEntity;
	guildConfigAllowed?: boolean;
}

export default async ({
	client,
	interaction,
	guildDB,
	guildConfigAllowed,
}: ButtonEventOptions): Promise<boolean> => {
	// interaction.deferReply({ ephemeral: false }).then(() => interaction.deleteReply());

	const queue = client.distube.getQueue(interaction.guild);

	if (!queue) {
		const guildDB = await GuildRepo.findOneBy({ id: interaction.guild.id });

		if (guildDB.playingMessage) {
			const message = await interaction.channel.messages.fetch(
				guildDB.playingMessage.messageId
			);
			if (message) message.edit({ components: [] });
			guildDB.playingMessage.remove();
		}
		interaction.deferReply({ ephemeral: false }).then((i) => i.delete());
		return false;
	}

	return (
		guildConfigAllowed ||
		HumanMembers(queue.voiceChannel) === 1 ||
		HasDJRole(InteractionMember(interaction), guildDB)
	);
};
