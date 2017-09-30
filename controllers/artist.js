'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/albun');
var Song = require('../models/songs');

function getArtist(req, res){
	var aritstId = req.params.id;

	Artist.findById(aritstId, (bad, artist) =>{
		if(bad){
			res.status(500).send({message: 'Error en la petición'});
			return;
		}		
		if(!artist){
			res.status(404).send({message: 'El artist no existe'});
			return;
		}
		res.status(200).send({artist});
	});
}

function saveArtist(req, res){
	var artist = new Artist();

	var params = req.body;
	artist.name = params.name
	artist.description = params.description;
	artist.image = 'null';

	artist.save((bad, artistStored) => {
		if(bad){
			res.status(500).send({message: 'Error al guardar el artista'});
			return;
		}
		if(!artistStored){
			res.status(404).send({message: 'El artista no ha sido guardado'});
			return;
		}
		res.status(200).send({artist: artistStored});
	});
}

function getArtists(req, res){
	var page = req.params.page;
	if(!page){
		page = 1;
	}
	
	var itemsPerPage = 3;

	Artist.find().sort('name').paginate(page, itemsPerPage, 
		(bad, artists, total) =>{
			if(bad){
				res.status(500).send({message: 'Error en la petición'});
				return;
			}
			if(!artists){
				res.status(404).send({message: 'No existen artistas'});
				return;
			}
			return res.status(200).send({
				total_items: total,
				artist: artists
			});
		});
}

function updateArtist(req, res){
	var artistId = req.params.id;
	var update = req.body;

	Artist.findByIdAndUpdate(artistId, update, (bad, artistUpdate) =>{
		if(bad){
			res.status(500).send({message: 'Error en el servidor'});
			return;
		}
		if(!artistUpdate){
			res.status(404).send({message: 'El artista no se ha podido actualizar'});
			return;
		}
		res.status(200).send({artist: artistUpdate});
	});
}


function deleteArtist(req, res){
	var artistId = req.params.id;

	Artist.findByIdAndRemove(artistId, (bad, artistRemoved) => {
		if(bad){
			res.status(500).send({message: 'Error al eliminar el artista'});
			return;
		}
		if(!artistRemoved){
			res.status(404).send({message: 'El artista no ha sido eliminado'});
			return;
		}		
		Album.find({artist: artistRemoved._id}).remove((bad, albumRemoved) =>{
			if(bad){
				res.status(500).send({message: 'Error al eliminar el Album'});
				return;
			}
			if(!albumRemoved){
				res.status(404).send({message: 'El Album no ha sido eliminado'});
				return;
			}
			Song.find({album: albumRemoved._id}).remove((bad, songRemoved) =>{
				if(bad){
					res.status(500).send({message: 'Error al eliminar la Canción'});
					return;
				}
				if(!songRemoved){
					res.status(404).send({message: 'La canción no ha sido eliminada'});
					return;
				}
				res.status(200).send({artist: artistRemoved});
			});
		});
	});
}

module.exports = {
	getArtist, saveArtist, getArtists, updateArtist, deleteArtist
}