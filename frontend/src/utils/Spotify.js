const fetch = require('node-fetch')

let accessToken
const clientId = process.env.SPOTIFY_CLIENT_ID
const redirectUri = process.env.SPOTIFY_REDIRECT_URI

const Spotify = {
  getAccessToken () {
    if (accessToken) {
      return accessToken
    }

    // first check for access token match
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/)
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/)

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1]
      const expiresIn = Number(expiresInMatch[1])

      // clear parameters to grab new access token when it expired
      window.setTimeout(() => accessToken = '', expiresIn * 1000) // eslint-disable-line
      window.history.pushState('Access Token', null, '/')
      return accessToken
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-private&redirect_uri=${redirectUri}`
      window.location = accessUrl
    }
  },
  async savePlaylist (name, trackUris) {
    if (!name || !trackUris.length) {
      return
    }
    const formattedTrackUris = [...trackUris].map(uri => {
      return `spotify:track:${uri}`
    })

    const accessToken = Spotify.getAccessToken()
    const headers = { Authorization: `Bearer ${accessToken}` }
    const userId = await fetch('https://api.spotify.com/v1/me', { headers: headers })
      .then(res => res.json())
      .then(res => res.id)
    const newUserPlaylist = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({ name: name })
      })
      .then(res => res.json())
      .then(res => res.id)
    return await fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${newUserPlaylist}/tracks`,
      {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({ uris: formattedTrackUris })
      })
  }
}

export default Spotify
