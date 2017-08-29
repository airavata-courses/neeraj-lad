/*Source:
 *http://restify.com/docs/home/
 *Gateway runs on port 7080. It connects to the first microservice ms1.js which runs on port 8080
 */

var restify = require('restify');
var request = require('request');
var url = require('url');

var server = restify.createServer();
server.listen(7080, function(){
	console.log('%s listening at %s', server.name, server.url);
});
server.get('/?id=:id', respond);

function respond(req, res, next){
	res.setHeader('content-type', 'application/json');
	res.writeHead(200);

	var par = url.parse(req.url, true).query;
	var id = par.id;
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
