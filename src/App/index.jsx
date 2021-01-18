import React, { useState } from 'react'
import { 
	HashRouter as Router, 
	Switch, 
	Route, 
	NavLink,
	useParams
} from 'react-router-dom'

import Search from '../Search'
import SelectedPlace from '../SelectedPlace'
import Relations from '../SelectedPlace/Relations'
import AddChildForm from '../AddChildForm.jsx'

import './main.css'

export default function JurisdictionManager(props) {
	return (
		<div id="app-container">
			<Router>
				<Switch>
					<Route path="/:geo_id/addChild">
						<SelectedPlace/>
						<AddChildForm/>
						<Return2Search/>
					</Route>
					<Route path="/:geo_id/relations">
						<SelectedPlace/>
						<Relations/>
						<Return2Search/>
					</Route>
					<Route path="/:geo_id">
						<SelectedPlace/>
						<Return2Search/>
					</Route>
					<Route path="/" component={Search}/>
				</Switch>
			</Router>
		</div>
	)
}

function Return2Search(props){
	return (
		<NavLink to="/" id="search-link">
			Return to Search
		</NavLink>
	)
}
