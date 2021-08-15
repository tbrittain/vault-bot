const ArtistGenre = require('../models/ArtistGenre')
const { Sequelize } = require('sequelize')

const genreRank = async (genreName) => {
  let genres = await ArtistGenre.findAll({
    attributes: [
      'genre',
      [Sequelize.fn('COUNT', Sequelize.col('genre')), 'n_genre']
    ],
    group: 'genre',
    order: [
      [Sequelize.fn('COUNT', Sequelize.col('genre')), 'DESC']
    ]
  })
    .catch(err => console.log(err))

  genres = JSON.parse(JSON.stringify(genres))
  const index = genres.findIndex(genre => {
    return genre.genre === genreName
  })
  return index + 1
}

module.exports = { genreRank }
