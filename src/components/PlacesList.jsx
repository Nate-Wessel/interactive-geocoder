import React from 'react'
import { displayName } from './placeDisplayName.js'

export default function PlacesList(props){

	let places = props.places
		.map( place => {
			return ( 
				<li onClick={(event)=>props.onSelection(place)} key={place.geo_id}>
					{displayName(place)}
				</li>
			)
		})
	return (
		<ul className="place-list" id={props.id}>{places}</ul>
	)
}
