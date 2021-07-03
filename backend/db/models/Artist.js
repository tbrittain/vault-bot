const { Sequelize } = require('sequelize')
const db = require('../db')
const ArchiveSong = require('./ArchiveSong')
const DynamicSong = require('./DynamicSong')
const Song = require('./Song')

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
  timestamps: false,
  underscored: true
})

Artist.hasMany(Song)
Artist.hasMany(DynamicSong)
Artist.hasMany(ArchiveSong)

module.exports = Artist
