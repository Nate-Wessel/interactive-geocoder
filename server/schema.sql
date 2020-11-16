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
	land_polygon geometry(MULTIPOLYGON,4326), -- clipped to coastline
	notes text,
	UNIQUE (name, parent, type)
);
CREATE INDEX ON jurisdictions USING GIST(full_polygon);
CREATE INDEX ON jurisdictions USING GIST(land_polygon);
