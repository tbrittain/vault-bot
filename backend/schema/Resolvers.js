const ArchiveSong = require('../db/models/ArchiveSong')
const Artist = require('../db/models/Artist')
const ArtistGenre = require('../db/models/ArtistGenre')
const DynamicSong = require('../db/models/DynamicSong')
const Song = require('../db/models/Song')
const { Op, Sequelize } = require('sequelize')
const { artistRank } = require('../db/utils/ArtistRank')
const { genreRank } = require('../db/utils/GenreRank')

const resolvers = {
  Query: {
    async getArtist (parent, args, context, info) {
      if (!args.id && !args.name) {
        throw new SyntaxError('Either an artist ID or artist name must be provided')
      }

      let condition

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
      })
        .catch(err => console.log(err))

      result = JSON.parse(JSON.stringify(result))
      console.log(result)
      return result
    },
    async getGenres (parent, args, context, info) {
      // FIXME: this query executes way more db queries than necessary
      const result = await ArtistGenre.findAll({
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
        .catch(err => console.log(err))
      result = JSON.parse(JSON.stringify(result))
      result = result.map(element => element.artist)
      return result
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
      return await artistRank(artistId)
    },
    async genres (parent, args) {
      const artistId = parent.id

      let result = await ArtistGenre.findAll({
        where: {
          artistId: artistId
        },
        attributes: ['genre']
      })
        .catch(err => console.log(err))

      result = JSON.parse(JSON.stringify(result))
      return result
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
        .catch(err => console.log(err))

      result = JSON.parse(JSON.stringify(result))
      return result[0]
    }
  },
  Genre: {
    async rank (parent, args) {
      const genreName = parent.genre
      return await genreRank(genreName)
    }
  }
}

module.exports = { resolvers }
