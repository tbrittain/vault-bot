import { createSlice } from '@reduxjs/toolkit'

export const songSlice = createSlice({
  name: 'individualSong',
  initialState: {},
  reducers: {
    setCurrentSong: (state, action) => {
      state = action.payload
    }
  }
})
