'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/albun');
var Song = require('../models/songs');

function getSong(req, res){
	var songId = req.params.id;

	Song.findById(songId).populate({path: 'album'}).exec((bad, song) =>{
		if(bad){
			res.status(500).send({message: 'Error en el servidor'});
			return;
		}
		if(!song){
			res.status(404).send({message: 'No existe la canción'});
			return;
		}
		res.status(200).send({song});
	});	
}


function saveSong(req, res){
	var song = new Song();

	var params = req.body;

	song.number = params.number;
	song.name = params.name;
	song.duration = params.duration;
	song.file = null;
	song.album = params.album;

	song.save((bad, songStored) =>{
		if(bad){
			res.status(500).send({message: 'Error en el servidor'});
			return;
		}
		if(!songStored){
			res.status(404).send({message: 'No se ha guardado la canción'});
			return;
		}
		res.status(200).send({song: req.body});
	});
}

function getSongs(req, res){
	var albumId = req.params.album;
	var find = null;
	if(!albumId){
		find = Song.find({}).sort('number');
	}else{
		find = Song.find({album: albumId}).sort('number');
	}

	find.populate(
		{path: 'album', 
		populate: {
			path: 'artist',
			model: 'Artist'
		}
	}).exec((bad, songs) =>{
		if(bad){
			res.status(500).send({message: 'Error en el servidor'});
			return;
		}
		if(!songs){
			res.status(404).send({message: 'No existen canciones'});
			return;
		}
		res.status(200).send({songs});
	});
}

function updateSong(req, res){
	var songId = req.params.id;
	var update = req.body;

	Song.findByIdAndUpdate(songId, update, (bad, songUpdate) =>{
		if(bad){
			res.status(500).send({message: 'Error en el servidor'});
			return;
		}
		if(!songUpdate){
			res.status(404).send({message: 'No Se ha actualizado la canción'});
			return;
		}
		res.status(200).send({song: songUpdate});
	});
}

function deleteSong(req, res){
	var songId = req.params.id;
	Song.findByIdAndRemove(songId, (bad, songRemoved) =>{
		if(bad){
			res.status(500).send({message: 'Error al eliminar la Canción'});
			return;
		}
		if(!songRemoved){
			res.status(404).send({message: 'La canción no ha sido eliminada'});
			return;
		}
		//console.log(artistRemoved);
		res.status(200).send({artist: songRemoved});
	});
}

function uploadFile(req, res){
	var songId = req.params.id;
	var file_name = 'None';

	if(req.files){
		var file_path = req.files.file.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];
		if(file_ext == 'mp3' || file_ext == 'ogg' || file_ext == 'wmv'){
			Song.findByIdAndUpdate(songId, {file: file_name}, (bad, songUpdated) =>{
				if(!songUpdated){
					res.status(400).send({message: 'No se ha podido actualizar la canción'});
				}else{
					res.status(200).send({song: songUpdated});
				}
			});
		}else{
			res.status(200).send({message: 'Extension del archivo no valida'});
		}
	}else{
		res.status(200).send({message: 'No has subido ningún archivo de audio'});
	}
}

function getSongFile(req, res){
	var file = req.params.songFile;
	var path_file = './uploads/songs/'+file;
	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
			return;
		}
		res.status(200).send({message: 'No existe el archivo de audio'});		
	});
}


module.exports = {
	getSong, saveSong, getSongs, updateSong, deleteSong, uploadFile, getSongFile
}