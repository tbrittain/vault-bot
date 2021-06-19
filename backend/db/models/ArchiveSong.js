const { Sequelize } = require('sequelize')
const db = require('../db')
const Song = require('./Song')

const ArchiveSong = db.define('archive-song', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  songId: {
    type: Sequelize.STRING
  },
  artistId: {
    type: Sequelize.STRING
  },
  addedBy: {
    type: Sequelize.STRING
  },
  addedAt: {
    type: Sequelize.DATE
  }
}, {
  tableName: 'archive',
  timestamps: false,
  underscored: true
})

ArchiveSong.belongsTo(Song, {
  foreignKey: 'songId',
  sourceKey: 'id'
})

module.exports = ArchiveSong
