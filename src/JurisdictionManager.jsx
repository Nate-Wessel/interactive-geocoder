import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
	HashRouter as Router,
	Switch,
	Route
} from 'react-router-dom'
import Search from './Search.jsx'
import SelectedPlace from './SelectedPlace.jsx'

export default function JurisdictionManager(props) {
	return (
		<Router>
			<Switch>
				<Route path="/:geo_id">
					<Link to="/">Return to Search</Link>
					<SelectedPlace/>
				</Route>
				<Route path="/">
					<Search/>
				</Route>
			</Switch>
		</Router>
	)
}
