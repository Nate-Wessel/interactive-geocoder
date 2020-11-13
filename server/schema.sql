CREATE TABLE risk_categories (
	uid serial PRIMARY KEY,
	title text,
	description text
);

CREAT TABLE risk_components (
	uid serial PRIMARY KEY,
	category integer REFERENCES risk_categories (uid),
	title text,
	description text
);

CREATE TABLE jurisdiction_types (
	uid serial PRIMARY KEY,
	label text UNIQUE, -- e.g. 'city', 'province', 'country'
	description text
);

CREATE TABLE jurisdictions (
	geo_id serial PRIMARY KEY,
	name text,
	type int REFERENCES jurisdiction_types (uid),
	parent int REFERENCES jurisdictions (geo_id),
	osm_id bigint UNIQUE, -- basis of all geometry fields
	point geometry(POINT,4326),
	full_polygon geometry(MULTIPOLYGON,4326),
	land_polygon geometry(MULTIPOLYGON,4326), -- full polygon but clipped to land
	notes text,
	UNIQUE (name, parent, type)
);

CREATE TABLE events (
	uid serial PRIMARY KEY,
	title text, -- display title, not necessarily title of article
	archive_link text UNIQUE, -- link to news story archived on https://web.archive.org/ (if paywall not a problem)
	archive_pdf text UNIQUE, -- reference to a local filesystem (if paywall a problem)
	justification text -- brief description of why this event is being tracked
);

CREATE TABLE event_links (
	uid serial PRIMARY KEY,
	from_event integer REFERENCES events (uid),
	to_event integer REFERENCES events (uid),
	description text -- optional
);

CREATE TABLE risk_event_assessments (
	uid serial PRIMARY KEY,
	event_uid integer REFERENCES events (uid),
	jurisdiction_uid integer REFERENCES jurisdictions (geo_id)
	component_uid integer REFERENCES risk_components (uid),
	assessment smallint CHECK ( assessment >= -5 AND assessment <= 5 ) -- likert scales
);

CREATE TABLE risk_changes (
	uid serial PRIMARY KEY,
	description text,
);


