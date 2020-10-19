<?php
#quickly return json containing randomly selected OD points from server-side DB

require 'config.php';

$_POST = json_decode(file_get_contents('php://input'), true);

# connect to DB
$connection = pg_connect($DBconnectionString);

# get the POST variables. We know what to expect, so 
# there is little checking needed
$uid      =	pg_escape_literal($_POST['uid']);
$country  = pg_escape_literal($_POST['country']);
$province = pg_escape_literal($_POST['province']);
$city     = pg_escape_literal($_POST['city']);
$suburb   = pg_escape_literal($_POST['suburb']);

$query = "
	UPDATE places SET 
		country = $country,
		province = $province,
		city = $city,
		suburb = $suburb
	WHERE uid = $uid;
	SELECT * FROM places WHERE uid = $uid;";
$result = pg_query($connection,$query);

// return the record as updated
echo json_encode( pg_fetch_object($result) );

# close the connection
pg_close($connection);
?>
