CREATE TABLE places (
	uid serial,
	region text,
	country text,
	province text,
	city text,
	lat numeric,
	lon numeric,
	point geometry(Point,4326)
);
