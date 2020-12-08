import React from 'react'
import Search from './Search.jsx'
import SelectedPlace from './SelectedPlace.jsx'

import { json } from 'd3-fetch'

export default class App extends React.Component {
	constructor(props) { 
		super(props)
		this.state = {
			selectedPlace: null,
			selectedPlaceChildren: [],
			selectedPlaceSiblings: []
		}
		this.handlePlaceSelection = this.handlePlaceSelection.bind(this);
	}
	handlePlaceSelection(place){
		this.setState({
			selectedPlace: place,
			selectedPlaceChildren: [],
			selectedPlaceSiblings: []
		})
		// fetch data on relations
		json(`./server/jurisdiction.php?parent=${place.geo_id}`)
			.then( children => { 
				children.sort((a,b)=> a.name < b.name ? -1 : 1 )
				this.setState( { selectedPlaceChildren: children } ) 
			} )
		if(place.parent){
			json(`./server/jurisdiction.php?parent=${place.parent.geo_id}`)
				.then( response => {
					siblings = response.filter(sib=>sib.geo_id!=place.geo_id)
					siblings.sort((a,b)=> a.name < b.name ? -1 : 1 ) 
					this.setState({selectedPlaceSiblings:siblings}) 
				} )
		}
	}
	render() {
		return (
			<div id="app">
				<Search onSelection={this.handlePlaceSelection}/>
				<SelectedPlace 
					place={this.state.selectedPlace}
					children={this.state.selectedPlaceChildren}
					siblings={this.state.selectedPlaceSiblings}
					onNewPlaceSelection={this.handlePlaceSelection}/>
			</div>
		)
	}
}
