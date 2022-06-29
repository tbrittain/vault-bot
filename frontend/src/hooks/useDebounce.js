import { useEffect, useState } from "react"

const useDebounce = (data, delay) => {
	const [debouncedData, setDebouncedData] = useState(data)

	useEffect(() => {
		let timerID
		if (timerID) {
			clearTimeout(timerID)
		}

		timerID = setTimeout(() => {
			setDebouncedData(data)
		}, delay)

		return () => {
			clearTimeout(timerID)
		}
	}, [data, delay])

	return debouncedData
}

export default useDebounce
