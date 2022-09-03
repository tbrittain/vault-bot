import { mergeTypeDefs } from '@graphql-tools/merge'
import { loadFilesSync } from '@graphql-tools/load-files'
import { typeDefs as scalarTypeDefs } from 'graphql-scalars'
import path from 'path'

const typesArray = loadFilesSync(path.join(__dirname, './types'))
typesArray.push(scalarTypeDefs)

export default mergeTypeDefs(typesArray)
