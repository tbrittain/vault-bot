import { ApolloServer } from 'apollo-server-express';
import express, { Application } from 'express';
import typeDefs from './schema/TypeDefs';
import resolvers from './schema/Resolvers';
import './db/db' // init sequelize
import errorHandler from 'strong-error-handler';
import { createComplexityLimitRule } from 'graphql-validation-complexity';
// const cors = require('cors')


const port = process.env.PORT || 4001;
const app: Application = express();


const ComplexityLimitRule = createComplexityLimitRule(1500, {
  onCost: (cost: Number) => {
    console.log('Query cost: ', cost);
  },
  formatErrorMessage: (cost: Number) =>
    `Query with cost ${cost} exceeds complexity limit`
})

// apollo server
// https://github.com/apollographql/apollo-server/issues/1142 for cors info
const server: ApolloServer = new ApolloServer({
  validationRules: [ComplexityLimitRule],
  typeDefs,
  resolvers
})


// TODO: enable cross origin requests only for frontend
// const corsSettings = {
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }

// app.use(cors(corsSettings))

app.use(errorHandler({
  debug: process.env.NODE_ENV !== 'production', // debug during development
  log: true
}))

server.applyMiddleware({ app, cors: true })

app.listen(port, () => {
  process.env.NODE_ENV === 'production'
    ? console.log(`🚀 GraphQL API server listening on port ${port}`)
    : console.log(`🚀 GraphQL API server listening on http://localhost:${port}/graphql/`)
})
