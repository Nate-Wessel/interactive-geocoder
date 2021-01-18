import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { displayName } from '../../placeDisplayName.js'
import PlacesList from '../../PlacesList' 
import { json } from 'd3-fetch'
import { publicAPI } from '../../API.js'
import './relations.css'

export default function(){
	const { geo_id } = useParams()
	const [ expanded, setExpanded ] = useState('Parents')
	return (
		<div id="relations">
			<RelatedPlaces title="Parents" child={geo_id} 
				expand={setExpanded} expanded={expanded=='Parents'}/>
			<RelatedPlaces title="Siblings" sibling={geo_id} 
				expand={setExpanded} expanded={expanded=='Siblings'}/>
			<RelatedPlaces title="Children" parent={geo_id} 
				expand={setExpanded} expanded={expanded=='Children'}/>
		</div>
	)
}

function RelatedPlaces(props){
	const [places,setPlaces] = useState([])
	useEffect(()=>{
		// get the related places
		if(props.child){ getAncestors(props.child) }
		else if(props.sibling){ getSiblings(props.sibling) }
		else if(props.parent){ getChildren(props.parent) }
		else{ console.warn('no props') }
	},[props])
	
	return (
		<div>
			<h3 onClick={ () => props.expand(props.title) }>
				{`${props.title} (${places.length})`}
			</h3>
			{ props.expanded && <PlacesList places={places}/> }
		</div>
	)
	
	function getAncestors(geo_id){
		json(`${publicAPI}?geo_id=${geo_id}&withAncestors`).then( place => { 
			let ancestors = []
			while(place.parent){ 
				ancestors.unshift(place=place.parent)
			}
			setPlaces(ancestors)
		} )
	}
	
	function getSiblings(geo_id){
		json(`${publicAPI}?geo_id=${geo_id}`).then( place => { 
			json(`${publicAPI}?parent=${place.parent}`).then( children => { 
				let siblings = children
					.filter(sib=>sib.geo_id!=Number(geo_id))
					.sort((a,b)=> a.name < b.name ? -1 : 1 )
				setPlaces(siblings)
			} )
		} )
	}
	function getChildren(geo_id){
		json(`${publicAPI}?parent=${geo_id}`)
			.then( children => { 
				children.sort((a,b)=> a.name < b.name ? -1 : 1 )
				setPlaces(children)
			} )	
	}
}
