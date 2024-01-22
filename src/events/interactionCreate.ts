import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	PermissionResolvable,
} from 'discord.js';
import client from 'client';
import { GuildRepo, PlayingMessageRepo, UserRepo } from 'db/repositories';
import Event from 'classes/Event';
import { consoleError } from 'utils/log';

export default new Event('interactionCreate', async (interaction) => {
	try {
		if (interaction.isChatInputCommand()) commandHandler(interaction);
		else if (interaction.isButton()) buttonInteraction(interaction);
	} catch (err) {
		consoleError('EVENT:INTERACTION_CREATE', err);
	}
});

async function commandHandler(interaction: ChatInputCommandInteraction): Promise<any> {
	try {
		const user = interaction.user;

		const command = client.commands.get(interaction.commandName);

		if (!command)
			return interaction.reply({
				content: `❌ | Command not found`,
				ephemeral: true,
			});

		const userDB = await UserRepo.findOrCreate(user);
		userDB.lastCommand = new Date();
		await userDB.save();

		const guildDB = await GuildRepo.findOrCreate(interaction.guild);

		const permissions = command.data.default_member_permissions;

		if (
			permissions &&
			!interaction.channel
				.permissionsFor(user)
				.has(permissions as PermissionResolvable)
		)
			return interaction.reply({
				content: `❌ | No permission`,
			});

		command.execute({ client, interaction, userDB, guildDB });
	} catch (err) {
		consoleError('INTERACTION:COMMAND', err);
	}
}

async function buttonInteraction(interaction: ButtonInteraction): Promise<any> {
	try {
		if (!interaction.customId.startsWith('player-')) return;
		const playingMessage = await PlayingMessageRepo.findOneBy({
			messageId: interaction.message.id,
		});

		if (!playingMessage)
			return interaction.deferReply().then(() => interaction.deleteReply());

		const button = client.buttons.get(interaction.customId.split('-')[1]);

		if (!button) {
			console.log('Button not found');
			return interaction.deferReply().then(() => interaction.deleteReply());
		}

		const guildDB = await GuildRepo.findOrCreate(interaction.guild);

		const queue = client.distube.getQueue(interaction.guild);

		if (!queue) return;

		button.execute({ client, interaction, guildDB, queue });
	} catch (err) {
		consoleError('INTERACTION:BUTTON', err);
	}
}
