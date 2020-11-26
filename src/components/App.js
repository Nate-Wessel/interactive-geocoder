import React from 'react'
import Search from './Search.js'
import SelectedPlace from './SelectedPlace.js'

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
		this.showSelectedPlace = this.showSelectedPlace.bind(this);
	}
	showSelectedPlace(){
		if(this.state.selectedPlace){
			return (
				<SelectedPlace 
					place={this.state.selectedPlace}
					children={this.state.selectedPlaceChildren}
					siblings={this.state.selectedPlaceSiblings}
					onNewPlaceSelection={this.handlePlaceSelection}/>
			)
		}else{
			return <div/>
		}
		
	}
	handlePlaceSelection(place){
		console.log('new place selected',place)
		this.setState({selectedPlace:place})
		this.setState({selectedPlaceChildren:[]})
		this.setState({selectedPlaceSiblings:[]})
		// fetch data on relations
		json(`./server/jurisdiction.php?parent=${place.geo_id}`)
			.then( children => { 
				this.setState({selectedPlaceChildren:children}) 
			} )
		if(place.parent){
			json(`./server/jurisdiction.php?parent=${place.parent.geo_id}`)
				.then( response => {
					siblings = response.filter(sib=>sib.geo_id!=place.geo_id) 
					this.setState({selectedPlaceSiblings:siblings}) 
				} )
		}
	}
	render() {	
		return (
			<div id="app">
				<Search onSelection={this.handlePlaceSelection}/>
				{this.showSelectedPlace()}
			</div>
		)
	}
}
