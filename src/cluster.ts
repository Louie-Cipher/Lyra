import 'dotenv/config';
import { Manager } from 'discord-hybrid-sharding';
import { consoleLog } from 'utils/log';

const path = `${__dirname}/index.${process.env.NODE_ENV === 'dev' ? 'ts' : 'js'}`;

const Cluster = new Manager(path, {
	token: process.env.BOT_TOKEN,
	totalShards: process.env.NODE_ENV === 'dev' ? 1 : 'auto',
	shardsPerClusters: 2,
	mode: 'process',
});

export default Cluster;

Cluster.on('clusterCreate', (c) =>
	consoleLog(`[CLUSTER]`, `Cluster ${c.id} has been created`)
)
	.spawn()
	.then(() => consoleLog('[CLUSTER]', 'Spawned all clusters'));
