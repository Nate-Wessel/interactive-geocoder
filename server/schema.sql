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
	point geometry(POINT,4326),
	full_polygon geometry(MULTIPOLYGON,4326),
	land_polygon geometry(MULTIPOLYGON,4326), -- full polygon but clipped to land
	notes text,
	UNIQUE (name, parent, type)
);
