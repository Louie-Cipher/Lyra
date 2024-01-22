import { DisTubeEvents } from 'distube';

export default class DistubeEvent<Key extends keyof DisTubeEvents> {
	constructor(
		public readonly name: Key,
		public readonly run: (...args: DisTubeEvents[Key]) => void
	) {}
}
