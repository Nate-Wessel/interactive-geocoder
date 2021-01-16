import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HashRouter as Router, Route } from 'react-router-dom'
import Search from '../Search'
import SelectedPlace from '../SelectedPlace'
import Relations from '../SelectedPlace/Relations.jsx'
import './main.css'

export default function JurisdictionManager(props) {
	return (
		<div id="app-container">
			<Router>
				<Search/>
				<Route path="/:geo_id">
					<SelectedPlace/>
					<Relations/>
				</Route>
			</Router>
		</div>
	)
}
