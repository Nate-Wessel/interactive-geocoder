import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { displayName } from './placeDisplayName.js'
import { json } from 'd3-fetch'
import { publicAPI } from './API.js'

export default function RelatedPlacesList(props){
	const [collapsed,setCollapsed] = useState(true)
	const [places,setPlaces] = useState([])

	useEffect(()=>{
		// get the related places
		if(props.child){ getAncestors(props.child) }
		else if(props.sibling){ getSiblings(props.sibling) }
		else if(props.parent){ getChildren(props.parent) }
		// reset on update to props
		return () => { setPlaces([]) }
	},[props.child,props.sibling,props.parent])

	let title = (
		<h3 onClick={()=>setCollapsed(!collapsed)}>
			{`${props.title} (${places.length})`}
		</h3>
	)
	
	if(collapsed){ return <div>{title}</div> }
	
	let placesList = places.map( place => {
		return (
			<li key={place.geo_id}>
				<Link to={`/${place.geo_id}`}>{displayName(place)}</Link>
			</li>
		)
	})
	return (
		<div>
			{title}
			<ul className="place-list">{placesList}</ul>
		</div>
	)
	function getAncestors(place){
		// ancestors are stored directly with the place
		let ancestors = []
		while(place.parent){ ancestors.unshift(place=place.parent) }
		setPlaces(ancestors)
	}
	function getSiblings(place){
		if(place.parent){
			json(`${publicAPI}?parent=${place.parent.geo_id}`)
				.then( children => { 
					let siblings = children
						.filter(sib=>sib.geo_id!=place.geo_id)
						.sort((a,b)=> a.name < b.name ? -1 : 1 )
					setPlaces(siblings)
				} )
		}
	}
	function getChildren(place){
		json(`${publicAPI}?parent=${place.geo_id}`)
			.then( children => { 
				children.sort((a,b)=> a.name < b.name ? -1 : 1 )
				setPlaces(children)
			} )	
	}
}
