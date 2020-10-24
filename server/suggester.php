<?php
# returns places similar to current entry

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

$s = $_GET['s'];

$query = "
	SELECT 
		geo_id,
		concat_ws(',', 
			district, city, county, 
			metro, province, subnational_region, country
		) AS q
	FROM places
	ORDER BY similarity(
		'$s',
		concat_ws(',', 
			district, city, county, 
			metro, province, subnational_region, country
		)
	) DESC
	LIMIT 10;";
$result = pg_query($query);
$records = pg_fetch_all($result);

echo json_encode($records,JSON_NUMERIC_CHECK);

# close the connection
pg_close($connection);
?>
