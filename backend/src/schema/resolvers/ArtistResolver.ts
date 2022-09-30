import ArtistGenre from '../../database/models/ArtistGenre.model'
import Song from '../../database/models/Song.model'
import Artist from '../../database/models/Artist.model'
import { Op } from 'sequelize'
import { IArtistInfo, IFindArtistsLikeArgs } from './interfaces/Artists'
import { getArtistBio } from '../../utils/WikipediaSearch'
import Genre from '../../database/models/Genre.model'
import ArtistRank from '../../database/models/ArtistRank.model'
import FeaturedArtist from '../../database/models/FeaturedArtist.model'

export default {
	Query: {
		async getArtist(_parent, args: IArtistInfo) {
			if (!args.id && !args.name) {
				throw new Error('Either an artist ID or artist name must be provided')
			}

			let condition: { id?: string; name?: string }

			if (args.id) {
				const artistId = args.id
				condition = {
					id: artistId
				}
			} else if (args.name) {
				const artistName = args.name
				condition = {
					name: artistName
				}
			}

			let result = await Artist.findOne({
				where: condition
			}).catch((err) => console.error(err))

			result = JSON.parse(JSON.stringify(result))
			return result
		},
		async getFeaturedArtist() {
			let result = await Artist.findOne({
				where: {
					featured: {
						[Op.not]: null
					}
				},
				order: [['featured', 'desc']]
			}).catch((err) => console.error(err))
			result = JSON.parse(JSON.stringify(result))
			return result
		},
		async getArtists() {
			let result = await Artist.findAll({
				include: {
					model: ArtistRank
				}
			}).catch((err) => console.error(err))

			result = JSON.parse(JSON.stringify(result))
			return result
		},
		async findArtistsLike(_parent, args: IFindArtistsLikeArgs) {
			const { searchQuery } = args
			let result = await Artist.findAll({
				limit: 25,
				where: {
					name: {
						[Op.iLike]: `%${searchQuery}%`
					}
				}
			}).catch((err) => console.error(err))
			result = JSON.parse(JSON.stringify(result))
			return result
		}
	},
	Artist: {
		async songs(parent: Artist) {
			const artistId = parent.id

			let result = await Song.findAll({
				include: [
					{
						model: Artist,
						where: {
							id: artistId
						}
					}
				]
			}).catch((err) => console.error(err))

			result = JSON.parse(JSON.stringify(result))
			return result
		},
		async genres(parent: Artist) {
			const artistId = parent.id

			let result = await ArtistGenre.findAll({
				where: {
					artistId: artistId
				},
				include: {
					model: Genre
				}
			}).catch((err) => console.error(err))

			result = JSON.parse(JSON.stringify(result))
			if (result) {
				return result.map((x) => x.genre)
			}

			return []
		},
		async wikiBio(parent: Artist) {
			const originalArtistName = String(parent.name)
			return await getArtistBio(originalArtistName)
		},
		async artistRank(parent: Artist) {
			if (parent.artistRank) return parent.artistRank

			const artistId = parent.id
			let result = await ArtistRank.findOne({
				where: {
					artistId
				}
			})

			result = JSON.parse(JSON.stringify(result))
			return result
		},
		async featuredDates(parent: Artist) {
			const artistId = parent.id

			return await FeaturedArtist.findAll({
				where: {
					artistId
				}
			})
		}
	}
}
