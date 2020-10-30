<?php
# store updates to a place record, report changes made

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

# get the posted JSON data
$postedData = json_decode(file_get_contents('php://input'),false);

$geo_id = $postedData->geo_id;
unset($postedData->geo_id);

$currentData = pg_fetch_object(
	pg_query("SELECT * FROM places WHERE geo_id = $geo_id;")
);

// find values that have changed
$updates = [];
foreach($currentData as $key => $currentValue){
	// posted data with a corresponding key
	if( property_exists($postedData,$key) ){
		$newval = $postedData->$key;
		if( $currentValue != $newval ){ $updates[$key] = $newval; }
	}
}

$success = pg_update($connection,'places',$updates,array('geo_id'=>$geo_id));

/*
if(array_key_exists('point_geojson',$postedData)){
	if($postedData['point_geojson'] != ''){
		$point_geojson = pg_escape_literal($postedData['point_geojson']);
		$result = pg_query("
			UPDATE places SET 
				point = ST_GeomFromGeoJSON($point_geojson)
			WHERE geo_id = $geo_id;
		");
		if(!$result){ $success = false; }
	}
}
*/
$outcome = [ 'success' => $success, 'updated' => $updates ];

// return the record as updated
echo json_encode( $outcome );

# close the connection
pg_close($connection);
?>
