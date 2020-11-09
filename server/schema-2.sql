CREATE TABLE jurisdiction_types (
	uid serial PRIMARY KEY,
	"label" text UNIQUE
);

CREATE TABLE jurisdictions (
	uid serial PRIMARY KEY,
	name text,
	jurisdiction_type int REFERENCES jurisdiction_types (uid),
	parent int REFERENCES jurisdictions (uid),
	osm_id bigint,
	point geometry(POINT,4326),
	full_polygon geometry(MULTIPOLYGON,4326),
	land_polygon geometry(MULTIPOLYGON,4326),
	notes text,
	UNIQUE (name, parent)
);