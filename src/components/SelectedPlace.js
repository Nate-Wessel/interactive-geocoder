import React from 'react'
import PlacesList from './PlacesList.js'
import { json } from 'd3-fetch'

export default class SelectedPlace extends React.Component {
	constructor(props) {
		super(props)
		this.state = { 
			children:[],
			siblings:[]
		}
	}

	render() {
		let currentPlace = this.props.place
		let ancestors = []
		while(currentPlace.parent){ 
			ancestors.unshift(currentPlace=currentPlace.parent) 
		}
		let place = this.props.place
		return (
			<div id="selected-place">
				<h1>{place.name}</h1>
				<p>
					<b>Type:</b>{place.type_of}<br/>
					<b>geo_id:</b>{place.geo_id}<br/>
					<b>OSM_id:</b>{place.osm_id}
				</p>
				<div id="relations">
					<PlacesList id="parents" 
						onSelection={this.props.onNewPlaceSelection}
						places={ancestors}/>
					<PlacesList id="children"
						onSelection={this.props.onNewPlaceSelection}
						places={this.state.children}/>
					<PlacesList id="siblings" 
						onSelection={this.props.onNewPlaceSelection}
						places={this.state.siblings}/>
				</div>
			</div>
		)
	}
}
/*
		// async calls to get state from server
		json(`./server/jurisdiction.php?parent=${props.place.geo_id}`)
			.then(response=>{
				this.setState({children:response})
			})
*/
