import { GuildConfigEntity, GuildEntity } from 'db/entities';
import { UserRepo } from 'db/repositories';
import Event from 'classes/Event';
import { getGuildJoinChannel } from 'utils/devGuild';
import { registerCommandsInGuild } from 'utils/loader';

export default new Event('guildCreate', async (guild) => {
	registerCommandsInGuild(guild);

	const owner = await guild.members.fetch(guild.ownerId);

	if (owner) UserRepo.findOrCreate(owner.user);

	const guildDB = await GuildEntity.findOneBy({ id: guild.id });

	if (!guildDB) {
		const newGuildDB = new GuildEntity();
		newGuildDB.id = guild.id;
		newGuildDB.name = guild.name;
		newGuildDB.language = guild.preferredLocale === 'pt-BR' ? 'pt-BR' : 'en-US';

		const newGuildConfigDB = new GuildConfigEntity();
		newGuildConfigDB.guildId = guild.id;
		newGuildConfigDB.guild = newGuildDB;
		await newGuildConfigDB.save();
		await newGuildDB.save();
	}

	const announcementChannel = await getGuildJoinChannel();

	announcementChannel.send({
		embeds: [
			{
				color: 1752220, // Colors.Aqua
				title: 'New guild',
				fields: [
					{ name: 'ID', value: guild.id, inline: true },
					{ name: 'Name', value: guild.name, inline: true },
				],
			},
		],
	});
});
