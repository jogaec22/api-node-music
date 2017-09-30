'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/albun');
var Song = require('../models/songs');

function getAlbum(req, res){
	var albumId = req.params.id;

	Album.findById(albumId).populate({path: 'artist'}).exec((bad, album) =>{
		if(bad){
			res.status(500).send({message: 'Error en el servidor'});
			return;
		}
		if(!album){
			res.status(404).send({message: 'No existe el album'});
			return;
		}
		res.status(200).send({album});

	});	
}

function saveAlbum(req, res){
	var album = new Album();

	var params = req.body;
	album.title = params.title;
	album.description = params.description;
	album.year = params.year;
	album.image = 'null';
	album.artist = params.artist;

	album.save((bad, albumStored) =>{
		if(bad){
			res.status(500).send({message: 'Error en la petición'});
			return;
		}
		if(!albumStored){
			res.status(404).send({message: 'No se ha guardado el album'});
			return;
		}
		res.status(200).send({album: req.body});
	});
}

function getAlbums(req, res){
	var artistId = req.params.artist;
	var find = null;
	if(!artistId){		
		find = Album.find({}).sort('title');
	}else{
		find = Album.find({artist: artistId}).sort('year');
	}
	find.populate({path: 'artist'}).exec((bad, albums) =>{
		if(bad){
			res.status(500).send({message: 'Error en la petición'});
			return;
		}
		if(!albums){
			res.status(404).send({message: 'No existen Albums'});
			return;
		}
		res.status(200).send({albums});
	});
}


function updateAlbum(req, res){
	var albumId = req.params.id;
	var update = req.body;

	Album.findByIdAndUpdate(albumId,update, (bad, albumUpdated) =>{
		if(bad){
			res.status(500).send({message: 'Error en la petición'});
			return;
		}
		if(!albumUpdated){
			res.status(404).send({message: 'No se ha actualizado el album'});
			return;
		}
		res.status(200).send({album: albumUpdated});
	});
}

function deleteAlbum(req, res){
	var albumId = req.params.id;

	Album.findByIdAndRemove(albumId, (bad, albumRemoved) =>{
			if(bad){
				res.status(500).send({message: 'Error del Servidor, al eliminar album'});
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
				res.status(200).send({album: albumRemoved});
			});
		});
}


module.exports = {
	getAlbum, saveAlbum, getAlbums, updateAlbum, deleteAlbum
}