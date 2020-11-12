<?php 
// CRU(D) jurisdictions

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
	case 'POST':
		$postedData = json_decode(file_get_contents('php://input'),false);
		$response = insertRecord($postedData);
		break;
	case 'PATCH':
		$postedData = json_decode(file_get_contents('php://input'),false);
		$response = updateRecord($postedData);
		break;
	default: // TODO add support for POST, PATCH, DELETE
		echo json_encode(['error'=>'method not yet supported']);
		break;
}
// returns JSON-formatted data for all methods
echo json_encode($response,JSON_NUMERIC_CHECK);

# close the connection
pg_close($connection);

function updateRecord($data){
	$geo_id = pg_escape_literal($data->geo_id);
	foreach($data as $key => $value){
		$field = pg_escape_identifier($key);
		$escapedValue = pg_escape_literal($value);
		$query = "
			UPDATE jurisdictions SET $field = $escapedValue
			WHERE geo_id = $geo_id";
	}
	return getRecord($data->geo_id);
}

function insertRecord($data){
	$name = pg_escape_literal($data->name);
	$parent = pg_escape_literal($data->parent);
	$jurisdiction_type = pg_escape_literal($data->jurisdiction_type);
	$osm_id = pg_escape_literal($data->osm_id);
	$success = pg_query("
		INSERT INTO jurisdictions ( name, parent, jurisdiction_type, osm_id ) 
		VALUES ( $name, $parent, $jurisdiction_type, $osm_id )");
	if($success){
		$result = pg_query("Select geo_id WHERE name=$name AND parent=$parent;");
		return getRecord(pg_fetch_result($result));
	}else{
		return pg_last_error();
	}
	
}

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
