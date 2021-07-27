const Song = require('../../db/models/Song')
const ArchiveSong = require('../../db/models/ArchiveSong')
const ArtistGenre = require('../../db/models/ArtistGenre')
const Artist = require('../../db/models/Artist')
const { Sequelize, Op } = require('sequelize')

module.exports = {
  Query: {
    async getTrack (parent, args, context, info) {
      const songId = args.id
      let result = await Song.findAll({
        where: {
          id: songId
        }
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))[0]

      return result
    },
    async getTracks (parent, args, context, info) {
      let result = await Song.findAll({
        order: [['name', 'asc']]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async getSongsFromAlbum (parent, args, context, info) {
      const album = args.album
      const artistId = args.artistId
      let result = await Song.findAll({
        where: {
          album: album,
          artistId: artistId
        }
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async findTracksLike (parent, args, context, info) {
      let { searchQuery } = args
      searchQuery = escape(searchQuery)
      let result = await Song.findAll({
        limit: 25,
        where: {
          name: {
            [Op.iLike]: `%${searchQuery}%`
          }
        }
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
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
          .catch(err => console.error(err))
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
    async getAvgTrackDetails (panent, args, context, info) {
      const genre = args.genre
      const avgSongAttributes = [
        [Sequelize.fn('AVG', Sequelize.col('acousticness')), 'acousticness'],
        [Sequelize.fn('AVG', Sequelize.col('danceability')), 'danceability'],
        [Sequelize.fn('AVG', Sequelize.col('energy')), 'energy'],
        [Sequelize.fn('AVG', Sequelize.col('instrumentalness')), 'instrumentalness'],
        [Sequelize.fn('AVG', Sequelize.col('length')), 'length'],
        [Sequelize.fn('AVG', Sequelize.col('liveness')), 'liveness'],
        [Sequelize.fn('AVG', Sequelize.col('loudness')), 'loudness'],
        [Sequelize.fn('AVG', Sequelize.col('tempo')), 'tempo'],
        [Sequelize.fn('AVG', Sequelize.col('valence')), 'valence']
      ]
      if (!args.genre) {
        let result = await Song.findAll({
          attributes: avgSongAttributes
        })
          .catch(err => console.error(err))
        result = JSON.parse(JSON.stringify(result))[0]
        return result
      } else {
        let result = await ArtistGenre.findAll({
          where: {
            genre: genre
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
  Song: {
    async details (parent, args) {
      const details = {
        length: parent.length,
        tempo: parent.tempo,
        danceability: parent.danceability,
        energy: parent.energy,
        loudness: parent.loudness,
        acousticness: parent.acousticness,
        instrumentalness: parent.instrumentalness,
        liveness: parent.liveness,
        valence: parent.valence
      }
      return details
    },
    async artist (parent, args) {
      const artistId = parent.artistId

      let result = await Artist.findOne({
        where: {
          id: artistId
        }
      })
        .catch(err => console.error(err))

      result = JSON.parse(JSON.stringify(result))
      return result
    }
  }
}
