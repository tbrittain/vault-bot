import { createTheme } from '@mui/material'
import '@fontsource/rubik/300.css'
import '@fontsource/rubik/400.css'
import '@fontsource/rubik/500.css'
import '@fontsource/rubik/800.css'
import { commonTheme } from './CommonTheme'

const lightTheme = createTheme({
	palette: {
		primary: {
			main: '#BCE7FD',
		},
		secondary: {
			main: '#2B2D42',
		},
		error: {
			main: '#EF233C',
			dark: '#D90429',
		},
		mode: 'light',
	},
	...commonTheme,
})

export default lightTheme
