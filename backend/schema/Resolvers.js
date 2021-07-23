const ArchiveSong = require('../db/models/ArchiveSong')
const Artist = require('../db/models/Artist')
const ArtistGenre = require('../db/models/ArtistGenre')
const DynamicSong = require('../db/models/DynamicSong')
const Song = require('../db/models/Song')
const { Op, Sequelize } = require('sequelize')
const { sequelize } = require('../db/models/Song')
const escape = require('escape-html')
const axios = require('axios').default

// TODO: consider separating individual resolvers into their own files and merging them together
// https://www.graphql-tools.com/docs/introduction/
// https://stackoverflow.com/questions/52457345/how-to-seperate-schema-and-resolvers-and-merage-them-apollo-server-express
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
        .catch(err => console.error(err))

      if (result) {
        result = JSON.parse(JSON.stringify(result))
        return result
      } else {
        throw new SyntaxError('No results found for artist provided')
      }
    },
    async getGenres (parent, args, context, info) {
      const result = await ArtistGenre.findAll({
        attributes: [
          'genre',
          [Sequelize.fn('COUNT', Sequelize.col('genre')), 'numArtists']
        ],
        group: 'genre',
        order: [
          [Sequelize.fn('COUNT', Sequelize.col('genre')), 'DESC']
        ]
      })
        .catch(err => console.error(err))

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
        .catch(err => console.error(err))

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
    async getCurrentOverallStats (parent, args, context, info) {
      let result = await DynamicSong.findAll({
        attributes: [
          [sequelize.fn('count', sequelize.col('song_id')), 'dynamicNumTracks']
        ]
      })
        .catch(err => console.error(err))
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
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))[0]

      return result
    },
    async getAvgTrackDetails (panent, args, context, info) {
      const genre = args.genre
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
    async getArtists (parent, args, context, info) {
      let result = await Artist.findAll({
        order: [['name', 'asc']]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
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
    async findTracksLike (parent, args, context, info) {
      // TODO: handle apostrophes in song name
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
    async findArtistsLike (parent, args, context, info) {
      let { searchQuery } = args
      searchQuery = escape(searchQuery)
      let result = await Artist.findAll({
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
    async findGenresLike (parent, args, context, info) {
      const { searchQuery } = args
      let result = await ArtistGenre.findAll({
        limit: 25,
        attributes: [[sequelize.literal('DISTINCT genre'), 'genre']],
        where: {
          genre: {
            [Op.iLike]: `%${searchQuery}%`
          }
        }
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
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
        .catch(err => console.error(err))

      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async genres (parent, args) {
      const artistId = parent.id

      let result = await ArtistGenre.findAll({
        where: {
          artistId: artistId
        },
        attributes: ['genre']
      })
        .catch(err => console.error(err))

      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async bio (parent, args) {
      const originalArtistName = String(parent.name)
      const FIND_WIKI_ARTICLE_URL = 'https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=10&gsrsearch='

      // for use with specific number of sentences
      // const WIKI_ARTICLE_CONTENT_URL = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext&exsentences=6&exsectionformat=plain&pageids='

      // for use with only the intro page - more ideal
      const WIKI_ARTICLE_CONTENT_URL = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext&exintro&exsectionformat=plain&pageids='
      // TODO: group keyword leads to false positives
      const artistKeywords = ['musician', 'band', 'singer', 'singer-songwriter',
        'rapper', 'group', 'duo', 'trio', 'supergroup', 'dj', 'vocalist', 'record producer']

      // remove accented characters, which leads to error code 400 in wikipedia request
      const artistName = originalArtistName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      const articles = await axios.get(`${FIND_WIKI_ARTICLE_URL}'${artistName}'`)
        .then(res => res.data.query.pages)
        .then(res => Object.values(res))
        .catch(err => console.error(err))

      articles.sort((a, b) => parseFloat(a.index) - parseFloat(b.index)) // sort array of results by index property

      /*
      Iterate over article results to determine whether any of the artist qualifiers are present in the title
      This is useful in distinguishing between pages that have identical names to the artist, or
      if the artist is more obscure and requires the qualifier in the page title
      */

      let artistArticleId = null
      for (const result of articles) {
        // iterate through the list of artist keywords and determine if the title includes them
        let articleFound = false
        for (const keyword of artistKeywords) {
          const lowerCaseTitle = String(result.title).toLowerCase()
          if (lowerCaseTitle.includes(`${artistName.toLowerCase()} (${keyword})`)) {
            articleFound = true
            artistArticleId = result.pageid
            break
          }
        }
        if (articleFound) {
          break
        }
      }

      if (artistArticleId) {
        const articleContent = await axios.get(`${WIKI_ARTICLE_CONTENT_URL}${artistArticleId}`)
          .then(res => res.data.query.pages)
          .then(res => Object.values(res)[0])
          .then(res => res.extract)
          .catch(err => console.error(err))
        return articleContent
      } else {
        /*
        Parse through the articles from existing results for keywords
        Generally the top result is going to be the artist if the artist
        is popular enough to not have a keyword in the page title
        */
        for (const result of articles) {
          const articleContent = await axios.get(`${WIKI_ARTICLE_CONTENT_URL}${result.pageid}`)
            .then(res => res.data.query.pages)
            .then(res => Object.values(res)[0])
            .then(res => res.extract)
            .catch(err => console.error(err))

          const lowerCaseArticle = String(articleContent).toLowerCase()
          const lowerCaseArtist = String(artistName).toLowerCase()

          for (const keyword of artistKeywords) {
            const articleIncludesKeyword = lowerCaseArticle.includes(` ${keyword} `) || lowerCaseArticle.includes(` ${keyword}.`) || lowerCaseArticle.includes(` ${keyword},`)
            let articleIncludesArtistName = lowerCaseArticle.includes(lowerCaseArtist) // issue if artist name is a nickname of their full name

            if (!articleIncludesArtistName) {
              // try splitting the artist name into an array of each word in the artist name, and check for each word
              try {
                const artistNameArr = lowerCaseArtist.split(' ')
                for (const artistWord of artistNameArr) {
                  if (lowerCaseArticle.includes(artistWord)) {
                    articleIncludesArtistName = true
                    break
                  }
                }
              } catch (err) {
                console.error(err)
              }
            }
            if (articleIncludesKeyword && articleIncludesArtistName) {
              return articleContent
            }
          }
        }
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
  },
  Genre: {
  },
  CurrentOverallStats: {
    async totalNumTracks (parent, args) {
      let result = await Song.findAll({
        attributes: [
          [sequelize.fn('count', sequelize.col('id')), 'totalNumTracks']
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
          [sequelize.fn('count', sequelize.col('song_id')), 'archiveNumTracks']
        ]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result[0].archiveNumTracks
    },
    async totalNumArtists (parent, args) {
      let result = await Artist.findAll({
        attributes: [
          [sequelize.fn('count', sequelize.col('id')), 'totalNumArtists']
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

module.exports = { resolvers }
