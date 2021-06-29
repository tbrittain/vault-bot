// import { createAsyncThunk } from '@reduxjs/toolkit'
const axios = require('axios').default
const path = require('path')
require('dotenv').config(
  { path: path.join(__dirname, '/../../.env') }
)

const query = `
  query {
    getTrack(id: "$songId") {
      name
      id
      details {
        length
        valence
      }
    }
  }
`

// const fetchSong = createAsyncThunk(
//   'individualSong/setCurrentSong',
//   async (songId) => {
//     const response = await axios.post(
//       process.env.BACKEND,
//       `{
//         getTrack(id: "${songId}") {
//           name
//           id
//           details {
//             length
//             valence
//           }
//         }
//       }`
//     )
//   }
// )

const testFunction = async (songId) => {
  const response = await axios.post(
    process.env.BACKEND,
    {

    }
  )
    .catch(err => console.log(err))
  console.log(response)
}

const runTestFunction = async (songId) => {
  await testFunction(songId)
}

runTestFunction('2muJzxNCRL7M2QeCmjPubU')
