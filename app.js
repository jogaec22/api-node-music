'use stric'

const express = require('express');
const bodyParser = require('body-parser');


var app = express();

//cargar rutas
var user_routes = require('./routes/user');
var artist_routes = require('./routes/artist');
var album_routes = require('./routes/album');
var song_routes = require('./routes/song');

//
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//configuración de cabeceras http
app.use((req, res, next) =>{
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
	next();
});

//rutas
app.use('/api', user_routes);
app.use('/api', artist_routes);
app.use('/api', album_routes);
app.use('/api', song_routes);

/*app.get('/pruebas', function(req, res){
	res.status(200).send({message: 'Probando Api Rest'});
});*/

module.exports = app;