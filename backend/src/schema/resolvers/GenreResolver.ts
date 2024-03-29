import { Op } from 'sequelize'
import ArtistGenre from '../../database/models/ArtistGenre.model'
import Artist from '../../database/models/Artist.model'
import {
	IFindGenresLikeArgs,
	IGetArtistsFromGenreArgs,
	IGetGenreArgs
} from './interfaces/Genres'
import Genre from '../../database/models/Genre.model'
import GenreRank from '../../database/models/GenreRank.model'
import FeaturedGenre from '../../database/models/FeaturedGenre.model'

export default {
	Query: {
		async getGenre(_parent, args: IGetGenreArgs) {
			const { id } = args
			return await Genre.findOne({
				where: {
					id
				}
			})
		},
		async getGenres() {
			const results = await Genre.findAll({
				include: {
					model: GenreRank
				}
			}).catch((err) => console.error(err))

			return JSON.parse(JSON.stringify(results))
		},
		async getArtistsFromGenre(_parent, args: IGetArtistsFromGenreArgs) {
			const { genreId } = args
			const results = await Artist.findAll({
				include: [
					{
						model: ArtistGenre,
						include: [
							{
								model: Genre,
								where: {
									id: genreId
								},
								required: true
							}
						],
						required: true
					}
				]
			}).catch((err) => console.error(err))
			return JSON.parse(JSON.stringify(results))
		},
		async findGenresLike(_parent, args: IFindGenresLikeArgs) {
			const { searchQuery } = args
			let results = await Genre.findAll({
				limit: 25,
				where: {
					name: {
						[Op.iLike]: `%${searchQuery}%`
					}
				}
			}).catch((err) => console.error(err))
			results = JSON.parse(JSON.stringify(results))
			return results
		}
	},
	Genre: {
		async genreRank(parent: Genre) {
			if (parent.genreRank) return parent.genreRank

			const genreId = parent.id
			let result = await GenreRank.findOne({
				where: {
					genreId
				}
			})

			result = JSON.parse(JSON.stringify(result))
			return result
		},
		async featuredDates(parent: Genre) {
			const genreId = parent.id

			return await FeaturedGenre.findAll({
				where: {
					genreId
				}
			})
		}
	}
}
