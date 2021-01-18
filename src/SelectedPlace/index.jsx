import React, { useState, useEffect } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import { json } from 'd3-fetch'
import AddChildForm from '../AddChildForm.jsx'
import { placeParenthetical } from '../placeDisplayName'
import { publicAPI } from '../API.js'
import './selected.css'

export default function SelectedPlace(props) {
	const { geo_id } = useParams()
	const [ place, setPlace ] = useState(null)
	useEffect(()=>{
		json(`${publicAPI}?geo_id=${geo_id}&withAncestors`)
			.then( response => setPlace(response) )
	},[geo_id])
	if( ! place ){
		return null
	}
	return (
		<div id="selected-place">
			<h1>{place.name}</h1>
			<p>{placeParenthetical(place)}</p>
			<p><span id="geo_id">{place.geo_id}</span></p>
			<nav>
				<NavLink to={`/${geo_id}/relations`}>Show Relations</NavLink>
				<NavLink to={`/${geo_id}/addChild`}>Add Child</NavLink>
			</nav>
			<h3>As seen on:</h3>
			<ul>
				{place.osm_id &&
					<li>
						<a href={`https://www.openstreetmap.org/relation/${place.osm_id}`}
							target="_blank">
							OpenStreetMap
						</a>
					</li>
				}
				{place.wiki && 
					<li>
						<a href={`https://en.wikipedia.org/wiki/${place.wiki}`}
							target="_blank">Wikipedia</a>
					</li>
				}
				{place.website && 
					<li>
						<a href={place.website}
							target="_blank">Website</a>
					</li>
				}
			</ul>
		</div>
	)
}
