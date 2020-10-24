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
