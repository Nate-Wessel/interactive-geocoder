# Interactive Geocoder

This is an attempt to add some quick human validation to simple batch geocoding tasks. 

An address, as given, is pulled out of a database, geocoded with a given service, and shown on a map. If good, the result (one of them) may be accepted to be returned to the server for storage alongside the address in the database. _Geocoding complete!_

If the result is ambiguous or there are multiple conflicting results, one of these may be selected or the address may need manual correction or reformatting before being sent out for a second try. If a corrected address gives a satisfactory result, the new address string will be stored as well. 
