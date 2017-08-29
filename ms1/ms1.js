/*
 * Source:
 * http://restify.com/docs/home/
 * Microservice1 (ms1.js) listens on port 8080. It connects to Microservice2 (ms2.py) which listens on port 5000.
 *
 */

var restify = require('restify');
var request = require('request');

var ms1 = restify.createServer();
ms1.listen(8080, function(){
	console.log('%s listening at %s', ms1.name, ms1.url);
});
ms1.get('/:id', respond);

function respond(req, res, next){
	res.setHeader('content-type', 'application/json');
	res.writeHead(200);

	var id = req.params.id;
	var ms2 = 'http://localhost';
	var port = 5000;
	var path = id;
	var url = ms2 + ':' + port + '/' + path;
	request(url, function(error, response, body){
		res.write(body);
		res.end();
		return next();
	});
}
