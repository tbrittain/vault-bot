import { mergeResolvers } from '@graphql-tools/merge'
import { loadFilesSync } from '@graphql-tools/load-files'
import path from 'path'

// TODO: change path to include other resolvers
const resolversArray = loadFilesSync(path.join(__dirname, './resolvers/ArtistResolver.ts'))

export default mergeResolvers(resolversArray)
