import React, { useEffect, useState } from "react"
import SearchIcon from "@mui/icons-material/Search"
import songListStyles from "./SongListStyles"
import SongSearchContainer from "./SongSearchContainer"
import SongList from "./SongList"
import useDebounce from "../hooks/useDebounce"
import {
	AppBar,
	ClickAwayListener,
	Fade,
	InputBase,
	Paper,
	Popper,
	Toolbar,
} from "@mui/material"

const SongViewer = (props) => {
	const classes = songListStyles()
	const { trackSelection, setTrackSelection } = props
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebounce(search, 250)

	const [anchorEl, setAnchorEl] = useState(null)

	const handleChange = (event) => {
		setSearch(event.target.value)
		setAnchorEl(event.currentTarget)
	}

	const handleClickAway = () => {
		setAnchorEl(null)
		setSearch("")
	}

	const minSearchLength = 3
	const open = Boolean(anchorEl && search.length >= minSearchLength)

	useEffect(() => {
		localStorage.setItem("exportStep", 0)
	}, [])

	return (
		<Paper elevation={3}>
			<AppBar position="static">
				<Toolbar>
					<div className={classes.search}>
						<div className={classes.searchIcon}>
							<SearchIcon />
						</div>
						<InputBase
							InputLabelProps={{ shrink: true }}
							placeholder="Search for a song..."
							classes={{
								root: classes.inputRoot,
								input: classes.inputInput,
							}}
							value={search}
							onChange={handleChange}
						/>
						<ClickAwayListener onClickAway={handleClickAway}>
							<Popper
								placement="bottom-start"
								disablePortal={false}
								modifiers={{
									flip: {
										enabled: true,
									},
									preventOverflow: {
										enabled: true,
										boundariesElement: "scrollParent",
									},
								}}
								open={open}
								anchorEl={anchorEl}
								transition
							>
								{({ TransitionProps }) => (
									<Fade {...TransitionProps} timeout={350}>
										<Paper elevation={0}>
											{debouncedSearch.length >= minSearchLength && (
												<SongSearchContainer searchQuery={debouncedSearch} />
											)}
										</Paper>
									</Fade>
								)}
							</Popper>
						</ClickAwayListener>
					</div>
				</Toolbar>
			</AppBar>
			<SongList
				trackSelection={trackSelection}
				setTrackSelection={setTrackSelection}
			/>
		</Paper>
	)
}

export default SongViewer
