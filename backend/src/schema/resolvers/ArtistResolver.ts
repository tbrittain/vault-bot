import ArtistGenre from '../../database/models/ArtistGenre.model'
import Song from '../../database/models/Song.model'
import Artist from '../../database/models/Artist.model'
import { Op } from 'sequelize'
import {
  IArtistGenresParent,
  IArtistInfo,
  IArtistSongsParent,
  IArtistWikiBioParent,
  IFindArtistsLikeArgs
} from './interfaces/Artists'
import { getArtistBio } from '../../utils/WikipediaSearch'

export default {
  Query: {
    async getArtist(_parent, args: IArtistInfo) {
      if (!args.id && !args.name) {
        throw new Error(
          'Either an artist ID or artist name must be provided'
        )
      }

      let condition: { id?: string; name?: string }

      if (args.id) {
        const artistId = args.id
        condition = {
          id: artistId
        }
      } else if (args.name) {
        const artistName = args.name
        condition = {
          name: artistName
        }
      }

      let result = await Artist.findOne({
        where: condition
      }).catch((err) => console.error(err))

      if (result != null) {
        result = JSON.parse(JSON.stringify(result))
        return result
      } else {
        throw new Error('No results found for artist provided')
      }
    },
    async getFeaturedArtist() {
      let result = await Artist.findOne({
        where: {
          featured: {
            [Op.not]: null
          }
        },
        order: [['featured', 'desc']]
      }).catch((err) => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async getArtists() {
      let result = await Artist.findAll({
        order: [['name', 'asc']]
      }).catch((err) => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async findArtistsLike(_parent, args: IFindArtistsLikeArgs) {
      const { searchQuery } = args
      let result = await Artist.findAll({
        limit: 25,
        where: {
          name: {
            [Op.iLike]: `%${searchQuery}%`
          }
        }
      }).catch((err) => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    }
  },
  Artist: {
    async songs(parent: IArtistSongsParent) {
      const artistId = parent.id

      let result = await Song.findAll({
        include: [
          {
            model: Artist,
            where: {
              id: artistId
            },
          }
        ]
      })
        .then((data) => {
          console.log(data)
          return data
        })
        .catch((err) => console.error(err))

      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async genres(parent: IArtistGenresParent) {
      const artistId = parent.id

      let result = await ArtistGenre.findAll({
        where: {
          artistId: artistId
        },
        attributes: ['genre']
      }).catch((err) => console.error(err))

      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async wikiBio(parent: IArtistWikiBioParent) {
      const originalArtistName = String(parent.name)
      return await getArtistBio(originalArtistName)
    }
  }
}
