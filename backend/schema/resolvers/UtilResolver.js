const path = require('path')
const fs = require('fs')
const { Sequelize } = require('sequelize')
const DynamicSong = require('../../db/models/DynamicSong')
const ArchiveSong = require('../../db/models/ArchiveSong')
const Song = require('../../db/models/Song')
const Artist = require('../../db/models/Artist')
const ArtistGenre = require('../../db/models/ArtistGenre')

module.exports = {
  Query: {
    async getCurrentOverallStats (parent, args, context, info) {
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
    async getChangeLogPosts (parent, args, context, info) {
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
    async totalNumTracks (parent, args) {
      let result = await Song.findAll({
        attributes: [
          [Sequelize.fn('count', Sequelize.col('id')), 'totalNumTracks']
        ]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      const now = new Date()
      console.log(now)
      return result[0].totalNumTracks
    },
    async archiveNumTracks (parent, args) {
      let result = await ArchiveSong.findAll({
        attributes: [
          [Sequelize.fn('count', Sequelize.col('song_id')), 'archiveNumTracks']
        ]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result[0].archiveNumTracks
    },
    async totalNumArtists (parent, args) {
      let result = await Artist.findAll({
        attributes: [
          [Sequelize.fn('count', Sequelize.col('id')), 'totalNumArtists']
        ]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result[0].totalNumArtists
    },
    async totalNumGenres (parent, args) {
      const result = await ArtistGenre.aggregate('genre', 'count', { distinct: true })
      return result
    }
  }
}
