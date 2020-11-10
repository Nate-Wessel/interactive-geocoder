CREATE TABLE jurisdiction_types (
	uid serial PRIMARY KEY,
	"label" text UNIQUE
);

CREATE TABLE jurisdictions (
	geo_id serial PRIMARY KEY,
	name text,
	jurisdiction_type int REFERENCES jurisdiction_types (uid),
	parent int REFERENCES jurisdictions (uid),
	osm_id bigint UNIQUE,
	point geometry(POINT,4326),
	full_polygon geometry(MULTIPOLYGON,4326),
	land_polygon geometry(MULTIPOLYGON,4326),
	notes text,
	UNIQUE (name, parent)
);

CREATE VIEW jurisdictions_meta AS 
WITH RECURSIVE parents(orig_geo_id,geo_id,name,parent,level) AS (
	SELECT geo_id AS orig_geo_id, geo_id, name, parent, 0 AS level
	FROM jurisdictions 
	UNION ALL
	SELECT p.orig_geo_id, j.geo_id, j.name, j.parent, p.level+1
	FROM jurisdictions AS j, parents AS p
	WHERE j.geo_id = p.parent
), addr AS (
	SELECT 
		orig_geo_id AS geo_id,
		string_agg(name, ', ' ORDER BY level ASC) AS addr
	FROM parents
	GROUP BY orig_geo_id
)
SELECT 
	j.geo_id, name, addr, label AS is_a
FROM jurisdictions AS j
JOIN addr AS a
	ON j.geo_id = a.geo_id
JOIN jurisdiction_types AS jt
	ON j.jurisdiction_type = jt.uid;