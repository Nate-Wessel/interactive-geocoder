<?php
# returns json with place from DB

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

if(array_key_exists('geo_id',$_GET)){
	$geo_id = pg_escape_literal($_GET['geo_id']);
	$result = pg_query("SELECT * FROM places WHERE geo_id = $geo_id;");
}else{
	# select a random record
	$query = "
		SELECT *
		FROM places 
		ORDER BY random()
		LIMIT 1;";
	$result = pg_query($query);
}

$record = pg_fetch_object($result);

if(!$record){ // if no results returned
	echo json_encode( array('id'=>NULL) );
}else{ // return the results
	echo json_encode($record,JSON_NUMERIC_CHECK);
}
# close the connection
pg_close($connection);

?>
