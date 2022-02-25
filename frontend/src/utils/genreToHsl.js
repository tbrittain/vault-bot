const genreToHsl = (genreName) => {
  const firstChar = genreName.slice(0, 1)
  const lastChar = genreName.slice(-1)
  const middleChar = genreName.slice(
    Math.floor(genreName.length / 2),
    Math.floor(genreName.length / 2) + 1
  )

  const r = Math.abs(firstChar.charCodeAt(0) - 97)
  const g = Math.abs(lastChar.charCodeAt(0) - 97)
  const b = Math.abs(middleChar.charCodeAt(0) - 97)

  const hue = (r * 7 + g * 3 + b * 5) % 360

  let saturation = r
  let lightness = b
  if (r < 9) {
    saturation *= 5
  } else if (r >= 9 && r < 17) {
    saturation *= 7
  } else {
    saturation *= 3
  }

  if (b < 9) {
    lightness *= 5
  } else if (b >= 9 && b < 17) {
    lightness *= 7
  } else {
    lightness *= 3
  }

  saturation = 100 - (saturation % 100)
  lightness = 100 - (lightness % 100)

  // console.log('hue', hue)
  // console.log('saturation', saturation)
  // console.log('lightness', lightness)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export default genreToHsl
