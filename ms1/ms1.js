/*
 * Source:
 *https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html
 */

var amqp = require('amqplib/callback_api');

var exchange = 'gateway_exchange';

var myName = 'microservice1';

var myKey = '#.ms1.#';
var gwKey = 'gw';

function send(key, msg) {
	amqp.connect('amqp://localhost', function(err, send_conn) {
	  send_conn.createChannel(function(err, send_ch) {
		var ex = exchange;
		send_ch.assertExchange(ex, 'topic', {durable: false});
		send_ch.publish(ex, key, new Buffer(msg));
		console.log(" [x] Sent %s:'%s'", key, msg);
	  });
	  setTimeout(function() { send_conn.close(); }, 500);
	});
}

function process(message) {
	//processing on message here
	//for now is a dummy function and does not do anything
	return message;
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
				send('Response-from-' + myName + '-to-.' + gwKey, process(message.content.toString()));
			}, {noAck: true});
		});
	});
});
