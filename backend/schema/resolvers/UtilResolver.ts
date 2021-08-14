import path from 'path'
import fs from 'fs'
import { Sequelize } from 'sequelize'
import DynamicSong from '../../db/models/DynamicSong.model'
import ArchiveSong from '../../db/models/ArchiveSong.model'
import Song from '../../db/models/Song.model'
import Artist from '../../db/models/Artist.model'
import ArtistGenre from '../../db/models/ArtistGenre.model'

export default {
  Query: {
    async getCurrentOverallStats () {
      let result = await DynamicSong.findAll({
        attributes: [
          [Sequelize.fn('count', Sequelize.col('song_id')), 'dynamicNumTracks']
        ]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      result = result[0]
      return result
    },
    async getChangeLogPosts () {
      const postsDirectory = path.join(__dirname, '../../changeLogPosts')
      const postNames = fs.readdirSync(postsDirectory, { withFileTypes: true })
        .filter(item => !item.isDirectory())
        .map(item => item.name)
      const changeLogPosts = []
      for (let i = 0; i < postNames.length; i++) {
        const post = postNames[i]
        const postDate = post.replace('.md', '')
        const postPath = path.join(__dirname, `../../changeLogPosts/${post}`)
        const postContent = fs.readFileSync(postPath, 'utf8')
        changeLogPosts.push({
          post: postContent,
          date: postDate
        })
      }
      return changeLogPosts
    }
  },
  CurrentOverallStats: {
    async totalNumTracks () {
      let result = await Song.findAll({
        attributes: [
          [Sequelize.fn('count', Sequelize.col('id')), 'totalNumTracks']
        ]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result[0].totalNumTracks
    },
    async archiveNumTracks () {
      let result = await ArchiveSong.findAll({
        attributes: [
          [Sequelize.fn('count', Sequelize.col('song_id')), 'archiveNumTracks']
        ]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result[0].archiveNumTracks
    },
    async totalNumArtists () {
      let result = await Artist.findAll({
        attributes: [
          [Sequelize.fn('count', Sequelize.col('id')), 'totalNumArtists']
        ]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result[0].totalNumArtists
    },
    async totalNumGenres () {
      const result = await ArtistGenre.aggregate('genre', 'count', { distinct: true })
      return result
    }
  }
}
