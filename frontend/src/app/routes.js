import React from 'react'
import { Route, Switch } from 'react-router-dom'
import SongContainer from '../song/SongContainer'
import SongListContainer from '../songList/SongListContainer'
import About from '../about/About'
import ArtistContainer from '../artist/ArtistContainer'
import Home from '../home/Home'
import GenreContainer from '../genre/GenreContainer'
import PageNotFound from '../404/404'
import ArtistListContainer from '../artistList/ArtistListContainer'

// https://www.digitalocean.com/community/tutorials/how-to-handle-routing-in-react-apps-with-react-router

function RouteHandler () {
  return (
    <Switch>
      <Route exact path='/'>
        <Home />
      </Route>
      <Route exact path='/about'>
        <About />
      </Route>
      <Route exact path='/songs'>
        <SongListContainer />
      </Route>
      <Route path='/songs/:songId'>
        <SongContainer />
      </Route>
      <Route exact path='/artists'>
        <ArtistListContainer />
      </Route>
      <Route path='/artists/:artistId'>
        <ArtistContainer />
      </Route>
      <Route exact path='/genres'>
        <h1>Genres index</h1>
      </Route>
      <Route path='/genres/:genreName'>
        <GenreContainer />
      </Route>
      <Route path='*'>
        <PageNotFound />
      </Route>
    </Switch>
  )
}

export default RouteHandler
