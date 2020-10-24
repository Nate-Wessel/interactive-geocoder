<?php
# store updates to a place record, report changes made

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

# get the posted JSON data
$postedData = json_decode(file_get_contents('php://input'), true);

$geo_id = $postedData['geo_id'];
unset($postedData['geo_id']);

$extantData = pg_fetch_array(
	pg_query("SELECT * FROM places WHERE geo_id = $geo_id;")
);

// find values that have changed, only updating those
$newData = [];
foreach($extantData as $key => $currentValue){
	// posted data with a corresponding key
	if( array_key_exists($key,$postedData) ){
		// set empty strings to null
		$newval = $postedData[$key] == '' ? NULL : $postedData[$key];
		if( $newval != $currentValue ){
			$newData[$key] = $newval;
		}
	}
}

$success = pg_update( $connection, 'places', $newData, ['geo_id'=>$geo_id] );

$outcome = [
	'success' => $success,
	'updated' => $success ? $newData : 'nothing to update'
];

// return the record as updated
echo json_encode( $outcome );

# close the connection
pg_close($connection);
?>
