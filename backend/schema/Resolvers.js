const ArchiveSong = require('../db/models/ArchiveSong')
const Artist = require('../db/models/Artist')
const ArtistGenre = require('../db/models/ArtistGenre')
const DynamicSong = require('../db/models/DynamicSong')
const Song = require('../db/models/Song')
const { Op } = require('sequelize')

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
  }
}

module.exports = { resolvers }
