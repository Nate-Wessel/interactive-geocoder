CREATE TABLE places2 (
	geo_id serial PRIMARY KEY,
	country text,
	subnational_region text,
	province text,
	metro text,
	county text,
	city text,
	district text,
	unique(
		country, subnational_region,
		province, metro, county, 
		city, district
	),
	osm_id bigint UNIQUE,
	point geometry(Point,4326),
	polygon geometry(MultiPolygon,4326),
	notes text
);

CREATE OR REPLACE VIEW places_addr AS 
SELECT 
	geo_id,
	concat_ws(', ',
		district, 
		city, 
		county, 
		metro, 
		province, 
		subnational_region, 
		country
	) AS addr
FROM places;

CREATE OR REPLACE VIEW places_form AS 
SELECT 
	geo_id,
	country,
	subnational_region,
	province, 
	metro,
	county, 
	city,
	district, 
	osm_id,
	notes,
	ST_AsGeoJSON(point) AS point_geojson,
	ST_AsGeoJSON(polygon) AS polygon_geojson
FROM places;
