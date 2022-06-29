import React from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import SongContainer from "../song/SongContainer"
import SongListContainer from "../songList/SongListContainer"
import About from "../about/About"
import ArtistContainer from "../artist/ArtistContainer"
import Home from "../home/Home"
import GenreContainer from "../genre/GenreContainer"
import PageNotFound from "../404/404"
import ArtistListContainer from "../artistList/ArtistListContainer"
import GenreListContainer from "../genreList/GenreListContainer"
import Changelog from "../changelog/Changelog"
import "./transitions.css"

function RouteHandler() {
	const location = useLocation()
	return (
		<TransitionGroup>
			<CSSTransition
				timeout={300}
				classNames="fade"
				key={location.key}
				// unmountOnExit
			>
				<Routes>
					<Route exact path="/" element={<Home />} />
					<Route exact path="/about" element={<About />} />
					<Route exact path="/changelog" element={<Changelog />} />
					<Route exact path="/songs" element={<SongListContainer />} />
					<Route exact path="/songs/callback" element={<SongListContainer />} />
					<Route path="/songs/:songId" element={<SongContainer />} />
					<Route exact path="/artists" element={<ArtistListContainer />} />
					<Route path="/artists/:artistId" element={<ArtistContainer />} />
					<Route exact path="/genres" element={<GenreListContainer />} />
					<Route path="/genres/:genreName" element={<GenreContainer />} />
					<Route path="*" element={<PageNotFound />} />
				</Routes>
			</CSSTransition>
		</TransitionGroup>
	)
}

export default RouteHandler
