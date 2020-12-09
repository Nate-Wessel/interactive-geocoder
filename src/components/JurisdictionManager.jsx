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
