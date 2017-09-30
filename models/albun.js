'use stric'

var mongoose = require('mongoose');


var schema = mongoose.Schema;

var AlbumSchema = schema({
	title: String,
	description: String,
	year: Number,
	image: String,
	artist: { type: schema.ObjectId, ref: 'Artist'}
});


module.exports = mongoose.model('Album', AlbumSchema);
