import { 
	map as leafletMap, 
	tileLayer,
	marker 
} from 'leaflet/src/Leaflet'
import { select } from 'd3-selection'
import { json } from 'd3-fetch'

const server = 'http://localhost/interactive-geocoder/server'
const locationIQ = 'https://us1.locationiq.com/v1/search.php'

const form = {}

var map

window.onload = ()=>{
	// identify form elements
	form.uid = select('input[name="uid"]')
	form.region = select('input[name="region"]')
	form.country = select('input[name="country"]')
	form.province = select('input[name="province"]')
	form.city = select('input[name="city"]')
	
	select('form button').on('click',geocode)
	// make a map
	map = leafletMap('map')
	tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
		.addTo(map);
	// get a place up in the form
	json(`${server}/fresh-place.php`)
	.then( response => {
		console.log('Place is:',response)
		form.uid.attr('value',response.uid)
		form.region.attr('value',response.region)
		form.country.attr('value',response.country)
		form.province.attr('value',response.province)
		form.city.attr('value',response.city)
		// and pre-geocode it
		geocode()
	} )
}

function geocode(){
	let params = new URLSearchParams( {
		'key': 'pk.3acf24fbf7ce2d8e0239a9e882b4919b',
	 	'format': 'json',
		'country': form.country.attr('value'),
		'state': form.province.attr('value'),
		'city': form.city.attr('value'),
		'polygon_geojson': 1,
		'matchquality': 1,
		'namedetails': 1
	} )
	json(`${locationIQ}?${params.toString()}`)
		.then( response => {
			console.log(response)
			// show each result on the map
			response.map( r => {
				let coords = [ r.lat, r.lon ]
				let popupHTML = `
					<b>${r.display_name}</b><br>
					<i>Quality:</i> ${r.matchquality.matchcode}, 
					${r.matchquality.matchlevel}, 
					${r.matchquality.matchtype}`
				marker(coords)
					.addTo(map)
					.bindPopup(popupHTML)
			} )
			let allPoints = response.map( r => [r.lat,r.lon] )
			map.fitBounds(allPoints,{maxZoom:14,padding:[30,30]})
		} )
		.catch( err => console.warn(err) )
}
