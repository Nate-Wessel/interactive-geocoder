import React, { useState, useEffect } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { json } from 'd3-fetch'
import { publicAPI, privateAPI } from './API.js'

export default function(props){
	const [name,setName] = useState('')
	const [selectedType,setSelectedType] = useState(null)
	const [types,setTypes] = useState([])
	const [osmid,setOsmid] = useState('')
	const [newGeo_id,setNewGeo_id] = useState(null)
	useEffect(()=>{
		// fetch types one when component mounted
		json(`${publicAPI}?types`)
			.then(types=>setTypes(types.sort((a,b)=>a.label<b.label?-1:1)))
	},[])
	return ( 
		<div className="container">
			<h2>Add a child jurisdiction</h2>
			{newGeo_id && <Redirect to={`/${newGeo_id}`}/>}
			<form>
				<label htmlFor="name">Name</label><br/>
				<input id="name" type="text" 
					value={name} 
					onInput={(e)=>setName(e.target.value)}/><br/>
				<label htmlFor="type">Type</label><br/>
				<select id="type" onChange={(e)=>setSelectedType(e.target.value)}>
					<option value="junk">No selection</option>
					{types.map( (type,i) => {
						return <option key={i} value={type.uid}>{type.label}</option> 
					} )}
				</select><br/>
				<label htmlFor="osmid">OSM ID</label><br/>
				<input id="osmid" type="text" 
					value={osmid} 
					onInput={(e)=>setOsmid(e.target.value)}/><br/>
				{ formIsValid() && 
				<button type="button" onClick={submitForm}>Submit</button>
				}
			</form>
		</div>
	)
	function formIsValid(){
		return ( 
			!isNaN(parseInt(selectedType)) &&
			name.trim().length > 1 &&
			!isNaN(parseInt(osmid))
		)
	}
	function submitForm(){
		const options = {
			method: 'POST',
			body: JSON.stringify({
				'name': name,
				'parent':props.parent.geo_id,
				'type':selectedType,
				'osm_id':osmid
			}),
			headers: { 'Content-Type': 'application/json' }
		}
		json('./server/jurisdiction.php', options)
			.then(response => {
				console.log(response)
				if(response.geo_id){
					setDisplayForm(false)
					setName('')
					setSelectedType(null)
					setOsmid('')
					setNewGeo_id(response.geo_id)
				}
			})
		// reset the form
	}
}
