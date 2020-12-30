UPDATE jurisdictions SET point = 
	CASE
		WHEN osm_label IS NOT NULL THEN osm_label
		ELSE osm_admin_centre
	END