import React, { useState, useEffect } from 'react'
import { json } from 'd3-fetch'

export default function(props){
	const [name,setName] = useState('')
	const [selectedType,setSelectedType] = useState(null)
	const [types,setTypes] = useState([])
	const [osmid,setOsmid] = useState('')
	useEffect(()=>{
		// fetch types one when component mounted
		json('./server/jurisdiction.php?types')
			.then(types=>setTypes(types.sort((a,b)=>a.label<b.label?-1:1)))
	},[])
	return ( 
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

			{formIsValid() && <button type="button" onClick={submitForm}>Submit</button>}
			
		</form>
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
				'jurisdiction_type':selectedType,
				'osm_id':osmid
			}),
			headers: { 'Content-Type': 'application/json' }
		}
		fetch('./server/jurisdiction.php', options)
			.then(response => console.log(response.json()))
		// reset the form
	}
}
