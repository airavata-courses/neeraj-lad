/*
 * Source:
 * http://restify.com/docs/home/
 * Gateway (gateway.js) listens on port 7080. It connects to the Microservice1 (ms1.js) which listens on port 8080.
 */

var restify = require('restify');
var request = require('request');
var url = require('url');

var server = restify.createServer();
server.listen(7080, function(){
	console.log('%s listening at %s', server.name, server.url);
});

server.get('/:id', respond);

function respond(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('content-type', 'application/json');
	res.writeHead(200);

	var id = req.params.id;
	var ms1 = 'http://localhost';
	var port = 8080;
	var path = id;
	var myurl = ms1 + ':' + port + '/' + path;

	request(myurl, function(error, response, body){
		res.write(body);
		res.end();
		return next();
	});
}
