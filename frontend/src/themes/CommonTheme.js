export const commonTheme = {
	typography: {
		fontFamily: "Rubik, sans-serif",
		h1: {
			fontSize: "3.2rem",
		},
		h2: {
			fontSize: "2.8rem",
		},
		h3: {
			fontSize: "2.6rem",
		},
		h4: {
			fontSize: "2.4rem",
		},
		h5: {
			fontSize: "2.2rem",
		},
		h6: {
			fontSize: "2rem",
		},
		fontWeightLight: 300,
		fontWeightRegular: 400,
		fontWeightBold: 800,
	},
	components: {
		MuiBreadcrumbs: {
			styleOverrides: {
				ol: {
					justifyContent: "center",
				},
			},
		},
		MuiPaper: {
			defaultProps: {
				square: true,
			},
		},
	},
}
