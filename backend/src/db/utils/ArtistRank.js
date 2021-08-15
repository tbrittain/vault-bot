const ArchiveSong = require('../models/ArchiveSong')
const { Sequelize } = require('sequelize')

const artistRank = async (artistId) => {
  let artists = await ArchiveSong.findAll({
    attributes: [
      'artistId',
      [Sequelize.fn('COUNT', Sequelize.col('artist_id')), 'n_artistId']
    ],
    group: 'artistId',
    order: [[Sequelize.fn('COUNT', Sequelize.col('artist_id')), 'DESC']]
  }).catch((err) => console.log(err))

  artists = JSON.parse(JSON.stringify(artists))
  const index = artists.findIndex((artist) => {
    return artist.artistId === artistId
  })
  return index + 1
}

module.exports = { artistRank }
