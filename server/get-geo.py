from requests import get
from osm2geojson import json2shapes
from shapely.wkb import dumps as dumpWKB
import psycopg2
from time import sleep

conn_str = "host='localhost' dbname='APFC' user='nate' password='mink'"
connection = psycopg2.connect(conn_str)
connection.autocommit = True
cursor = connection.cursor()

overpass_url = "http://overpass-api.de/api/interpreter"


cursor.execute("""
	SELECT geo_id, osm_id 
	FROM jurisdictions 
	WHERE 
		full_polygon IS NULL AND
		osm_id IS NOT NULL;"""
)
for ( geo_id, osm_id ) in cursor.fetchall():
	print('working on',geo_id,osm_id)

	overpass_query = """
		[out:json][timeout:25];
		rel(id:{});
		out body;
		>;
		out skel qt;
	""".format(osm_id)

	response = get(overpass_url,params={'data': overpass_query})
	data = json2shapes(response.json())

	for datum in data:
		if datum['properties']['type'] == 'relation':
			cursor.execute(
				"""
					UPDATE jurisdictions 
					SET full_polygon = ST_SetSRID(
						ST_GeomFromWKB(%(polygon_wkb)s),
						4326
					)
					WHERE geo_id = %(geo_id)s;
				""",
				{
					'geo_id':geo_id,
					'polygon_wkb': dumpWKB(datum['shape'])
				}
			)
			
			break
	sleep(3)
