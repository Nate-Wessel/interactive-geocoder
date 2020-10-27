<?php
# returns places similar to current entry

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

if(array_key_exists('addr',$_GET)){
	$addr = pg_escape_literal($_GET['addr']);
	$query = "
		SELECT geo_id, addr
		FROM places_addr
		ORDER BY similarity({$addr},addr) DESC
		LIMIT 8;";
}elseif(array_key_exists('geo_id',$_GET)){
	$geo_id = pg_escape_literal($_GET['geo_id']);
	$query = "
		SELECT geo_id, addr
		FROM places_addr
		WHERE geo_id = {$geo_id};";
}

if(isset($query)){
	$result = pg_query($query);
	$records = pg_fetch_all($result);
	echo json_encode($records,JSON_NUMERIC_CHECK);
}else{
	echo '[]';
}

# close the connection
pg_close($connection);
?>
