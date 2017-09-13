<?php

/*
 * Source:
 * https://coolestguidesontheplanet.com/how-to-connect-to-a-mysql-database-with-php/
 *
 */

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

$exchange = 'gateway_exchange';

$myName = 'microservice3';

$myKey = '#.ms3.#';
$gwKey = 'gw';

function dBConnect() {
	static $conn;
	if (!isset($conn)) {
		$config = parse_ini_file('./config.ini');
		$conn = mysqli_connect($config['servername'], $config['username'], $config['password'], $config['dbname']);
	}

    // If connection was not successful, handle the error
    if($conn === false) {
        return mysqli_connect_error();
    }
    return $conn;
}

function getDBRow($id) {
	$conn = dBConnect();
	if ($conn->connection_error)	die('Connection Failed: '.$conn->connect_error);

	$sql = "SELECT * FROM `Movies` WHERE `Rank` = ".$id;
	$res = $conn->query($sql) or die(mysql_error());

	$result = "";
	while ($row = $res->fetch_assoc()) {
		foreach($row as $key => $value) {
			$result .= $key;
			$result .= ":";
			$result .= $value;
			$result .= ", ";
		}
	}
	return $result."\n";
}

function send($key, $data) {
	global $exchange;
	
	$send_conn = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
	$send_ch= $send_conn->channel();

	$exchange = 'gateway_exchange';
	$send_ch->exchange_declare($exchange, 'topic', false, false, false);

	$routing_key = $key;
	$msg = new AMQPMessage($data);
	$send_ch->basic_publish($msg, $exchange, $routing_key);

	echo " [x] Sent ",$routing_key,':',$data," \n";

	$send_ch->close();
	$send_conn->close();
}

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->exchange_declare($exchange, 'topic', false, false, false);

list($queue_name, ,) = $channel->queue_declare("", false, false, true, false);

$binding_key = $myKey;
$channel->queue_bind($queue_name, $exchange, $binding_key);

echo ' [*] Waiting for logs. To exit press CTRL+C', "\n";

$callback = function($msg){
	global $myName;
	global $gwKey;
	echo ' [x] Received ',$msg->delivery_info['routing_key'], ':', $msg->body, "\n";
	$dBRow = getDBRow($msg->body);
	send('Response-from-'.$myName.'-to-.'.$gwKey, $dBRow);
};

$channel->basic_consume($queue_name, '', false, true, false, false, $callback);

while(count($channel->callbacks)) {
    $channel->wait();
}

$channel->close();
$connection->close();

?>
