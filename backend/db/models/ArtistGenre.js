const { Sequelize } = require('sequelize')
const db = require('../db')

const ArtistGenre = db.define('artist-genre', {
  artistId: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  genre: {
    type: Sequelize.STRING,
    primaryKey: true
  }
}, {
  tableName: 'artists_genres',
  timestamps: false,
  underscored: true
})

module.exports = ArtistGenre
