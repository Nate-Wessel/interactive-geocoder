import React from 'react'
import PlacesList from './PlacesList.js'

export default class SelectedPlace extends React.Component {
	render() {
		let place = this.props.place
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
					<PlacesList id="parents" 
						onSelection={this.props.onNewPlaceSelection}
						places={ancestors}/>
					<PlacesList id="siblings" 
						onSelection={this.props.onNewPlaceSelection}
						places={this.props.siblings}/>
					<PlacesList id="children"
						onSelection={this.props.onNewPlaceSelection}
						places={this.props.children}/>
				</div>
			</div>
		)
	}
}
