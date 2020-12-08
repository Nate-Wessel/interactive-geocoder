import React, { Component }from 'react'
import RelatedPlacesList from './RelatedPlacesList.jsx'

export default function SelectedPlace(props) {
	let place = props.place
	// ancestors are stored directly with the place
	let currentPlace = place
	let ancestors = []
	while(currentPlace.parent){ 
		ancestors.unshift(currentPlace=currentPlace.parent) 
	}
	return (
		<div id="selected-place">
			<h1>{place.name}</h1>
			<p>
				<b>Type:</b> {place.type_of}<br/>
				<b>geo_id:</b> {place.geo_id}<br/>
				<b>OSM_id:</b> {place.osm_id}
			</p>
			<div id="relations">
				<RelatedPlacesList 
					title="Parents" 
					onSelection={props.onNewPlaceSelection}
					places={ancestors}/>
			</div>
		</div>
	)
}
/*

				<PlacesList id="siblings" 
					onSelection={props.onNewPlaceSelection}
					places={props.siblings}/>
				<PlacesList id="children"
					onSelection={props.onNewPlaceSelection}
					places={props.children}/>
*/
