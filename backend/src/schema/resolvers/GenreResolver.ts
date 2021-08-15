import { Op, Sequelize } from 'sequelize'
import ArtistGenre from '../../db/models/ArtistGenre.model'
import Artist from '../../db/models/Artist.model'
import {
  GetArtistsFromGenreArgs,
  FindGenresLikeArgs
} from './interfaces/Genres'

export default {
  Query: {
    async getGenres() {
      const results = await ArtistGenre.findAll({
        attributes: [
          'genre',
          [Sequelize.fn('COUNT', Sequelize.col('genre')), 'numArtists']
        ],
        group: 'genre',
        order: [[Sequelize.fn('COUNT', Sequelize.col('genre')), 'DESC']]
      }).catch((err) => console.error(err))

      const genres = JSON.parse(JSON.stringify(results))

      for (let i = 0; i < genres.length; i++) {
        genres[i].rank = i + 1
      }
      return genres
    },
    async getArtistsFromGenre(_parent, args: GetArtistsFromGenreArgs) {
      const { genreName } = args
      const results = await Artist.findAll({
        include: {
          model: ArtistGenre,
          where: {
            genre: genreName
          }
        }
      }).catch((err) => console.error(err))
      const artists = JSON.parse(JSON.stringify(results))
      if (artists.length > 0) {
        return artists
      } else {
        throw new SyntaxError(
          `No artists found matching provided genre: ${escape(genreName)}`
        )
      }
    },
    async findGenresLike(_parent, args: FindGenresLikeArgs) {
      const { searchQuery } = args
      let results = await ArtistGenre.findAll({
        limit: 25,
        attributes: [[Sequelize.literal('DISTINCT genre'), 'genre']],
        where: {
          genre: {
            [Op.iLike]: `%${searchQuery}%`
          }
        }
      }).catch((err) => console.error(err))
      results = JSON.parse(JSON.stringify(results))
      return results
    }
  }
}
