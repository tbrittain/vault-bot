const { Sequelize } = require('sequelize')
const db = require('../db')

const HistTrack = db.define('historical-tracking', {
  updatedAt: {
    type: Sequelize.DATE
  },
  pdi: {
    type: Sequelize.DECIMAL
  },
  popularity: {
    type: Sequelize.DECIMAL
  },
  danceability: {
    type: Sequelize.DECIMAL
  },
  energy: {
    type: Sequelize.DECIMAL
  },
  valence: {
    type: Sequelize.DECIMAL
  },
  songLength: {
    type: Sequelize.DECIMAL
  },
  tempo: {
    type: Sequelize.DECIMAL
  },
  novelty: {
    type: Sequelize.DECIMAL
  }
}, {
  tableName: 'historical_tracking',
  timestamps: false,
  underscored: true
})

HistTrack.removeAttribute('id') // No default ID primary key

module.exports = HistTrack
