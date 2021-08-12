import { Sequelize } from 'sequelize-typescript';

export const db = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  dialect: 'postgres',
  models: [__dirname + '/models']
})

