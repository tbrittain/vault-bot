const extractUnderline = (userInput, textToInterpolate) => {
  const stringUserInput = String(userInput)
  const stringText = String(textToInterpolate)
  const startQueryIndex = stringText.toLowerCase().indexOf(stringUserInput)
  const endQueryIndex = startQueryIndex + (userInput.length - 1)
  let beginText
  let endText

  if (startQueryIndex !== 0) {
    beginText = stringText.slice(0, startQueryIndex)
  }

  const underline = textToInterpolate.slice(startQueryIndex, endQueryIndex + 1)

  if (endQueryIndex !== stringText.length - 1) {
    endText = stringText.slice(endQueryIndex + 1, stringText.length)
  }
  return { beginText, underline, endText }
}

export default extractUnderline
