const ArchiveSong = require('../db/models/ArchiveSong')
const Artist = require('../db/models/Artist')
const ArtistGenre = require('../db/models/ArtistGenre')
const DynamicSong = require('../db/models/DynamicSong')
const Song = require('../db/models/Song')
const { Op } = require('sequelize')
const { rank } = require('../db/utils/ArtistRank')

const resolvers = {
  Query: {
    async getArtist (parent, args, context, info) {
      const artistId = args.id

      let result = await Artist.findAll({
        where: {
          id: artistId
        }
      })
        .then(data => {
          return data
        })
        .catch(err => console.log(err))

      result = JSON.parse(JSON.stringify(result))
      return result[0]
    }
  },
  Artist: {
    async songs (parent, args) {
      const artistId = parent.id

      let result = await Song.findAll({
        where: {
          artistId: artistId
        },
        attributes: [
          'id', 'artistId', 'name',
          'album', 'art', 'previewUrl'
        ]
      })
        .then(data => {
          return data
        })
        .catch(err => console.log(err))

      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async rank (parent, args) {
      const artistId = parent.id
      return await rank(artistId)
    }
  },
  Song: {
    async details (parent, args) {
      const songId = parent.id

      let result = await Song.findAll({
        where: {
          id: songId
        },
        attributes: [
          'length', 'tempo', 'danceability', 'energy',
          'loudness', 'acousticness', 'instrumentalness',
          'liveness', 'valence'
        ]
      })
        .then(data => {
          return data
        })
        .catch(err => console.log(err))

      result = JSON.parse(JSON.stringify(result))
      return result[0]
    }
  }
}

module.exports = { resolvers }
