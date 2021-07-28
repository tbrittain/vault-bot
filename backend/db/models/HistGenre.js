const { Sequelize } = require('sequelize')
const db = require('../db')

const HistGenre = db.define('historical-genre', {
  updatedAt: {
    type: Sequelize.DATE,
    primaryKey: true
  },
  genre: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  count: {
    type: Sequelize.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'historical_genres',
  timestamps: false,
  underscored: true
})

module.exports = HistGenre
