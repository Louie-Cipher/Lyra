import { consoleError } from './log';
import { initDB } from '../db';
import { loadCommands, loadEvents } from './loader';
import LyraClient from 'classes/Client';

export async function init(client: LyraClient) {
	try {
		await initDB();

		await loadCommands();
		loadEvents(client);
		await client.login(process.env.BOT_TOKEN);
	} catch (err) {
		consoleError('INIT', err);
	}
}
