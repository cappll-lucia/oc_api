import dotenv from 'dotenv';
import { MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'

dotenv.config();

export const orm = await MikroORM.init({
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    dbName: process.env.DB_NAME,
    clientUrl:`mysql://${process.env.DB_USER}:${process.env.DB_USER}@localhost:3306/${process.env.DB_NAME}`,
    password: process.env.DB_PSW,
    highlighter: new SqlHighlighter(),
    debug: true,
    driver: MySqlDriver,
    schemaGenerator: {   // NEVER IN PRODUCTION
        disableForeignKeys: true,
        createForeignKeyConstraints: true,
        ignoreSchema: [],
    },
})

export const syncSchema = async () => {
    const generator = orm.getSchemaGenerator()
    await generator.updateSchema()
}