<?php
# returns jurisdictions with similar names

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

if( array_key_exists('name',$_GET) and trim($_GET['name']) != '' ){
	$name = pg_escape_literal(trim($_GET['name']));
	$query = "
		SELECT * FROM jurisdictions_meta
		WHERE similarity({$name},name) >= 0.1;";
}else if( array_key_exists('geo_id',$_GET) and is_numeric($_GET['geo_id']) != '' ){
	$geo_id = pg_escape_literal(trim($_GET['geo_id']));
	$query = "SELECT * FROM jurisdictions_meta WHERE geo_id = {$geo_id};";
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
