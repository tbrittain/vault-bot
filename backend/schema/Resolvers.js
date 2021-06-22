const ArchiveSong = require('../db/models/ArchiveSong')
const Artist = require('../db/models/Artist')
const ArtistGenre = require('../db/models/ArtistGenre')
const DynamicSong = require('../db/models/DynamicSong')
const Song = require('../db/models/Song')
const { Op, Sequelize } = require('sequelize')
const { artistRank } = require('../db/utils/ArtistRank')
const { genreRank } = require('../db/utils/GenreRank')
const { sequelize } = require('../db/models/Song')

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
    },
    async getArchiveTracks (parent, args, context, info) {
      let startDate, endDate

      // argument validation
      if (args.startDate) {
        startDate = new Date(args.startDate)
        if (!(startDate instanceof Date && isFinite(startDate))) {
          throw new SyntaxError('Invalid startDate')
        }
      }
      if (args.endDate) {
        endDate = new Date(args.endDate)
        if (!(endDate instanceof Date && isFinite(endDate))) {
          throw new SyntaxError('Invalid endDate')
        }
      }

      if (startDate > endDate) {
        throw new SyntaxError('startDate must be earlier in time than endDate')
      }

      // construct condition based on dates provided
      let condition
      if (startDate && endDate) {
        condition = {
          addedAt: {
            [Op.between]: [startDate.toISOString(), endDate.toISOString()]
          }
        }
      } else if (startDate && !endDate) {
        condition = {
          addedAt: {
            [Op.gte]: startDate.toISOString()
          }
        }
      } else if (!startDate && endDate) {
        condition = {
          addedAt: {
            [Op.lte]: endDate.toISOString()
          }
        }
      }

      let result
      if (condition) {
        result = await ArchiveSong.findAll({
          where: condition,
          include: [
            {
              model: Song
            }
          ]
        })
          .catch(err => console.log(err))
      } else {
        result = await ArchiveSong.findAll({
          include: [
            {
              model: Song
            }
          ]
        })
      }
      result = JSON.parse(JSON.stringify(result))

      // TODO: can filter songs by characteristics here
      // TODO: may also want to consider filtering by genre?
      // TODO: could also resolve SongDetails with the info retrieved here
      result = result.map(song => {
        return {
          id: song.song.id,
          artistId: song.song.artistId,
          name: song.song.name,
          album: song.song.album,
          art: song.song.art,
          previewUrl: song.song.previewUrl,
          addedBy: song.addedBy,
          addedAt: song.addedAt
        }
      })
      return result
    },
    async getDynamicTracks (parent, args, context, info) {
      let result = await DynamicSong.findAll({
        include: [
          {
            model: Song
          }
        ]
      })
      result = JSON.parse(JSON.stringify(result))
      result = result.map(song => {
        return {
          id: song.song.id,
          artistId: song.song.artistId,
          name: song.song.name,
          album: song.song.album,
          art: song.song.art,
          previewUrl: song.song.previewUrl,
          addedBy: song.addedBy,
          addedAt: song.addedAt
        }
      })
      return result
    },
    async getCurrentOverallStats (parent, args, context, info) {
      let result = await DynamicSong.findAll({
        attributes: [
          [sequelize.fn('count', sequelize.col('song_id')), 'dynamicNumTracks']
        ]
      })
        .catch(err => console.log(err))
      result = JSON.parse(JSON.stringify(result))
      result = result[0]
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
    },
    async artistName (parent, args) {
      const artistId = parent.artistId

      let result = await Artist.findOne({
        where: {
          id: artistId
        },
        attributes: [
          ['name', 'artistName']
        ]
      })
        .catch(err => console.log(err))

      result = JSON.parse(JSON.stringify(result))
      return result.artistName
    }
  },
  Genre: {
    async rank (parent, args) {
      const genreName = parent.genre
      return await genreRank(genreName)
    }
  },
  CurrentOverallStats: {
    async totalNumTracks (parent, args) {
      let result = await Song.findAll({
        attributes: [
          [sequelize.fn('count', sequelize.col('id')), 'totalNumTracks']
        ]
      })
        .catch(err => console.log(err))
      result = JSON.parse(JSON.stringify(result))
      return result[0].totalNumTracks
    },
    async archiveNumTracks (parent, args) {
      let result = await ArchiveSong.findAll({
        attributes: [
          [sequelize.fn('count', sequelize.col('song_id')), 'archiveNumTracks']
        ]
      })
        .catch(err => console.log(err))
      result = JSON.parse(JSON.stringify(result))
      return result[0].archiveNumTracks
    },
    async totalNumArtists (parent, args) {
      let result = await Artist.findAll({
        attributes: [
          [sequelize.fn('count', sequelize.col('id')), 'totalNumArtists']
        ]
      })
        .catch(err => console.log(err))
      result = JSON.parse(JSON.stringify(result))
      return result[0].totalNumArtists
    },
    async totalNumGenres (parent, args) {
      const result = await ArtistGenre.aggregate('genre', 'count', { distinct: true })
      return result
    }
  }
}

module.exports = { resolvers }
