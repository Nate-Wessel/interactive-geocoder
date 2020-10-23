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

$allowedKeys = ['country','province','city','suburb','lat','lon'];
$data = array_filter(
	$cleanedVars,
	function($key) use ($allowedKeys){ return in_array($key, $allowedKeys); },
	ARRAY_FILTER_USE_KEY
);

$success = pg_update( $connection, 'places', $data, array('uid'=>$uid) );

$query = "SELECT * FROM places WHERE uid = $uid;";
$result = pg_query($connection,$query);

// return the record as updated
echo json_encode( pg_fetch_object($result) );

//echo json_encode( $success );

# close the connection
pg_close($connection);
?>
