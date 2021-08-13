import ArtistGenre from '../../db/models/ArtistGenre.model'
import Song from '../../db/models/Song.model'
import Artist from '../../db/models/Artist.model'
import { Op } from 'sequelize'
import { 
  GetArtistsArgs,
  FindArtistsLikeArgs,
  ArtistSongsParent,
  ArtistGenresParent,
  ArtistWikiBioParent
} from './interfaces/Artists'
const axios = require('axios').default
const { removeAccents } = require('../../utils/RemoveAccents')

export default {
  Query: {
    async getArtist (args: GetArtistsArgs) {
      if (!args.id && !args.name) {
        throw new SyntaxError('Either an artist ID or artist name must be provided')
      }

      let condition: { id?: string; name?: string }

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
        console.log(result)
        return result
      } else {
        throw new SyntaxError('No results found for artist provided')
      }
    },
    async getFeaturedArtist () {
      console.log('Function called')
      let result = await Artist.findOne({
        where: {
          featured: {
            [Op.not]: null
          }
        },
        order: [['featured', 'desc']]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async getArtists () {
      let result = await Artist.findAll({
        order: [['name', 'asc']]
      })
        .catch(err => console.error(err))
      result = JSON.parse(JSON.stringify(result))
      return result
    },
    async findArtistsLike (args: FindArtistsLikeArgs) {
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
    }
  },
  Artist: {
    async songs (parent: ArtistSongsParent) {
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
    async genres (parent: ArtistGenresParent) {
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
    async wikiBio (parent: ArtistWikiBioParent) {
      const originalArtistName = String(parent.name)
      const FIND_WIKI_ARTICLE_URL = 'https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=10&gsrsearch='

      // for use with specific number of sentences
      const WIKI_ARTICLE_CONTENT_URL = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext&exsentences=10&exsectionformat=plain&pageids='

      // for use with only the intro page
      // const WIKI_ARTICLE_CONTENT_URL = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext&exintro&exsectionformat=plain&pageids='

      // 'group', is another keyword, but it produces too many false positives
      const artistKeywords = ['musician', 'band', 'singer', 'singer-songwriter',
        'rapper', 'duo', 'trio', 'supergroup', 'dj', 'vocalist', 'record producer',
        'music producer', 'composer', 'multi-instrumentalist']

      // remove accented characters, which leads to error code 400 in wikipedia request
      let artistNameNoSymbols = removeAccents(originalArtistName)
      artistNameNoSymbols = artistNameNoSymbols.replace('.', '')
      artistNameNoSymbols = artistNameNoSymbols.replace('&', '')

      let articles = await axios.get(`${FIND_WIKI_ARTICLE_URL}'${artistNameNoSymbols}'`, {
        headers: { 'User-Agent': 'VaultBot GraphQL Backend/2.0.0 +https://vaultbot.tbrittain.com/' }
      })
        .then(res => res.data.query.pages)
        .then(res => Object.values(res))
        .catch(err => {
          console.error(err)
          return null
        })

      if (!articles) {
        return null
      }

      articles.sort((a: { index: string }, b: { index: string }) => parseFloat(a.index) - parseFloat(b.index)) // sort array of results by index property
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
          if (lowerCaseTitle.includes(`${artistNameNoSymbols.toLowerCase()} (${keyword})`)) {
            articleFound = true
            artistArticleId = result.pageid
            break
          }
        }
        if (articleFound) {
          break
        }
      }
      // clean results of albums
      articles = articles.filter(article => !article.title.includes(' (album)'))
      articles = articles.filter(article => !article.title.includes(' (song)'))
      let artistPageName: string
      if (artistArticleId) {
        const articleContent = await axios.get(`${WIKI_ARTICLE_CONTENT_URL}${artistArticleId}`, {
          headers: { 'User-Agent': 'VaultBot GraphQL Backend/2.0.0 +https://vaultbot.tbrittain.com/' }
        })
          .then(res => res.data.query.pages)
          .then(res => Object.values(res)[0])
          .catch(err => console.error(err))

        artistPageName = articleContent.title.replace(' ', '_')
        const articleLink = `https://en.wikipedia.org/wiki/${artistPageName}`
        return {
          bio: articleContent.extract,
          url: articleLink
        }
      } else {
        /*
        Parse through the articles from existing results for keywords
        Generally the top result is going to be the artist if the artist
        is popular enough to not have a keyword in the page title
        */
        for (const result of articles) {
          const articleContent = await axios.get(`${WIKI_ARTICLE_CONTENT_URL}${result.pageid}`, {
            headers: { 'User-Agent': 'VaultBot GraphQL Backend/2.0.0 +https://vaultbot.tbrittain.com/' }
          })
            .then(res => res.data.query.pages)
            .then(res => Object.values(res)[0])
            .catch(err => console.error(err))

          let rawArticle = String(articleContent.extract).toLowerCase()
          rawArticle = rawArticle.replace(/[^a-zA-Z0-9_ -]/g, '')

          const lowerCaseArtist = String(originalArtistName).toLowerCase()

          for (const keyword of artistKeywords) {
            const articleIncludesKeyword = rawArticle.includes(` ${keyword} `)
            const articleIncludesArtistName = rawArticle.includes(` ${lowerCaseArtist} `) || rawArticle.includes(`${lowerCaseArtist} `)
            if (articleIncludesKeyword && articleIncludesArtistName) { // issues when artist name is their real name (but not full name)
              artistPageName = articleContent.title.replace(' ', '_')
              const articleLink = `https://en.wikipedia.org/wiki/${artistPageName}`
              return {
                bio: articleContent.extract,
                url: articleLink
              }
            }
          }
        }
      }
    }
  }
}
