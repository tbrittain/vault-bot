import Song from '../models/Song.model'
import sequelize from '../index'

const SIMILARITY_SQL_QUERY = `
    WITH ss AS (
        SELECT *
        FROM songs
        WHERE songs.id = :songId
    )
    SELECT *
    FROM songs s
    WHERE s.danceability BETWEEN ((SELECT ss.danceability FROM ss) - 0.1) AND ((SELECT ss.danceability FROM ss) + 0.1)
        AND s.energy BETWEEN ((SELECT ss.energy FROM ss) - 0.1) AND ((SELECT ss.energy FROM ss) + 0.1)
        AND s.valence BETWEEN ((SELECT ss.valence FROM ss) - 0.1) AND ((SELECT ss.valence FROM ss) + 0.1)
        AND s.loudness BETWEEN ((SELECT ss.loudness FROM ss) - 3) AND ((SELECT ss.loudness FROM ss) + 3)
        AND s.id != (SELECT ss.id FROM ss);
`

async function calculateSimilarity(sourceSong, targetSong: Song) {
  let score = 100

  // Subtract a half point for each 0.1 length difference
  const lengthDiff = Math.abs(sourceSong.length - targetSong.length)
  score -= (lengthDiff / 2) * 10

  // Subtract one point for each difference in tempo
  const tempoDiff = Math.abs(sourceSong.tempo - targetSong.tempo)
  score -= tempoDiff

  // Subtract one point for each 0.01 Danceability difference
  const danceabilityDiff = Math.abs(
    sourceSong.danceability - targetSong.danceability
  )
  score -= danceabilityDiff * 100

  // Subtract one point for each 0.01 Energy difference
  const energyDiff = Math.abs(sourceSong.energy - targetSong.energy)
  score -= energyDiff * 100

  // Subtract one point for each 0.01 Valence difference
  const valenceDiff = Math.abs(sourceSong.valence - targetSong.valence)
  score -= valenceDiff * 100

  // Subtract one point for each 3.0 Loudness difference
  const loudnessDiff = Math.abs(sourceSong.loudness - targetSong.loudness)
  score -= loudnessDiff

  if (score < 0) {
    score = 0
  }

  return {
    song: targetSong,
    score: score
  }
}

export async function getSimilarSongs(songId, limit = 10) {
  const sourceSong = await Song.findByPk(songId)
  if (!sourceSong) {
    throw new Error('Source song not found')
  }

  if (limit > 100 || limit < 1) {
    throw new Error('Limit must be between 1 and 100')
  }

  const similarSongResults = await sequelize.query(SIMILARITY_SQL_QUERY, {
    replacements: {
      songId: songId
    },
    model: Song,
    mapToModel: true
  })

  // Iterate through similar songs and calculate similarity
  const similarSongs = similarSongResults.map(async (song) => {
    return await calculateSimilarity(sourceSong, song)
  })

  return await Promise.all(similarSongs).then((results) => {
    return results.sort((a, b) => {
      return b.score - a.score
    })
  })
}
