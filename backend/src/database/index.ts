import { Sequelize } from 'sequelize-typescript'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config({ path: path.join(__dirname, '../../.env') })
}

const sequelize = new Sequelize({
	database: process.env.DB_NAME,
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	host: process.env.DB_HOST,
	dialect: 'postgres',
	models: [__dirname + '/models/*.model.*'],
	modelMatch: (filename, member) => {
		return (
			filename.substring(0, filename.indexOf('.model')) === member.toLowerCase()
		)
	}
})

export default sequelize
