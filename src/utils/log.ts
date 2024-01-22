import { gray, blue, red } from 'chalk';
import { DateTime } from '.';

const nowString = (): string => DateTime(new Date());

export const consoleLog = (origin: string, ...args: any[]) =>
	console.log(gray(nowString()), blue(`[${origin}]`), ...args);

export const consoleError = (origin: string, ...args: any[]) =>
	console.log(gray(nowString()), red(`[${origin}]`), ...args, '\n', '-'.repeat(50));

export const localTime = (date: Date): Date =>
	new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
