<?php
# store updates to a place record, report changes made

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

# get the posted JSON data
$postedData = json_decode(file_get_contents('php://input'), true);

$geo_id = $postedData['geo_id'];
unset($postedData['geo_id']);

$currentData = pg_fetch_array(
	pg_query("SELECT * FROM places_form WHERE geo_id = $geo_id;")
);

// find values that have changed, only updating those
$success = true;
$updates = [];
foreach($currentData as $key => $currentValue){
	// posted data with a corresponding key
	if( array_key_exists($key,$postedData) ){
		// set empty strings to null
		$newval = $postedData[$key] == '' ? NULL : $postedData[$key];
		if( $newval != $currentValue ){
			
			$updates[$key] = [ $currentValue, $newval ];
		}
	}
}

if(array_key_exists('point_geojson',$postedData)){
	if($postedData['point_geojson'] != ''){
		$point_geojson = pg_escape_literal($postedData['point_geojson']);
		pg_query("
			UPDATE places SET 
				point = ST_GeomFromGeoJSON($point_geojson)
			WHERE geo_id = $geo_id;
		");
	}
}

$outcome = [ 'success' => $success, 'updated' => $updates ];

// return the record as updated
echo json_encode( $outcome );

# close the connection
pg_close($connection);
?>
