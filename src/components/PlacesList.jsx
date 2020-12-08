import React from 'react'

export default function PlacesList(props){
	let places = props.places.map( place => {
		return ( 
			<li onClick={(event)=>props.onSelection(place)} key={place.geo_id}>
				{displayText(place)}
			</li>
		)
	})
	return (
		<ul className="place-list" id={props.id}>{places}</ul>
	)
}

function displayText(place){
	let article = /^[aeiouh]/.test(place.type_of) ? 'an' : 'a'
	// TODO set preposition properly
	let preposition_parent = place.parent ? `in ${place.parent.name} ` : ''
	return `${place.name} ( ${article} ${place.type_of} ${preposition_parent})`
}
