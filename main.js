import { map, tileLayer } from 'leaflet/src/Leaflet'
import { select } from 'd3-selection'
import { json } from 'd3-fetch'

const server = 'http://localhost/interactive-geocoder/server'

window.onload = ()=>{
	select('form button').on('click',geocode)
	const m = map('map').setView([43.7,-79.4], 10)
	tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
		.addTo(m);
	// get a place
	json(`${server}/fresh-place.php`)
	.then( response => {
		console.log(response)
		select('input[name="uid"]').attr('value',response.uid)
		select('input[name="region"]').attr('value',response.region)
		select('input[name="country"]').attr('value',response.country)
		select('input[name="province"]').attr('value',response.province)
		select('input[name="city"]').attr('value',response.city)
	} )
}

function geocode(){
	let data = {
		'uid': select('input[name="uid"]').attr('value'),
		'region': select('input[name="region"]').attr('value'),
		'country': select('input[name="country"]').attr('value'),
		'province': select('input[name="province"]').attr('value'),
		'city': select('input[name="city"]').attr('value')
	}
	json(
		`${server}/update.php`,
		{ 
			method:'POST', 
			headers: { "Content-type": "application/json; charset=UTF-8"},
			body: JSON.stringify(data) 
		}
	)
}
