<?php
# returns json with unplaced place from DB

require 'config.php';

# connect to DB
$connection = pg_connect($DBconnectionString);

# select a random record
$query = "
	SELECT
		uid,
		country,
		subnational_region, 
		province, 
		metro_area,
		city,
		suburb,
		notes,
		osm_id,
		lat, lon
	FROM places 
	WHERE lat*lon IS NULL
	ORDER BY random()
	LIMIT 1;";
$result = pg_query($query);
$record = pg_fetch_object($result);

if(!$record){ // if no results returned
	echo json_encode( array('id'=>NULL) );
}else{ // return the results
	echo json_encode($record,JSON_NUMERIC_CHECK);
}
# close the connection
pg_close($connection);

?>
