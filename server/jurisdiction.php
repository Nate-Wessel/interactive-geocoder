<?php 
// handles requests, updates, and additions to jurisdictions

# connect to DB
require 'config.php';
$connection = pg_connect($DBconnectionString);

$response = null;

switch($_SERVER['REQUEST_METHOD']){
	case 'GET':
		if(array_key_exists('geo_id',$_GET)){
			$response = getRecord($_GET['geo_id']);
		}else if(array_key_exists('search',$_GET)){
			$response = getRecords($_GET['search']);
		}else if(array_key_exists('parent',$_GET)){
			$response = getChildrenOf($_GET['parent']);
		}else if(array_key_exists('types',$_GET)){
			$response = getTypes();
		}
		break;
	default: // TODO add support for POST, PATCH, DELETE
		echo json_encode(['error'=>'method not yet supported']);
		break;
}
echo json_encode($response,JSON_NUMERIC_CHECK);

# close the connection
pg_close($connection);

function getRecord($geo_id){
	$geo_id = pg_escape_literal($geo_id);
	$query = "
		SELECT 
			geo_id,
			name, 
			jt.label AS type_of,
			parent, 
			osm_id
		FROM jurisdictions AS j
		JOIN jurisdiction_types AS jt 
			ON j.jurisdiction_type = jt.uid
		WHERE geo_id = $geo_id;";
	$record = pg_fetch_object( pg_query($query) );
	if( $record and !is_null($record->parent) ){
		$record->parent = getRecord($record->parent);
	}
	return $record;
}

function getRecords($searchTerm){
	$searchTerm = pg_escape_literal($searchTerm);
	$query = "
		SELECT geo_id 
		FROM jurisdictions
		WHERE similarity({$searchTerm},name) >= 0.1
		ORDER BY similarity({$searchTerm},name) DESC;";
	$results = pg_query($query);
	$searchResults = [];
	while($record = pg_fetch_object($results)){
		array_push($searchResults,getRecord($record->geo_id));
	}
	return $searchResults;
}

function getChildrenOf($geo_id){
	$geo_id = pg_escape_literal($geo_id);
	$query = "
		SELECT geo_id 
		FROM jurisdictions 
		WHERE parent = {$geo_id}";
	$results = pg_query($query);
	$children = [];
	while($record = pg_fetch_object($results)){
		array_push($children,getRecord($record->geo_id));
	}
	return $children;
}

function getTypes(){
	$query = "SELECT * FROM jurisdiction_types;";
	return pg_fetch_all( pg_query($query) );
}

?>
