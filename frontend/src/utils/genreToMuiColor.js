import {
	amber,
	blue,
	blueGrey,
	cyan,
	deepOrange,
	deepPurple,
	green,
	grey,
	indigo,
	lightBlue,
	lightGreen,
	lime,
	orange,
	pink,
	purple,
	red,
	teal,
	yellow,
} from "@mui/material/colors"

const hues = [
	red,
	pink,
	purple,
	deepPurple,
	indigo,
	blue,
	lightBlue,
	cyan,
	teal,
	green,
	lightGreen,
	lime,
	yellow,
	amber,
	orange,
	deepOrange,
	grey,
	blueGrey,
]

const shades = [100, 200, 300, 400, 500, 600, 700, 800, 900]

const genreToMuiColor = (genreName) => {
	const secondChar = genreName.slice(1, 2)
	const secondLastChar = genreName.slice(-2)
	// const middleChar = genreName.slice( // unused
	//   Math.floor(genreName.length / 2),
	//   Math.floor(genreName.length / 2) + 1
	// )

	const r = Math.abs(secondChar.charCodeAt(0) - 97)
	const g = Math.abs(secondLastChar.charCodeAt(0) - 97)
	// const b = Math.abs(middleChar.charCodeAt(0) - 97)

	const hue = hues[r % 18]
	const shade = shades[g % 8]
	return hue[shade]
}

export default genreToMuiColor
