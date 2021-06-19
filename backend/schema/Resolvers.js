const db = require('../db/db')
const Artist = require('../db/models/Artist')

Artist.findAll()
  .then(artist => {
    console.log(artist)
  })
  .catch(err => console.log(err))
