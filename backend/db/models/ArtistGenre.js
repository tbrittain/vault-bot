const { Sequelize } = require('sequelize')
const db = require('../db')
const Artist = require('./Artist')

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

ArtistGenre.belongsTo(Artist)

module.exports = ArtistGenre
