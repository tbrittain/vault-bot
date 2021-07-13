const path = require('path')
require('dotenv').config(
  { path: path.join(__dirname, '/../.env') }
) // for use in non-docker development

// TODO: implement https://www.npmjs.com/package/@google-cloud/secret-manager

const { Sequelize } = require('sequelize')

module.exports = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
)
