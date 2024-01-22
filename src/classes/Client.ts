import { Client, Collection } from 'discord.js';
import { DisTubeOptions } from 'distube';
import DisTube from 'distube';
import { consoleLog } from 'utils/log';
import { loadButtons, loadCommands, loadEvents } from 'utils/loader';
import { initDB } from 'db';
import { ButtonEventType } from 'types/ButtonEvent';
import { CommandType } from 'types/Command';
import { Cluster as ClusterClient } from 'discord-hybrid-sharding';

interface ClientOptions {
	intents: number;
	distubeOptions: DisTubeOptions;
}

export default class LyraClient extends Client {
	constructor({ intents, distubeOptions }: ClientOptions) {
		super({ intents, shards: 'auto' });

		this.distube = new DisTube(this, distubeOptions);
	}

	public cluster: ClusterClient;
	public distube: DisTube;
	public commands: Collection<string, CommandType>;
	public buttons: Collection<string, ButtonEventType>;

	public async start() {
		consoleLog('STARTUP', 'Starting up');
		await initDB();
		this.commands = await loadCommands();
		this.buttons = await loadButtons();
		await loadEvents(this);
		await this.login(process.env.BOT_TOKEN);
	}
}
