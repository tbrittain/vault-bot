const ArchiveSong = require('../db/models/ArchiveSong')
const Artist = require('../db/models/Artist')
const ArtistGenre = require('../db/models/ArtistGenre')
const DynamicSong = require('../db/models/DynamicSong')
const Song = require('../db/models/Song')
const { Op, Sequelize } = require('sequelize')
const { artistRank } = require('../db/utils/ArtistRank')
const { genreRank } = require('../db/utils/GenreRank')
const { sequelize } = require('../db/models/Song')
const escape = require('escape-html')

// TODO: consider separating individual resolvers into their own files and merging them together
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

      if (result) {
        result = JSON.parse(JSON.stringify(result))
        return result
      } else {
        throw new SyntaxError('No results found for artist provided')
      }
    },
    async getGenres (parent, args, context, info) {
      // FIXME: this query executes way more db queries than necessary
      // when adding rank to each genre
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

      if (result.length > 0) {
        result = JSON.parse(JSON.stringify(result))
        result = result.map(element => element.artist)
      } else {
        throw new SyntaxError(`No artists found matching provided genre: ${escape(genreName)}`)
      }

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
    },
    async getTrack (parent, args, context, info) {
      const songId = args.id
      let result = await Song.findAll({
        where: {
          id: songId
        }
      })
        .catch(err => console.log(err))
      result = JSON.parse(JSON.stringify(result))[0]

      if (Object.keys(result).length > 0) {
        return result
      } else {
        throw new SyntaxError('Invalid song ID')
      }
    },
    async getAvgTrackDetails (panent, args, context, info) {
      // TODO: handle args.genre to filter averages by genre
      const avgSongAttributes = [
        [sequelize.fn('AVG', sequelize.col('acousticness')), 'acousticness'],
        [sequelize.fn('AVG', sequelize.col('danceability')), 'danceability'],
        [sequelize.fn('AVG', sequelize.col('energy')), 'energy'],
        [sequelize.fn('AVG', sequelize.col('instrumentalness')), 'instrumentalness'],
        [sequelize.fn('AVG', sequelize.col('length')), 'length'],
        [sequelize.fn('AVG', sequelize.col('liveness')), 'liveness'],
        [sequelize.fn('AVG', sequelize.col('loudness')), 'loudness'],
        [sequelize.fn('AVG', sequelize.col('tempo')), 'tempo'],
        [sequelize.fn('AVG', sequelize.col('valence')), 'valence']
      ]
      if (!args.genre) {
        let result = await Song.findAll({
          attributes: avgSongAttributes
        })
          .catch(err => console.log(err))
        result = JSON.parse(JSON.stringify(result))[0]
        return result
      } else {
        let result = await ArtistGenre.findAll({
          where: {
            genre: args.genre
          },
          include: {
            model: Artist,
            include: {
              model: Song
            }
          }
        })
        if (!result.length > 0) {
          throw new SyntaxError('No results found, are you sure you used a valid genre?')
        }
        result = JSON.parse(JSON.stringify(result))
        result = result.map(attribute => attribute.artist.songs)

        const average = (array) => array.reduce((a, b) => a + b) / array.length
        const length = []
        const tempo = []
        const danceability = []
        const energy = []
        const loudness = []
        const acousticness = []
        const instrumentalness = []
        const liveness = []
        const valence = []

        for (const artist of result) {
          for (const song of artist) {
            length.push(Number(song.length))
            tempo.push(Number(song.tempo))
            danceability.push(Number(song.danceability))
            energy.push(Number(song.energy))
            loudness.push(Number(song.loudness))
            acousticness.push(Number(song.acousticness))
            instrumentalness.push(Number(song.instrumentalness))
            liveness.push(Number(song.liveness))
            valence.push(Number(song.valence))
          }
        }

        const calculatedResult = {
          length: average(length),
          tempo: average(tempo),
          danceability: average(danceability),
          energy: average(energy),
          loudness: average(loudness),
          acousticness: average(acousticness),
          instrumentalness: average(instrumentalness),
          liveness: average(liveness),
          valence: average(valence)
        }

        return calculatedResult
      }
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
    async artist (parent, args) {
      const artistId = parent.artistId

      let result = await Artist.findOne({
        where: {
          id: artistId
        }
      })
        .catch(err => console.log(err))

      result = JSON.parse(JSON.stringify(result))
      return result
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
