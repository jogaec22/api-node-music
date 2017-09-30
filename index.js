'use stric'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/nombre_bd', 
	(bad, res) => {
		if(bad){
			throw bad;
		}else{
			console.log('Conexion a Base de datos satisfactoria');
			app.listen(port, function(){
				console.log('Servidor Api rest corriendo en http://localhost:'+port);
			});
		}
});
