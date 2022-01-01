import Song from '../../db/models/Song.model'
import ArchiveSong from '../../db/models/ArchiveSong.model'
import Artist from '../../db/models/Artist.model'
import { Op, Sequelize } from 'sequelize'
import {
  FindTracksLikeArgs,
  GetArchiveTracksArgs,
  GetSimilarTracksArgs,
  GetTrackArgs,
  GetTracksFromAlbumArgs,
  SongArtist,
  SongDetails
} from './interfaces/Songs'
import { getSimilarSongs } from '../../db/utils/SongSimilarity'

export default {
  Query: {
    async getTrack(_parent, args: GetTrackArgs) {
      const { id } = args
      let result = await Song.findAll({
        where: {
          id: id
        }
      }).catch((err) => console.error(err))
      result = JSON.parse(JSON.stringify(result))[0]

      return result
    },
    async getTracks() {
      let result = await Song.findAll({
        order: [['name', 'asc']]
      }).catch((err) => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async getTracksFromAlbum(_parent, args: GetTracksFromAlbumArgs) {
      const { album, artistId } = args
      let result = await Song.findAll({
        where: {
          album: album,
          artistId: artistId
        }
      }).catch((err) => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async findTracksLike(_parent, args: FindTracksLikeArgs) {
      const { searchQuery } = args
      let result = await Song.findAll({
        limit: 25,
        where: {
          name: {
            [Op.iLike]: `%${searchQuery}%`
          }
        }
      }).catch((err) => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async getArchiveTracks(_parent, args: GetArchiveTracksArgs) {
      let startDate: Date, endDate: Date

      // argument validation
      if (args.startDate) {
        startDate = new Date(args.startDate)
        if (!(startDate instanceof Date && !isNaN(startDate.getTime()))) {
          throw new SyntaxError('Invalid startDate')
        }
      }
      if (args.endDate) {
        endDate = new Date(args.endDate)
        if (!(endDate instanceof Date && !isNaN(endDate.getTime()))) {
          throw new SyntaxError('Invalid endDate')
        }
      }

      if (startDate > endDate) {
        throw new SyntaxError('startDate must be earlier in time than endDate')
      }

      // construct condition based on dates provided
      let condition: {
        addedAt:
          | { [Op.between]: string[] }
          | { [Op.gte]: string }
          | { [Op.lte]: string }
      }
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

      let result: void | ArchiveSong[]
      if (condition) {
        result = await ArchiveSong.findAll({
          where: condition,
          include: [
            {
              model: Song
            }
          ]
        }).catch((err) => console.error(err))
      } else {
        result = await ArchiveSong.findAll({
          include: [
            {
              model: Song
            }
          ]
        })
      }
      let songs = JSON.parse(JSON.stringify(result))

      songs = songs.map((song) => {
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
      return songs
    },
    async getAvgTrackDetails() {
      let result = await Song.findAll({
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('acousticness')), 'acousticness'],
          [Sequelize.fn('AVG', Sequelize.col('danceability')), 'danceability'],
          [Sequelize.fn('AVG', Sequelize.col('energy')), 'energy'],
          [
            Sequelize.fn('AVG', Sequelize.col('instrumentalness')),
            'instrumentalness'
          ],
          [Sequelize.fn('AVG', Sequelize.col('length')), 'length'],
          [Sequelize.fn('AVG', Sequelize.col('liveness')), 'liveness'],
          [Sequelize.fn('AVG', Sequelize.col('loudness')), 'loudness'],
          [Sequelize.fn('AVG', Sequelize.col('tempo')), 'tempo'],
          [Sequelize.fn('AVG', Sequelize.col('valence')), 'valence']
        ]
      }).catch((err) => console.error(err))
      result = JSON.parse(JSON.stringify(result))[0]
      return result
    },
    async getSimilarTracks(_parent, args: GetSimilarTracksArgs) {
      let { id, limit } = args
      if (typeof limit !== 'number') {
        limit = 10
      }

      if (limit < 1 || limit > 100) {
        throw new SyntaxError('limit must be between 1 and 100')
      }

      return await getSimilarSongs(id, limit)
    }
  },
  Song: {
    async details(parent: SongDetails) {
      return {
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
    },
    async artist(parent: SongArtist) {
      const { artistId } = parent
      let result = await Artist.findOne({
        where: {
          id: artistId
        }
      }).catch((err) => console.error(err))

      result = JSON.parse(JSON.stringify(result))
      return result
    }
  }
}
