import React, { useState } from 'react'
import { json } from 'd3-fetch' 
import PlacesList from './PlacesList.jsx'
import { publicAPI } from './API.js'

export default function(props) {
	const [ searchTerm, setSearchTerm ] = useState('')
	const [ searchResults, setSearchResults ] =  useState([])
	
	return (
		<div className="search">
			<input 
				type="text"
				placeholder="Search by place name or ID"   
				value={searchTerm}
				onInput={handleInput}/>
			<PlacesList id="search-results"
				places={searchResults}/>
		</div>
	)
	
	function handleInput(event) {
		setSearchTerm(event.target.value)
		
		let text = event.target.value.trim()
		if(isNaN(text) && text.length < 2){
			return setSearchResults([])
		}
		if(!isNaN(text) & Number(text) > 0){
			json(`${publicAPI}?geo_id=${Number(text)}`)
				.then( response => {
					// response can be 'undefined'
					setSearchResults( response ? [response] : [] )
				} )
		}else{
			json(`${publicAPI}?search=${text}`)
				.then( response => setSearchResults(response) )
		}
	}
}
