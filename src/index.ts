import 'dotenv/config';
import { consoleError } from 'utils/log';
import client from 'client';

client.start();

process
	.on('unhandledRejection', (reason, err) =>
		consoleError('UNHANDLED_REJECTION', 'reason: ', reason, '\n', err)
	)
	.on('uncaughtException', (err, origin) =>
		consoleError('UNCAUGHT_EXCEPTION | Origin: ', origin, '\n', err)
	);
