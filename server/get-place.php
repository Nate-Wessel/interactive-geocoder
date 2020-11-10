<?php
# returns json with place from DB

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

if(array_key_exists('geo_id',$_GET)){
	$geo_id = pg_escape_literal($_GET['geo_id']);
	$query = "SELECT * FROM jurisdictions WHERE geo_id = $geo_id;";
}else{
	# select a random record
	$query = "SELECT * FROM jurisdictions ORDER BY random() LIMIT 1;";
}
$result = pg_query($query);
$record = pg_fetch_object($result);
//$record->point_geojson = json_decode($record->point_geojson);
//$record->polygon_geojson = json_decode($record->polygon_geojson);

if(!$record){ // if no results returned
	echo json_encode( array('id'=>NULL) );
}else{ // return the results
	echo json_encode($record,JSON_NUMERIC_CHECK);
}
# close the connection
pg_close($connection);

?>
