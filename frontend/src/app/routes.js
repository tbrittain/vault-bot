import React from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import SongContainer from '../song/SongContainer'
import SongListContainer from '../songList/SongListContainer'
import About from '../about/About'
import ArtistContainer from '../artist/ArtistContainer'
import Home from '../home/Home'
import GenreContainer from '../genre/GenreContainer'
import PageNotFound from '../404/404'
import ArtistListContainer from '../artistList/ArtistListContainer'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import './transitions.css'

function RouteHandler () {
  const location = useLocation()
  return (
    <TransitionGroup>
      <CSSTransition
        timeout={300}
        classNames='fade'
        key={location.key}
        unmountOnExit
      >
        <Switch
          location={location}
        >
          <Route
            exact
            path='/'
            component={Home}
          />
          <Route
            exact
            path='/about'
            component={About}
          />
          <Route
            exact
            path='/songs'
            component={SongListContainer}
          />
          <Route
            path='/songs/:songId'
            component={SongContainer}
          />
          <Route
            exact
            path='/artists'
            component={ArtistListContainer}
          />
          <Route
            path='/artists/:artistId'
            component={ArtistContainer}
          />
          <Route
            exact
            path='/genres'
          >
            <h1>Genres index</h1>
          </Route>
          <Route
            path='/genres/:genreName'
            component={GenreContainer}
          />
          <Route
            path='*'
            component={PageNotFound}
          />
        </Switch>
      </CSSTransition>

    </TransitionGroup>

  )
}

export default RouteHandler
