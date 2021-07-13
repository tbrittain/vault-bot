import {
  red, pink, purple, deepPurple,
  indigo, blue, lightBlue, cyan,
  teal, green, lightGreen, lime,
  yellow, amber, orange, deepOrange,
  grey, blueGrey
} from '@material-ui/core/colors'

const hues = [
  red, pink, purple, deepPurple,
  indigo, blue, lightBlue, cyan,
  teal, green, lightGreen, lime,
  yellow, amber, orange, deepOrange,
  grey, blueGrey
]

const shades = [
  100, 200, 300, 400, 500,
  600, 700, 800, 900
]

const genreToMuiColor = (genreName) => {
  const firstChar = genreName.slice(0, 1)
  const lastChar = genreName.slice(-1)
  const middleChar = genreName.slice(
    Math.floor(genreName.length / 2),
    Math.floor(genreName.length / 2) + 1
  )

  const r = Math.abs(firstChar.charCodeAt(0) - 97)
  const g = Math.abs(lastChar.charCodeAt(0) - 97)
  const b = Math.abs(middleChar.charCodeAt(0) - 97)

  const hue = hues[r % 18]
  const shade = shades[g % 8]
  return hue[shade]
}

export default genreToMuiColor
