<?php

/*
 * Source:
 * https://coolestguidesontheplanet.com/how-to-connect-to-a-mysql-database-with-php/
 * Microservice3 (ms3.php) listens on port 9080. It connects to the MySQL database.
 *
 */

$id = $_GET['id'];

$servername = '127.0.0.1';

//Add your MySQL credentials here
$username = 'root';
$password = 'admin';
$dbname = 'sga-neeraj-lad-asgn1';

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error)	die('Connection Failed: '.$conn->connect_error);

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
echo $result;
?>
