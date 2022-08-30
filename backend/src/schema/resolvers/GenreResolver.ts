import { Op, Sequelize } from 'sequelize'
import ArtistGenre from '../../database/models/ArtistGenre.model'
import Artist from '../../database/models/Artist.model'
import {
  IFindGenresLikeArgs,
  IGetArtistsFromGenreArgs
} from './interfaces/Genres'
import Genre from '../../database/models/Genre.model'

export default {
  Query: {
    async getGenres() {
      const results = await Genre.findAll({
        attributes: [
          'id',
          'name',
          [
            Sequelize.fn('COUNT', Sequelize.col('artistGenres.artist_id')),
            'numArtists'
          ]
        ],
        group: ['name', 'id'],
        order: [
          [
            Sequelize.fn('COUNT', Sequelize.col('artistGenres.artist_id')),
            'DESC'
          ]
        ],
        include: {
          model: ArtistGenre,
          attributes: []
        }
      }).catch((err) => console.error(err))

      const genres = JSON.parse(JSON.stringify(results))

      for (let i = 0; i < genres.length; i++) {
        genres[i].rank = i + 1
      }
      return genres
    },
    async getArtistsFromGenre(_parent, args: IGetArtistsFromGenreArgs) {
      const { genreId } = args
      const results = await Artist.findAll({
        include: [
          {
            model: ArtistGenre,
            include: [
              {
                model: Genre,
                where: {
                  id: genreId
                },
                required: true
              }
            ],
            required: true
          }
        ]
      }).catch((err) => console.error(err))
      const artists = JSON.parse(JSON.stringify(results))

      if (artists.length > 0) {
        return artists
      } else {
        throw new Error('No artists found matching provided genre')
      }
    },
    async findGenresLike(_parent, args: IFindGenresLikeArgs) {
      const { searchQuery } = args
      let results = await Genre.findAll({
        limit: 25,
        where: {
          name: {
            [Op.iLike]: `%${searchQuery}%`
          }
        }
      }).catch((err) => console.error(err))
      results = JSON.parse(JSON.stringify(results))
      return results
    }
  }
}
