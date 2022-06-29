import React, { useState } from "react"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import homeStyles from "./HomeStyles"
import GeneralStats from "./GeneralStats"
import FeaturedArtist from "./FeaturedArtist"
import SwipeableViews from "react-swipeable-views"
import { autoPlay } from "react-swipeable-views-utils"
import "./override.css"
import { Button, MobileStepper, Paper, useTheme } from "@mui/material"

const AutoPlaySwipeableViews = autoPlay(SwipeableViews)

const Home = () => {
	const classes = homeStyles()
	const [activeStep, setActiveStep] = useState(0)
	const maxSteps = 2
	const theme = useTheme()

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1)
	}

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1)
	}

	const handleStepChange = (step) => {
		setActiveStep(step)
	}

	// TODO: make current homepage the mobile version
	return (
		<Paper className={classes.container} elevation={3}>
			<AutoPlaySwipeableViews
				interval={15000}
				style={{
					height: "100%",
				}}
				axis={theme.direction === "rtl" ? "x-reverse" : "x"}
				index={activeStep}
				onChangeIndex={handleStepChange}
				enableMouseEvents
			>
				<GeneralStats />
				<FeaturedArtist />
			</AutoPlaySwipeableViews>
			<MobileStepper
				steps={maxSteps}
				position="static"
				variant="dots"
				activeStep={activeStep}
				nextButton={
					<Button
						size="small"
						onClick={handleNext}
						disabled={activeStep === maxSteps - 1}
					>
						Next
						{theme.direction === "rtl" ? (
							<KeyboardArrowLeftIcon />
						) : (
							<KeyboardArrowRightIcon />
						)}
					</Button>
				}
				backButton={
					<Button size="small" onClick={handleBack} disabled={activeStep === 0}>
						{theme.direction === "rtl" ? (
							<KeyboardArrowRightIcon />
						) : (
							<KeyboardArrowLeftIcon />
						)}
						Back
					</Button>
				}
			/>
		</Paper>
	)
}

export default Home
