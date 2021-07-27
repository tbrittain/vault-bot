const { Op, Sequelize } = require('sequelize')
const ArtistGenre = require('../../db/models/ArtistGenre')
const Artist = require('../../db/models/Artist')

module.exports = {
  Query: {
    async getGenres (parent, args, context, info) {
      const result = await ArtistGenre.findAll({
        attributes: [
          'genre',
          [Sequelize.fn('COUNT', Sequelize.col('genre')), 'numArtists']
        ],
        group: 'genre',
        order: [
          [Sequelize.fn('COUNT', Sequelize.col('genre')), 'DESC']
        ]
      })
        .catch(err => console.error(err))

      const genres = JSON.parse(JSON.stringify(result))
      for (let i = 0; i < result.length; i++) {
        genres[i].rank = i + 1
      }
      return genres
    },
    async getArtistsFromGenre (parent, args, context, info) {
      const genreName = args.genreName
      let result = await ArtistGenre.findAll({
        where: {
          genre: genreName
        },
        include: [
          {
            model: Artist
          }
        ]
      })
        .catch(err => console.error(err))

      if (result.length > 0) {
        result = JSON.parse(JSON.stringify(result))
        result = result.map(element => element.artist)
      } else {
        throw new SyntaxError(`No artists found matching provided genre: ${escape(genreName)}`)
      }

      return result
    },
    async findGenresLike (parent, args, context, info) {
      const { searchQuery } = args
      let result = await ArtistGenre.findAll({
        limit: 25,
        attributes: [[Sequelize.literal('DISTINCT genre'), 'genre']],
        where: {
          genre: {
            [Op.iLike]: `%${searchQuery}%`
          }
        }
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    }
  }
}
