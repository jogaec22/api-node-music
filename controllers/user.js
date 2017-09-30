'use strict'

var fs = require('fs');
var path = require('path');

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');


function pruebas(req, res){
	res.status(200).send({
		message: 'Probando controlador'
	});
}

function saveUser(req, res){
	var user = new User();

	var params = req.body;

	user.name = params.name;
	user.surname = params.surname;
	user.email = params.email;
	user.role = 'ROLE_USER';
	user.image = 'null';

	if(!params.password){
		res.status(500).send({message: 'Enter the password'});
		return;		
	}	
	bcrypt.hash(params.password, null, null, function(bad, hash){
		user.password = hash;
		if(user.name == null || user.surname == null || user.email == null){
			res.status(200).send({
				message: 'Fill in all fields'
			});
			return;			
		}		
		user.save((bad, userStored) => {
			if(bad){				
				res.status(500).send({message: 'Failed to save user'});
				return;
			}
			if(!userStored){
				res.status(404).send({message: 'User not registered'});
				return;
			}
			res.status(200).send({
				user: userStored
			});			
		});
	});
}

function loginUser(req, res){
	var params = req.body;
	var email = params.email;
	var password = params.password;

	User.findOne({
		email: email.toLowerCase()
	}, (bad, user) =>{
		if(bad){
			res.status(500).send({
				//Error en la petición 
				message: 'Error in request'
			});
		}else{
			if(!user){
				res.status(404).send({
					//El usuario no existe
					message: 'Username does not exist.'
				});
			}else{

				//Check or Verify password
				bcrypt.compare(password, user.password, function(bad, check){
					if(check){
						//Return the data of the logged in user
						if(params.gethash){
							//Return a jwt token
							res.status(200).send({
								token: jwt.createToken(user)
							});
						}else{
							res.status(200).send({user});
						}
					}else{
						res.status(404).send({
							//El usuario no ha podido loguarse
							message: 'The user could not log in. '+bad
						});
					}
				});
			}
		}
	});
}

function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;

	User.findByIdAndUpdate(userId, update, (bad, userUpdated) =>{
		if(bad){
			res.status(500).send({message: 'Error al actualizar el usuario'});
			return;
		}
		if(!userUpdated){
			res.status(400).send({message: 'No se ha podido actualizar el usuario'});
			return;
		}
		res.status(200).send({user: userUpdated});		
	});
}

function uploadImage(req, res){
	var userId = req.params.id;
	var file_name = 'No subido ...';

	if(!req.files){//Propiedad files de objeto req es una variable superglobal del multipart
		res.status(200).send({message: 'No has subido ninguna imágen'});
		return;
	}	

	var file_path = req.files.image.path;
	var file_split = file_path.split('\\');
	var file_name = file_split[2];

	var ext_split = file_name.split('\.');
	var file_ext = ext_split[1];
	if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'gif'){
		res.status(200).send({message: 'Extension del archivo no valida'});
		return;
	}
	User.findByIdAndUpdate(userId, {image: file_name}, (bad, userUpdated) =>{
		if(!userUpdated){
			res.status(400).send({message: 'No se ha podido actualizar el usuario'});
			return;
		}
		res.status(200).send({image: file_name, user: userUpdated});		
	});
}

function getImageFile(req, res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/users/'+imageFile;

	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
			return;
		}
		res.status(200).send({message: 'No existe la imágen'});
	});
}

module.exports = {
	pruebas, saveUser, loginUser, updateUser, uploadImage, getImageFile
}