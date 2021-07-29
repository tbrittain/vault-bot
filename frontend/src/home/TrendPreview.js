import React from 'react'
import {
  Typography,
  CircularProgress
} from '@material-ui/core'
import { useQuery, gql } from '@apollo/client'
import { Alert } from '@material-ui/lab'
import { Scatter } from 'react-chartjs-2'
import genreToMuiColor from '../utils/genreToMuiColor'
import 'chartjs-adapter-date-fns'

const QUERY = gql`
  query ($startDate: String!) {
    getHistGenres (startDate: $startDate) {
      updatedAt
      genre
      count
    }
  }
`

// declare outside of component
const oneWeekAgo = new Date()
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

const TrendPreview = () => {
  const { loading, error, data } = useQuery(
    QUERY,
    {
      variables: {
        startDate: oneWeekAgo.toISOString()
      }
    })

  // https://blog.bitsrc.io/customizing-chart-js-in-react-2199fa81530a

  let processing = true
  let formattedData

  if (data) {
    const datasets = {}
    for (const result of data.getHistGenres) {
      if (!Object.keys(datasets).includes(result.genre)) {
        datasets[result.genre] = {
          label: result.genre.replace(/\b\w/g, c => c.toUpperCase()), // titlecase
          data: [],
          borderColor: genreToMuiColor(result.genre),
          backgroundColor: genreToMuiColor(result.genre),
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
          showLine: true
        }
      }

      const dataDate = new Date(result.updatedAt)
      datasets[result.genre].data.push({
        x: dataDate,
        y: result.count
      })
    }
    delete datasets.total
    formattedData = {
      datasets: Object.values(datasets)
    }
    console.log(formattedData)
  }

  let delayed
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: 1000 * 60 * 60 * 24 * 2, // 2 days,
    interaction: {
      mode: 'nearest'
    },
    animation: {
      onComplete: () => {
        delayed = true
      },
      delay: (context) => {
        let delay = 0
        if (context.type === 'data' && context.mode === 'default' && !delayed) {
          delay = context.dataIndex * 35 + context.datasetIndex * 35
        }
        return delay
      }
    },
    plugins: {
      title: {
        text: 'Top 10 genres in the dynamic playlist over the past week',
        display: true
      },
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem, data) => {
            return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue} songs`
          }
        }
      }
    },
    scales: {
      x: {
        type: 'timeseries',
        time: {
          unit: 'day'
        },
        parsing: 'false',
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of songs'
        }
      }
    }
  }

  processing = false

  if (loading || processing) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
          '& > * + *': {
            margin: 'auto auto'
          }
        }}
      >
        <CircularProgress />
        <Typography
          variant='body2'
          style={{
            marginTop: 5
          }}
        >
          Loading stats...
        </Typography>
      </div>
    )
  }

  if (error) {
    return (
      <Alert severity='error'>An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <>
      <Scatter
        data={formattedData}
        options={options}
      />
    </>
  )
}

export default TrendPreview
