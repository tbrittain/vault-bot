import { makeStyles } from '@mui/styles'

const aboutStyles = makeStyles((theme) => ({
	aboutContainer: {
		width: '100%',
	},
	title: {
		textAlign: 'center',
	},
	vaultBotLogo: {
		height: '18vw',
		width: '18vw',
		float: 'left',
		display: 'inline-block',
		margin: 15,
		[theme.breakpoints.down('sm')]: {
			display: 'flex',
			float: 'none',
			margin: 'auto',
			minHeight: 175,
			minWidth: 175,
			paddingBottom: 15,
		},
	},
	aboutContent: {
		margin: '3%',
	},
	paragraph: {
		textIndent: '3ch',
		textAlign: 'justify',
	},
}))

export default aboutStyles
