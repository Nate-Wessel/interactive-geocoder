import React from 'react'
import Search from './Search.js'
import SelectedPlace from './SelectedPlace.js'

export default class App extends React.Component {
	constructor(props) { 
		super(props)
		this.state = {
			selectedPlace: null
		}
		this.handlePlaceSelection = this.handlePlaceSelection.bind(this);
		this.showSelectedPlace = this.showSelectedPlace.bind(this);
	}
	showSelectedPlace(){
		if(this.state.selectedPlace){
			return (
				<SelectedPlace 
					place={this.state.selectedPlace}
					onNewPlaceSelection={this.handlePlaceSelection}/>
			)
		}else{
			return <div/>
		}
		
	}
	handlePlaceSelection(place){
		console.log('new place selected',place)
		this.setState({selectedPlace:place})
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
