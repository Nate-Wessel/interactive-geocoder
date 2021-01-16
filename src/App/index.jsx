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
						<Nav/>
						<SelectedPlace/>
						<AddChildForm/>
					</Route>
					<Route path="/:geo_id/relations">
						<Nav/>
						<SelectedPlace/>
						<Relations/>
					</Route>
					<Route path="/:geo_id">
						<Nav/>
						<SelectedPlace/>
					</Route>
					<Route path="/" component={Search}/>
				</Switch>
			</Router>
		</div>
	)
}

function Nav(props){
	const { geo_id } = useParams()
	return (
		<nav>
			<NavLink to="/">Search</NavLink>
			<NavLink to={`/${geo_id}/relations`}>Relations</NavLink>
			<NavLink to={`/${geo_id}/addChild`}>Add Child</NavLink>
		</nav>
	)
}
