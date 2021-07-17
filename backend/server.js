const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { createComplexityLimitRule } = require('graphql-validation-complexity')
const cors = require('cors')

// express as middleware
const port = process.env.PORT || 4001
const app = express()

// types and resolvers
const { typeDefs } = require('./schema/TypeDefs')
const { resolvers } = require('./schema/Resolvers')

const ComplexityLimitRule = createComplexityLimitRule(1500, {
  onCost: (cost) => {
    console.log('Query cost:', cost)
  },
  formatErrorMessage: (cost) =>
    `Query with cost ${cost} exceeds complexity limit`
})

// apollo server
// https://github.com/apollographql/apollo-server/issues/1142 for cors info
const server = new ApolloServer({
  validationRules: [ComplexityLimitRule],
  typeDefs,
  resolvers
})

// body parsing - only necessary for 'post'-like CRUD mutations
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// TODO: enable cross origin requests only for frontend
const corsSettings = {
  origin: process.env.FRONTEND_URL,
  credentials: true
}

// app.use(cors(corsSettings))

server.applyMiddleware({ app, cors: true })

app.listen(port, () => {
  console.log(`🚀 GraphQL API server listening on port ${port}`)
})
