import SoundCloudPlugin from '@distube/soundcloud';
import SpotifyPlugin from '@distube/spotify';
import LyraClient from 'classes/Client';

export default new LyraClient({
	intents: 98303,
	distubeOptions: {
		leaveOnStop: true,
		leaveOnEmpty: true,
		emitNewSongOnly: true,
		emitAddSongWhenCreatingQueue: false,
		emitAddListWhenCreatingQueue: false,
		emptyCooldown: 120,
		plugins: [
			new SpotifyPlugin({ emitEventsAfterFetching: true }),
			new SoundCloudPlugin(),
		],
	},
});
