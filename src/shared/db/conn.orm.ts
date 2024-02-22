import dotenv from 'dotenv';
import { MikroORM } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

dotenv.config();

export const orm = await MikroORM.init({
	entities: ['dist/**/*.entity.js'],
	entitiesTs: ['src/**/*.entity.ts'],
	dbName: process.env.DB_NAME,
	clientUrl: process.env.DB_HOST,
	password: process.env.DB_PSW,
	highlighter: new SqlHighlighter(),
	debug: true,
	driver: MySqlDriver,
});

export const syncSchema = async () => {
	const generator = orm.getSchemaGenerator();
	await generator.updateSchema();
};
