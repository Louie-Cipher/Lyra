import { DataSource } from 'typeorm';
import { consoleError, consoleLog } from 'utils/log';
import {
	UserEntity,
	GuildEntity,
	GuildConfigEntity,
	DJRoleEntity,
	FavoriteSongEntity,
	PlayingMessageEntity,
} from './entities';

export const DB = new DataSource({
	type: 'postgres',
	port: 5432,
	host: 'postgres',
	database: process.env.POSTGRES_DB,
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	synchronize: true,
	subscribers: [],
	migrations: [],
	entities: [
		UserEntity,
		GuildEntity,
		GuildConfigEntity,
		DJRoleEntity,
		PlayingMessageEntity,
		FavoriteSongEntity,
	],
});

export const initDB = async () =>
	await DB.initialize()
		.then(async () => consoleLog('DATABASE', 'Conectado ao 🏧 de 🎲'))
		.catch((err) => {
			consoleError('TEST', process.env);
			consoleError('DATABASE', '❌🎲 | ', err);
		});
