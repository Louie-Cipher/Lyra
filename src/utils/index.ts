import {
	BaseGuildVoiceChannel,
	GuildMember,
	Interaction,
	PermissionFlagsBits,
} from 'discord.js';
import { Queue } from 'distube';
import { GuildEntity } from 'db/entities';

const d = (num: number): String => (num < 10 ? `0${num}` : `${num}`);

export const DateTime = (date: Date): string =>
	`${d(date.getDate())}/${d(date.getMonth() + 1)} ` +
	`${d(date.getHours())}:${d(date.getMinutes())}:${d(date.getSeconds())}`;

export const InteractionMember = (interaction: Interaction): GuildMember =>
	interaction.guild?.members.cache.get(interaction.user.id) ||
	(interaction.member as GuildMember);

export const CanSendMsg = (queue: Queue): Boolean =>
	queue.textChannel &&
	queue.textChannel.guild.available &&
	queue.textChannel
		.permissionsFor(queue.textChannel.guild.members.me)
		.has(PermissionFlagsBits.SendMessages);

export const HumanMembers = (channel: BaseGuildVoiceChannel) =>
	channel.members.filter((member) => !member.user.bot).size;

export const HasDJRole = (member: GuildMember, guildDB: GuildEntity): boolean => {
	if (member.permissions.has(PermissionFlagsBits.MuteMembers)) return true;
	if (HumanMembers(member.voice.channel) === 1) return true;

	const djRoles = guildDB.djRoles;

	if (!djRoles || djRoles.length === 0) return false;

	return djRoles.some((djRole) => member.roles.cache.has(djRole.roleId));
};
