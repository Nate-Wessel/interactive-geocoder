WITH RECURSIVE children(uid, name,parent) AS (
	
	SELECT 
		uid, name, parent 
	FROM jurisdictions 
	WHERE uid = 11

	UNION ALL
	
	SELECT j.uid, j.name, j.parent 
	FROM jurisdictions AS j, children AS c
	WHERE j.uid = c.parent
)
SELECT * FROM children;