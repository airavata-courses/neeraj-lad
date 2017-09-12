/*
 * Source:
 * http://restify.com/docs/home/
 * Gateway (gateway.js) listens on port 7080. It connects to the Microservice1 (ms1.js) which listens on port 8080.
 */

var restify = require('restify');
var request = require('request');
var url = require('url');
var amqp = require('amqplib/callback_api');

var exchange = 'gateway_exchange';

var myKey = '#.gw.#';
var ms1Key = '#.ms1.#';
var ms2Key = '#.ms2.#';
var ms3Key = '#.ms3.#';

var server = restify.createServer();
server.listen(7080, function(){
	console.log('%s listening at %s', server.name, server.url);
});

server.get('/:id', respond);

function respond(req, res, next){
	var id = req.params.id;

	send(ms1Key, id, function(error, ms1ResID) {
		send(ms2Key, ms1ResID, function(error, ms2ResID) {
			send(ms3Key, ms2ResID, function(error, DBRow) {
				//call to respond
			});
		});
	});
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('content-type', 'application/json');
	res.writeHead(200);
	//res.write -> DBRow
	res.end();
	return next();
}

function send(key, msg) {
	amqp.connect('amqp://localhost', function(err, send_conn) {
	  send_conn.createChannel(function(err, send_ch) {
		var ex = exchange;
		send_ch.assertExchange(ex, 'topic', {durable: false});
		send_ch.publish(ex, key, new Buffer(msg));
		console.log(" [x] Sent %s:'%s'", key, msg);
	  });
	  setTimeout(function() { send_conn.close(); process.exit(0) }, 500);
	});
}

amqp.connect('amqp://localhost', function(err, conn) {
	conn.createChannel(function(err, ch) {
		var ex = exchange;
		ch.assertExchange(ex, 'topic', {durable: false});
		ch.assertQueue('', {exclusive: true}, function(err, q) {
			console.log(' [*] Waiting for messages. To exit press CTRL + C');
			ch.bindQueue(q.queue, ex, myKey);
			ch.consume(q.queue, function(message) {
				console.log(' [x] Received %s: %s', message.fields.routingKey, message.content.toString());
			}, {noAck: true});
		});
	});
});
