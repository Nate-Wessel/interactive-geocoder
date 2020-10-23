<?php
# store updates to a place record, report success

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

# get the posted JSON data
$postedVars = json_decode(file_get_contents('php://input'), true);

$uid = $postedVars['uid'];

// set empty strings to null
$cleanedVars = array_map(  
	function($val){ return $val == '' ? NULL : $val; },
	$postedVars
);

$allowedKeys = ['country','province','metro_area','city','suburb','lat','lon'];
$data = array_filter(
	$cleanedVars,
	function($key) use ($allowedKeys){ return in_array($key, $allowedKeys); },
	ARRAY_FILTER_USE_KEY
);

$success = pg_update( $connection, 'places', $data, ['uid'=>$uid] );

$outcome = [
	'success' => $success,
	'updated' => $success ? $data : 'nadda'
];

// return the record as updated
echo json_encode( $outcome );

# close the connection
pg_close($connection);
?>
