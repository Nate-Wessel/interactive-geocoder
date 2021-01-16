import React, { useState } from 'react'
import { Link, Switch } from 'react-router-dom'
import { HashRouter as Router, Route } from 'react-router-dom'
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
					</Route>
					<Route path="/:geo_id/relations">
						<SelectedPlace/>
						<Relations/>
					</Route>
					<Route path="/:geo_id">
						<SelectedPlace/>
					</Route>
					<Route path="/" component={Search}/>
				</Switch>
			</Router>
		</div>
	)
}
