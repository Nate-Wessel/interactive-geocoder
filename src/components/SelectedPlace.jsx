import React from 'react'
import RelatedPlacesList from './RelatedPlacesList.jsx'
import AddFeatureForm from './AddFeatureForm.jsx'

export default function SelectedPlace(props) {
	return (
		<div id="selected-place">
			<h1>{props.place.name}</h1>
			<p>
				<b>Type:</b> {props.place.type_of}<br/>
				<b>geo_id:</b> {props.place.geo_id}<br/>
				<b>OSM_id:</b> {props.place.osm_id}
			</p>
			<button onClick={()=>{}}>Add Child</button>
			<AddFeatureForm parent={props.place}/>
			<div id="relations">
				<RelatedPlacesList title="Parents"  child={props.place}
					onSelection={props.onNewPlaceSelection}/>
				<RelatedPlacesList title="Siblings" sibling={props.place}
					onSelection={props.onNewPlaceSelection}/>
				<RelatedPlacesList title="Children" parent={props.place} 
					onSelection={props.onNewPlaceSelection}/>
			</div>
		</div>
	)
}
