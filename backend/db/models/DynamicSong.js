const { Sequelize } = require('sequelize')
const db = require('../db')
const Song = require('./Song')

const DynamicSong = db.define('dynamic-song', {
  songId: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  artistId: {
    type: Sequelize.STRING
  },
  addedBy: {
    type: Sequelize.STRING
  },
  addedAt: {
    type: Sequelize.DATE
  },
  popularity: {
    type: Sequelize.INTEGER
  }
}, {
  tableName: 'dynamic',
  timestamps: false,
  underscored: true
})

DynamicSong.belongsTo(Song)

module.exports = DynamicSong
