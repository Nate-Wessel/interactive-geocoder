CREATE TABLE places (
	uid serial,
	world_region text,
	country text,
	subnational_region text,
	province text,
	metro_area text,
	city text,
	suburb text, -- ie district, neighborhood, locality, etc
	notes text,
	lat numeric,
	lon numeric,
	point geometry(Point,4326),
	polygon geometry(Polygon,4326),
	edit_flag boolean DEFAULT TRUE -- use to flag records for processing
);