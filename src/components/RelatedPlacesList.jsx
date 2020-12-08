import React, { Component } from 'react'
import { displayName } from './placeDisplayName.js'

export default class RelatedPlacesList extends Component{
	constructor(props) { 
		super(props)
		this.state = {
			collapsed: true,
			places: props.places ? props.places : [],
			havePlaces: props.places ? true : false
		}
		this.toggleDisplay = this.toggleDisplay.bind(this)
	}
	toggleDisplay(){
		this.setState({collapsed:!this.state.collapsed})
	}
	render(){
		let title = <h3 onClick={this.toggleDisplay}>{this.props.title}</h3>
		if(this.state.collapsed){ 
			return <div>{title}</div> 
		}
		let places = this.state.places.map( place => {
			return (
				<li key={place.geo_id}
					onClick={(event)=>this.props.onSelection(place)}>
					{displayName(place)}
				</li>
			)
		})
		return (
			<div>
				{title}
				<ul className="place-list">{places}</ul>
			</div>
		)
	}
}
