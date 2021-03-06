CREATE TABLE jurisdiction_types (
	uid serial PRIMARY KEY,
	label text UNIQUE NOT NULL, -- e.g. 'city', 'province', 'country'
	description text
);

CREATE TABLE jurisdictions (
	geo_id serial PRIMARY KEY,
	name text,
	type int NOT NULL REFERENCES jurisdiction_types (uid),
	parent int REFERENCES jurisdictions (geo_id),
	osm_id bigint UNIQUE, -- basis of all geometry fields
	notes text,
	osm_update timestamptz, -- time when osm-derived data was pulled
	osm_tags hstore, -- OSM tags
	osm_polygon geometry(MULTIPOLYGON,4326),
	osm_label geometry(POINT,4326),
	osm_admin_centre geometry(POINT,4326),
	land_polygon geometry(MULTIPOLYGON,4326), -- clipped to coastline
	UNIQUE (name, parent, type)
);
CREATE INDEX ON jurisdictions USING GIST(osm_polygon);
CREATE INDEX ON jurisdictions USING GIST(land_polygon);

CREATE TABLE sisters (
	uid serial PRIMARY KEY,
	geo_id_canada integer REFERENCES jurisdictions (geo_id),
	geo_id_other integer REFERENCES jurisdictions (geo_id),
	year_start int,
	month_start int, 
	day_start int
);

-- get child depth in a view
CREATE OR REPLACE VIEW jurisdiction_depth AS (
	WITH RECURSIVE t (geo_id, parent, depth) AS (
		SELECT geo_id, parent, 0 AS depth
		FROM jurisdictions
		UNION 
		SELECT t.geo_id, j.parent, t.depth + 1 
		FROM t
		JOIN jurisdictions AS j ON t.parent = j.geo_id
	)
	SELECT geo_id, MAX(depth) AS depth
	FROM t 
	GROUP BY geo_id
);

-- export all the basics plus some derived fields in a view
CREATE OR REPLACE VIEW jurisdictions_plus AS 
SELECT 
	j.geo_id, 
	j.name,
	osm_tags->'name' AS name_loc,
	CASE 
		WHEN osm_tags->'name:en' IS NOT NULL THEN osm_tags->'name:en'
		ELSE j.name
	END AS name_en,
	CASE 
		WHEN osm_tags->'name:fr' IS NOT NULL THEN osm_tags->'name:fr'
		WHEN osm_tags->'name:en' IS NOT NULL THEN osm_tags->'name:en'
		ELSE j.name
	END AS name_fr,
	jt.label AS "type",
	jd.depth,
	osm_polygon,
	land_polygon,
	CASE
		WHEN osm_label IS NOT NULL THEN osm_label
		WHEN osm_admin_centre IS NOT NULL THEN osm_admin_centre
		ELSE ST_Centroid(osm_polygon)
	END AS point,
	osm_label, 
	osm_admin_centre
FROM jurisdictions AS j
JOIN jurisdiction_types AS jt ON j.type = jt.uid
JOIN jurisdiction_depth AS jd ON j.geo_id = jd.geo_id;

-- view on sister city relations with an eye toward exporting as geojson
CREATE OR REPLACE VIEW sister_jurisdictions AS 
WITH dups AS (
	SELECT 
		geo_id,
		case 
			WHEN geo_id = geo_id_canada THEN geo_id_other 
			ELSE geo_id_canada
		END as sister
	FROM jurisdictions_plus
	JOIN sisters
		ON geo_id = geo_id_canada OR geo_id = geo_id_other
)
SELECT 
	j.geo_id,
	array_to_json(array_agg(sister))::text AS links,
	json_build_object(
		'en', name_en,
		'fr', name_fr,
		'local', name_loc
	)::text AS name,
	point
FROM dups
JOIN jurisdictions_plus AS j 
	ON dups.geo_id = j.geo_id
GROUP BY j.geo_id, j.name_en, j.name_fr, j.name_loc, point;
