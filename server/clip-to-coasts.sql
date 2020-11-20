WITH relevant_land AS (
	SELECT
		geo_id,
		ST_Union(land.geom) AS geom 
	FROM land
	JOIN jurisdictions
		ON ST_Intersects(land.geom,full_polygon)
	WHERE geo_id = 35
	GROUP BY geo_id
)
UPDATE jurisdictions 
SET land_polygon = ST_Multi(ST_Intersection(full_polygon,relevant_land.geom))
FROM relevant_land
WHERE jurisdictions.geo_id = relevant_land.geo_id;