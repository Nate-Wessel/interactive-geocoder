import React, { Component } from 'react'
import Search from './Search.jsx'
import SelectedPlace from './SelectedPlace.jsx'

import { json } from 'd3-fetch'

const acceptedModes = new Set(['search','display','create','edit'])

export default class JurisdictionManager extends Component {
	constructor(props) { 
		super(props)
		this.state = { 
			selectedPlace: null
		}
		this.selectPlace = this.selectPlace.bind(this)
		this.unselectPlace = this.unselectPlace.bind(this)
	}
	selectPlace(place){
		this.setState({ selectedPlace: place })
	}
	unselectPlace(){
		this.setState({selectedPlace:null})
	}
	render() {
		if(this.state.selectedPlace){
			return (
				<div className="container">
					<button onClick={this.unselectPlace}>Return to Search</button>
					<SelectedPlace 
						place={this.state.selectedPlace}
						onNewPlaceSelection={this.selectPlace}/>
				</div>
			)
		}else{
			return <Search onSelection={this.selectPlace}/>
		}
	}
}
/*
export default class JurisdictionTool extends React.Component {
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
*/
