from requests import get
from osm2geojson import json2shapes
from shapely.wkb import dumps as dumpWKB
import psycopg2
from psycopg2.extras import register_hstore
from time import sleep

conn_str = "host='localhost' dbname='APFC' user='nate' password='mink'"
connection = psycopg2.connect(conn_str)
connection.autocommit = True
cursor = connection.cursor()

register_hstore(connection)

overpass_url = "http://overpass-api.de/api/interpreter"

# records to process
cursor.execute("""
	SELECT geo_id, osm_id, name
	FROM jurisdictions 
	WHERE 
		osm_id IS NOT NULL AND
		point IS NULL AND 
		geo_id != 42
	LIMIT 40;"""
)
for ( geo_id, osm_id, name ) in cursor.fetchall():
	print('%s (%s) osm: %s'%(name,geo_id,osm_id))
	# gather the data
	overpass_query = """
		[out:json][timeout:25];
		rel(id:{});
		out body;
		>;
		out skel qt;
	""".format(osm_id)

	response = get(overpass_url,params={'data': overpass_query}).json()

	if len(response['elements']) == 0:
		print('no data returned by query for relation',osm_id)
		break

	# parse the data
	for element in response['elements']:
		if element['id'] == osm_id: # is the boundary relation
			tags = element['tags']
			labelID = centreID = -1
			for member in element['members']:
				if member['role'] == 'label': 
					labelID = member['ref']
				if member['role']	== 'admin_centre':
					centreID = member['ref']
			break
			
	print('label: %s, admin_centre: %s'%(labelID,centreID))
	
	geojson = json2shapes(response)

	label = admin_centre = None
	for feature in geojson:
		if feature['properties']['type'] == 'relation':
			polygon = dumpWKB(feature['shape'])
		elif feature['properties']['id'] == labelID:
			label = dumpWKB(feature['shape'])
		elif feature['properties']['id'] == centreID:
			admin_centre = dumpWKB(feature['shape'])
	
	cursor.execute(
		"""
			UPDATE jurisdictions 
			SET 
				osm_update = NOW(),
				osm_polygon = ST_SetSRID( ST_GeomFromWKB(%(polygon_wkb)s), 4326),
				osm_tags = %(tags)s,
				osm_label = ST_SetSRID( ST_GeomFromWKB(%(label)s), 4326),
				osm_admin_centre = ST_SetSRID( ST_GeomFromWKB(%(admin_centre)s), 4326)
			WHERE geo_id = %(geo_id)s;
		""",
		{
			'geo_id':geo_id,
			'polygon_wkb': polygon,
			'tags': tags,
			'label': label,
			'admin_centre': admin_centre
		}
	)
	
			
	sleep(1)
