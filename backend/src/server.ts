import { createComplexityLimitRule } from 'graphql-validation-complexity'
import { createServer } from 'http'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import express from 'express'
import sequelize from './db'
import typeDefs from './schema/TypeDefs'
import resolvers from './schema/Resolvers'
;(async () => {
  sequelize
    .authenticate()
    .then(() => {
      console.log('Database connection established successfully')
    })
    .catch((err) => {
      console.error('Database connection could not be made, exiting', err)
      process.exit(1)
    })
})()

const port = process.env.PORT || 3001

const ComplexityLimitRule = createComplexityLimitRule(1500, {
  onCost: (cost: Number) => {
    console.log('Query cost: ', cost)
  },
  formatErrorMessage: (cost: Number) =>
    `Query with cost ${cost} exceeds complexity limit`
})

async function startApolloServer(typeDefs, resolvers) {
  const app = express()
  const httpServer = createServer(app)
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [ComplexityLimitRule],
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
  })

  await server.start()
  server.applyMiddleware({ app })
  await new Promise<void>((resolve) => httpServer.listen(port, resolve))

  process.env.NODE_ENV === 'production'
    ? console.log(`🚀 GraphQL API server listening on port ${port}`)
    : console.log(
        `🚀 GraphQL API server listening on http://localhost:${port}/graphql/`
      )
}

;(async () => {
  try {
    await startApolloServer(typeDefs, resolvers)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
