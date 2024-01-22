import { ClientEvents } from 'discord.js';

export default class Event<Key extends keyof ClientEvents> {
	constructor(
		public name: Key,
		public run: (...args: ClientEvents[Key]) => Promise<any>
	) {}
}
