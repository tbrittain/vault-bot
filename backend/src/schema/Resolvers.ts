import { mergeResolvers } from '@graphql-tools/merge'
import { loadFilesSync } from '@graphql-tools/load-files'
import { resolvers as scalarResolvers } from 'graphql-scalars'
import path from 'path'

const resolversArray = loadFilesSync(path.join(__dirname, './resolvers'))
resolversArray.push(scalarResolvers)

export default mergeResolvers(resolversArray)
