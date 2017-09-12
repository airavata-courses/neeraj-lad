/*
 * Source:
 * http://restify.com/docs/home/
 * Microservice1 (ms1.js) listens on port 8080. It connects to Microservice2 (ms2.py) which listens on port 5000.
 *
 */

var restify = require('restify');
var request = require('request');
var amqp = require('amqplib/callback_api');

var exchange = 'gateway_exchange';

var myKey = '#.ms1.#';
var gwKey = '#.gw.#';

var ms1 = restify.createServer();
ms1.listen(8080, function(){
	console.log('%s listening at %s', ms1.name, ms1.url);
});

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
				send(gwKey, message.content.toString());
			}, {noAck: true});
		});
	});
});
