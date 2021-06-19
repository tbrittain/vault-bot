const { Sequelize } = require('sequelize')
const db = require('../db')
const Artist = require('./Artist')

const Song = db.define('song', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  artistId: {
    type: Sequelize.STRING
  },
  name: {
    type: Sequelize.STRING
  },
  length: {
    type: Sequelize.DECIMAL
  },
  tempo: {
    type: Sequelize.DECIMAL
  },
  danceability: {
    type: Sequelize.DECIMAL
  },
  energy: {
    type: Sequelize.DECIMAL
  },
  loudness: {
    type: Sequelize.DECIMAL
  },
  acousticness: {
    type: Sequelize.DECIMAL
  },
  instrumentalness: {
    type: Sequelize.DECIMAL
  },
  liveness: {
    type: Sequelize.DECIMAL
  },
  valence: {
    type: Sequelize.DECIMAL
  },
  art: {
    type: Sequelize.STRING
  },
  previewUrl: {
    type: Sequelize.STRING
  },
  album: {
    type: Sequelize.STRING
  }
}, {
  tableName: 'songs',
  timestamps: false,
  underscored: true
})

Song.belongsTo(Artist)

module.exports = Song
