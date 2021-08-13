import { ApolloServer } from 'apollo-server-express';
import express, { Application } from 'express';
import typeDefs from './schema/TypeDefs';
import resolvers from './schema/Resolvers';
import './db/db' // init sequelize
// import { createComplexityLimitRule } from 'graphql-validation-complexity';
// const cors = require('cors')

// TODO https://typeofnan.dev/your-first-node-express-app-with-typescript/
// https://ankitdeveloper.medium.com/apollo-server-express-graphql-api-using-node-js-with-typescript-e762afaccb8c

// express as middleware
const port = process.env.PORT || 4001;
const app: Application = express();


// const ComplexityLimitRule = createComplexityLimitRule(1500, {
//   onCost: (cost: Number) => {
//     console.log('Query cost: ', cost);
//   },
//   formatErrorMessage: (cost: Number) =>
//     `Query with cost ${cost} exceeds complexity limit`
// })

// apollo server
// https://github.com/apollographql/apollo-server/issues/1142 for cors info
const server: ApolloServer = new ApolloServer({
  // validationRules: [ComplexityLimitRule],
  typeDefs,
  resolvers
})


// TODO: enable cross origin requests only for frontend
// const corsSettings = {
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }

// app.use(cors(corsSettings))

server.applyMiddleware({ app, cors: true })

app.listen(port, () => {
  process.env.NODE_ENV === 'production'
    ? console.log(`🚀 GraphQL API server listening on port ${port}`)
    : console.log(`🚀 GraphQL API server listening on http://localhost:${port}/graphql/`)
})
