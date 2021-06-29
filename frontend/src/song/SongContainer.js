import React from 'react'
import { withRouter } from 'react-router-dom'

class SongContainer extends React.Component {
  componentDidMount () {
    const id = this.props.match.params.songId
    console.log(id)
  }

  render () {
    console.log(this.props)
    return <h1>Song Container</h1>
  }
}

export default withRouter(SongContainer)
