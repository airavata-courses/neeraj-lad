/*
 * Source:
 * http://restify.com/docs/home/
 * Gateway (gateway.js) listens on port 7080. It connects to the Microservice1 (ms1.js) which listens on port 8080.
 */

var restify = require('restify');
var request = require('request');
var url = require('url');
var amqp = require('amqplib/callback_api');

var hostname = 'rabbitmq';

var exchange = 'gateway_exchange';

var myName = 'gw';

var myKey = '#.gw.#';
var ms1Key = 'ms1';
var ms2Key = 'ms2';
var ms3Key = 'ms3';

var curReq, curRes, curNext;

var server = restify.createServer();
server.listen(7080, function(){
	console.log('%s listening at %s', server.name, server.url);
});

server.get('/:id', respond);

function sendResponseToClient(msg) {
	curRes.header('Access-Control-Allow-Origin', '*');
	curRes.header('Access-Control-Allow-Headers', 'X-Requested-With');
	curRes.setHeader('content-type', 'application/json');
	curRes.writeHead(200);
	curRes.write(msg)
	curRes.end();
	return curNext();
}

function respond(req, res, next){
	curReq = req;
	curRes = res;
	curNext = next;
	var id = req.params.id;
	send(ms1Key, id);
}

function send(key, msg) {
	amqp.connect('amqp://' + hostname, function(err, send_conn) {
	  send_conn.createChannel(function(err, send_ch) {
		var ex = exchange;
		send_ch.assertExchange(ex, 'topic', {durable: false});
		send_ch.publish(ex, key, new Buffer(msg));
		console.log(" [x] Sent %s:'%s'", key, msg);
	  });
	  setTimeout(function() { send_conn.close();}, 500);
	});
}

amqp.connect('amqp://' + hostname, function(err, conn) {
	conn.createChannel(function(err, ch) {
		var ex = exchange;
		ch.assertExchange(ex, 'topic', {durable: false});
		ch.assertQueue('', {exclusive: true}, function(err, q) {
			console.log(' [*] Waiting for messages. To exit press CTRL + C');
			ch.bindQueue(q.queue, ex, myKey);
			ch.consume(q.queue, function(message) {
				console.log(' [x] Received %s: %s', message.fields.routingKey, message.content.toString());
				var routingKey = message.fields.routingKey;
				var message = message.content.toString();
				if (routingKey === 'Response-from-microservice1-to-.' + myName)		send(ms2Key, message);
				if (routingKey === 'Response-from-microservice2-to-.' + myName)		send(ms3Key, message);
				if (routingKey === 'Response-from-microservice3-to-.' + myName)		sendResponseToClient(message);
			}, {noAck: true});
		});
	});
});
