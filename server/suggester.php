<?php
# returns jurisdictions with similar names

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

if( array_key_exists('name',$_GET) and trim($_GET['name']) != '' ){
	$name = pg_escape_literal(trim($_GET['name']));
	$query = "
		WITH RECURSIVE places(orig_uid, uid, name,parent,level) AS (
			SELECT 
				uid AS orig_uid, uid, name, parent, 0 AS level
			FROM jurisdictions 
			WHERE similarity({$name},name) >= 0.1
			UNION ALL
			SELECT p.orig_uid, j.uid, j.name, j.parent, p.level+1
			FROM jurisdictions AS j, places AS p
			WHERE j.uid = p.parent
		)
		SELECT 
			orig_uid AS geo_id,
			string_agg(name, ', ' ORDER BY level ASC) AS addr
		FROM places
		GROUP BY orig_uid;";
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
