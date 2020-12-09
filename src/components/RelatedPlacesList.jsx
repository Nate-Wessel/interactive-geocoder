import React, { Component } from 'react'
import { displayName } from './placeDisplayName.js'
import { json } from 'd3-fetch'

export default class RelatedPlacesList extends Component{
	constructor(props) { 
		super(props)
		this.state = {
			collapsed: true,
			havePlaces: props.places ? true : false,
			places: props.places ? props.places : []
		}
		this.toggleDisplay = this.toggleDisplay.bind(this)
		this.fetchRelations = this.fetchRelations.bind(this)
	}
	toggleDisplay(){
		// check if we need to get data still
		if( this.state.collapsed && ! this.state.havePlaces ){
			this.fetchRelations()
		}
		this.setState({collapsed:!this.state.collapsed})
	}
	fetchRelations(){
		this.setState({havePlaces: true})
		if(this.props.parent){
			console.log(`requesting children of ${this.props.parent.geo_id}`)
			json(`./server/jurisdiction.php?parent=${this.props.parent.geo_id}`)
				.then( children => { 
					children.sort((a,b)=> a.name < b.name ? -1 : 1 )
					this.setState( { places: children } )
				} )
		}else if(this.props.sibling){
			let parent = this.props.sibling.parent
			if(parent){
				json(`./server/jurisdiction.php?parent=${parent.geo_id}`)
					.then( children => { 
						let siblings = children
							.filter(sib=>sib.geo_id!=this.props.sibling.geo_id)
							.sort((a,b)=> a.name < b.name ? -1 : 1 )
						this.setState( { places: siblings } )
					} )
			}
		}
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
