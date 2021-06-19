const { Sequelize } = require('sequelize')
const db = require('../db')

const Artist = db.define('artist', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  },
  art: {
    type: Sequelize.STRING
  }
}, {
  tableName: 'artists',
  timestamps: false
})

module.exports = Artist
