import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { displayName } from '../placeDisplayName.js'
import PlacesList from '../PlacesList' 
import { json } from 'd3-fetch'
import { publicAPI } from '../API.js'

function Children(props){
	const [places,setPlaces] = useState([])
	useEffect(()=>{
		json(`${publicAPI}?parent=${props.parent}`)
			.then( children => { 
				children.sort((a,b)=> a.name < b.name ? -1 : 1 )
				setPlaces(children)
			} )
	},[props.parent])
	return (
		<div>
			<h3
			{ ! collapsed && <PlacesList places={places}/> }
		</div>
	)
}

export default function(){
	const { geo_id } = useParams()
	return (
		<div id="relations">
			<RelatedPlaces title="Parents"  child={geo_id}/>
			<RelatedPlaces title="Siblings" sibling={geo_id}/>
			<Children parent={geo_id}/>
		</div>
	)
}

function RelatedPlaces(props){
	const [collapsed,setCollapsed] = useState(true)
	const [places,setPlaces] = useState([])

	useEffect(()=>{
		// get the related places
		if(props.child){ 
			getAncestors(props.child) 
		}
		else if(props.sibling){ 
			getSiblings(props.sibling) 
		}
		else if(props.parent){ 
			getChildren(props.parent) 
		}
		// reset on any update to props
		return () => { setPlaces([]) }
	},[props.child,props.sibling,props.parent])

	let title = (
		<h3 onClick={()=>setCollapsed(!collapsed)}>
			{`${props.title} (${places.length})`}
		</h3>
	)
	
	return (
		<div>
			{title}
			{ ! collapsed && <PlacesList places={places}/> }
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
	function getChildren(geo_id){
		json(`${publicAPI}?parent=${geo_id}`)
			.then( children => { 
				children.sort((a,b)=> a.name < b.name ? -1 : 1 )
				setPlaces(children)
			} )	
	}
}