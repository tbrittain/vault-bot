import React from 'react'
import { Route, Switch } from 'react-router-dom'
import SongContainer from '../song/SongContainer'

// https://www.digitalocean.com/community/tutorials/how-to-handle-routing-in-react-apps-with-react-router

function RouteHandler () {
  return (
    <Switch>
      <Route exact path='/'>
        <h1>Index</h1>
      </Route>
      <Route exact path='/songs'>
        <h1>Songs index</h1>
      </Route>
      <Route path='/songs/:songId'>
        <SongContainer />
      </Route>
      <Route exact path='/artists'>
        <h1>Artists index</h1>
      </Route>
      <Route path='/artists/:artistId'>
        <h1>Individual artist</h1>
      </Route>
      <Route exact path='/genres'>
        <h1>Genres index</h1>
      </Route>
      <Route path='/genres/:genreName'>
        <h1>Individual genre</h1>
      </Route>
      <Route path='/history'>
        <h1>Historical data</h1>
      </Route>
      <Route path='/slicer'>
        <h1>Song slicer!</h1>
      </Route>
      <Route path='*'>
        <h1>404</h1>
      </Route>
    </Switch>
  )
}

export default RouteHandler
