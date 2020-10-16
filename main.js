import { map, tileLayer } from 'leaflet/src/Leaflet'
import { select } from 'd3-selection'
import { json } from 'd3-fetch'

window.onload = ()=>{
	const m = map('map').setView([43.7,-79.4], 10)
	tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
		.addTo(m);
	// 
	json('http://localhost/interactive-geocoder/server/fresh-place.php')
	.then( response => {
		console.log(response)
		select('input#region').attr('value',response.region)
		select('input#country').attr('value',response.country)
		select('input#province').attr('value',response.province)
		select('input#city').attr('value',response.city)
	} )
}
