import {
	Entity,
	Column,
	PrimaryColumn,
	CreateDateColumn,
	UpdateDateColumn,
	BaseEntity,
	OneToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	OneToOne,
	Relation,
	JoinColumn,
} from 'typeorm';

class TimestampedEntity extends BaseEntity {
	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}

@Entity({ name: 'user' })
export class UserEntity extends TimestampedEntity {
	@PrimaryColumn({ type: 'varchar', length: 32 })
	id: string;

	@Column({ type: 'varchar', length: 128 })
	username: string;

	@Column({ type: 'varchar', length: 6, default: 'pt-BR' })
	language: string;

	@Column({ type: 'boolean', default: false })
	premium: boolean;

	@OneToMany(() => FavoriteSongEntity, (favoriteSong) => favoriteSong.user)
	favoriteSongs: Relation<FavoriteSongEntity>[];

	@Column({ type: 'timestamp', nullable: true })
	lastTopggVote: Date;

	@Column({ type: 'timestamp', nullable: true })
	lastMessage: Date;

	@Column({ type: 'timestamp', nullable: true })
	lastCommand: Date;
}

@Entity({ name: 'guild' })
export class GuildEntity extends TimestampedEntity {
	@PrimaryColumn({ type: 'varchar', length: 32 })
	id: string;

	@Column({ type: 'varchar', length: 128, nullable: false })
	name: string;

	@Column({ type: 'varchar', length: 32, nullable: true })
	ownerId: string;

	@Column({ type: 'varchar', length: 8, default: 'pt-BR' })
	language: string;

	@Column({ type: 'boolean', default: false })
	premium: boolean;

	@OneToOne(() => GuildConfigEntity, (config) => config.guild, { eager: true })
	@JoinColumn()
	config: Relation<GuildConfigEntity>;

	@OneToOne(() => PlayingMessageEntity, (playingMessage) => playingMessage.guild, {
		// eager: true,
		nullable: true,
	})
	@JoinColumn()
	playingMessage: Relation<PlayingMessageEntity>;

	@OneToMany(() => DJRoleEntity, (djRole) => djRole.guild)
	djRoles: Relation<DJRoleEntity>[];

	@Column({ type: 'timestamp', nullable: true })
	lastPlayed: Date;

	@Column({ type: 'boolean', default: false })
	deleted: boolean;
}

@Entity({ name: 'djRole' })
export class DJRoleEntity extends TimestampedEntity {
	@PrimaryColumn({ type: 'varchar', length: 32 })
	roleId: string;

	@ManyToOne(() => GuildEntity, (guild) => guild, { onDelete: 'CASCADE' })
	guild: Relation<GuildEntity>;
}

@Entity({ name: 'guildConfig' })
export class GuildConfigEntity extends BaseEntity {
	@PrimaryColumn({ type: 'varchar', length: 32 })
	guildId: string;

	@OneToOne(() => GuildEntity, (guild) => guild, { onDelete: 'CASCADE' })
	guild: Relation<GuildEntity>;

	@Column({ type: 'boolean', default: true })
	everyonePause: boolean; // If false, requires DJ role / mute members permission

	@Column({ type: 'boolean', default: false })
	everyoneSkip: boolean; // If false, requires DJ role / mute members permission

	@Column({ type: 'boolean', default: false })
	everyoneStop: boolean; // If false, requires DJ role / mute members permission

	@Column({ type: 'boolean', default: false })
	nsfw: boolean; // If false, blocks YouTube/Spotify age-restricted content

	@Column({ type: 'boolean', default: false })
	allowExternal: boolean; // If false, block external fonts (not YouTube/Spotify)

	@Column({ type: 'boolean', default: true })
	autoplay: boolean; // If autoplay is enabled by default

	@Column({ type: 'smallint', default: 120 })
	emptyCooldown: number; // In seconds

	@Column({ type: 'smallint', default: 50 })
	volume: number; // 0 - 100
}

@Entity({ name: 'favoriteSong' })
export class FavoriteSongEntity extends TimestampedEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, (user) => user, { onDelete: 'CASCADE' })
	user: Relation<UserEntity>;

	@Column({ type: 'varchar', length: 64 })
	trackId: string;
}

@Entity({ name: 'playingMessage' })
export class PlayingMessageEntity extends TimestampedEntity {
	@PrimaryColumn({ type: 'varchar', length: 32 })
	messageId: string;

	@Column({ type: 'varchar', length: 32 })
	channelId: string;

	@OneToOne(() => PlayingMessageEntity, (playingMessage) => playingMessage)
	guild: Relation<GuildEntity>;

	@Column({ type: 'smallint', nullable: true })
	skipVotesRequired: number;

	@Column({ type: 'varchar', length: 32, array: true, nullable: true })
	skipVoteUsers: string[];

	@Column({ type: 'smallint', nullable: true })
	previousVotesRequired: number;

	@Column({ type: 'varchar', length: 32, array: true, nullable: true })
	previousVoteUsers: string[];

	@Column({ type: 'smallint', nullable: true })
	stopVotesRequired: number;

	@Column({ type: 'varchar', length: 32, array: true, nullable: true })
	stopVoteUsers: string[];
}
