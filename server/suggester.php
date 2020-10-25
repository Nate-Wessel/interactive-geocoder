<?php
# returns places similar to current entry

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

$addr = pg_escape_literal($_GET['addr']);

$query = "
	SELECT geo_id, addr
	FROM places_addr
	ORDER BY similarity({$addr},addr) DESC
	LIMIT 8;";
$result = pg_query($query);
$records = pg_fetch_all($result);

echo json_encode($records,JSON_NUMERIC_CHECK);

# close the connection
pg_close($connection);
?>
