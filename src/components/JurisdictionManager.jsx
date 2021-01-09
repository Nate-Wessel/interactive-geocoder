import React, { useState } from 'react'
import Search from './Search.jsx'
import SelectedPlace from './SelectedPlace.jsx'

export default function JurisdictionManager(props) {
	const [place,selectPlace] = useState(null)

	function unselectPlace(){
		selectPlace(null)
	}
	if(place){
		return (
			<div className="container">
				<button onClick={unselectPlace}>Return to Search</button>
				<SelectedPlace 
					place={place}
					onNewPlaceSelection={selectPlace}/>
			</div>
		)
	}else{
		return <Search onSelection={selectPlace}/>
	}
}
