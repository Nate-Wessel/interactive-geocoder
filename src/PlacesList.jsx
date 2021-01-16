import React from 'react'
import { Link } from 'react-router-dom'
import { displayName } from './placeDisplayName.js'

export default function PlacesList(props){
	let places = props.places
		.map( place => {
			return ( 
				<li key={place.geo_id}>
					<Link to={`/${place.geo_id}`}>{displayName(place)}</Link>
				</li>
			)
		})
	return (
		<ul className="place-list">{places}</ul>
	)
}
