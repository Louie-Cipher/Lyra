import { GuildEntity } from 'db/entities';
import Event from 'classes/Event';
import { getGuildLeaveChannel } from 'utils/devGuild';

export default new Event('guildDelete', async (guild) => {
	const guildDB = await GuildEntity.findOneBy({ id: guild.id });

	if (guildDB) {
		guildDB.deleted = true;

		if (guildDB.config) guildDB.config.remove();
		if (guildDB.djRoles) guildDB.djRoles.forEach((djRole) => djRole.remove());

		await guildDB.save();
	}

	const announcementChannel = await getGuildLeaveChannel();

	announcementChannel.send({
		embeds: [
			{
				color: 15548997, // Colors.Red
				title: 'Guild left',
				fields: [
					{ name: 'ID', value: guild.id, inline: true },
					{ name: 'Name', value: guild.name, inline: true },
				],
			},
		],
	});
});
