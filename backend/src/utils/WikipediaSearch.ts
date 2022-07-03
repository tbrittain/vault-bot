import { default as axios } from 'axios'

type WikipediaPageSearchResult = {
  pageid: number
  ns: number
  title: string
  index: number
}

type WikipediaArticleContent = {
  pageid?: number
  ns?: number
  title?: string
  extract?: string
}

export async function getArtistBio(artistName: String) {
  const FIND_WIKI_ARTICLE_URL =
    'https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=10&gsrsearch='

  const WIKI_ARTICLE_CONTENT_URL =
    'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext&exsentences=10&exsectionformat=plain&pageids='

  // 'group', is another keyword, but it produces too many false positives
  const artistKeywords = [
    'musician',
    'band',
    'singer',
    'singer-songwriter',
    'rapper',
    'duo',
    'trio',
    'supergroup',
    'dj',
    'vocalist',
    'record producer',
    'music producer',
    'composer',
    'multi-instrumentalist'
  ]

  // URL-friendly version of the artist name
  const encodedArtistName = encodeURIComponent(
    artistName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  )

  let articles: WikipediaPageSearchResult[] = await axios
    .get(`${FIND_WIKI_ARTICLE_URL}'${encodedArtistName}'`, {
      headers: {
        'User-Agent':
          'VaultBot GraphQL Backend/2.1.1 +https://vaultbot.tbrittain.com/'
      }
    })
    .then((res) => res.data.query.pages)
    .then((res) => Object.values(res))
    .catch((err) => {
      console.error(err)
      return null
    })

  if (!articles) {
    return null
  }

  articles.sort(
    (
      a: Partial<WikipediaPageSearchResult>,
      b: Partial<WikipediaPageSearchResult>
    ) => a.index - b.index
  )

  /**
   * Iterate over article results to determine whether any of the artist qualifiers are present in the title
   * This is useful in distinguishing between pages that have identical names to the artist, or
   * if the artist is more obscure and requires the qualifier in the page title
   */
  let artistArticleId: Number | null = null
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
  // clean results of albums
  articles = articles.filter(
    (article) => !article.title.includes(' (album)' || ' (song)')
  )

  let artistPageName: string
  if (artistArticleId) {
    const articleContent: WikipediaArticleContent = await axios
      .get(`${WIKI_ARTICLE_CONTENT_URL}${artistArticleId}`, {
        headers: {
          'User-Agent':
            'VaultBot GraphQL Backend/2.1.1 +https://vaultbot.tbrittain.com/'
        }
      })
      .then((res) => res.data.query.pages)
      .then((res) => Object.values(res)[0])
      .catch((err) => console.error(err))

    artistPageName = articleContent.title!.replace(/ /g, '_')
    const articleLink = `https://en.wikipedia.org/wiki/${artistPageName}`
    return {
      bio: articleContent.extract!,
      url: articleLink
    }
  } else {
    /**
     * Parse through the articles from existing results for keywords
     * Generally the top result (the lowest index article) is going
     * to be the artist if the artist is popular enough to not have
     * a keyword in the page title
     */
    for (const article of articles) {
      const articleContent: WikipediaArticleContent = await axios
        .get(`${WIKI_ARTICLE_CONTENT_URL}${article.pageid}`, {
          headers: {
            'User-Agent':
              'VaultBot GraphQL Backend/2.1.1 +https://vaultbot.tbrittain.com/'
          }
        })
        .then((res) => res.data.query.pages)
        .then((res) => Object.values(res)[0])
        .catch((err) => console.error(err))

      const rawArticle = String(articleContent.extract!)
        .toLowerCase()
        .replace(/[^a-zA-Z0-9À-ÿ_ -]/g, '')

      const lowerCaseArtist = String(artistName).toLowerCase()

      for (const keyword of artistKeywords) {
        const articleIncludesKeyword = rawArticle.includes(` ${keyword} `)
        const articleIncludesArtistName =
          rawArticle.includes(` ${lowerCaseArtist} `) ||
          rawArticle.includes(`${lowerCaseArtist} `)
        if (articleIncludesKeyword && articleIncludesArtistName) {
          // Known issue when artist name is their real name (but not full name)
          // https://github.com/tbrittain/vault-bot/issues/24

          artistPageName = articleContent.title!.replace(/ /g, '_')
          const articleLink = `https://en.wikipedia.org/wiki/${artistPageName}`
          return {
            bio: articleContent.extract!,
            url: articleLink
          }
        }
      }
    }
  }
}
