COPY (
	SELECT geo_id,name,type,parent,osm_id,notes
	FROM jurisdictions ORDER BY geo_id
) TO '/var/www/html/places-db-admin/server/data/jurisdictions.csv' CSV HEADER;

COPY (
	SELECT uid,label,description
	FROM jurisdiction_types ORDER BY uid
) TO '/var/www/html/places-db-admin/server/data/jurisdiction_types.csv' CSV HEADER;