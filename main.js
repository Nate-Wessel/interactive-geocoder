import { 
	map as leafletMap, 
	tileLayer,
	marker,
	geoJSON
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
	form.world_region = select('input[name="world_region"]')
	form.country = select('input[name="country"]')
	form.subnational_region = select('input[name="subnational_region"]')
	form.province = select('input[name="province"]')
	form.city = select('input[name="city"]')
	form.suburb = select('input[name="suburb"]')
	form.lat = select('input[name="lat"]')
	form.lon = select('input[name="lon"]')
	
	// add button actions
	select('form button#update-addr')
		.on('click',updateAddress)
	select('form button#save')
		.on('click',save)
	// make a map
	map = leafletMap('map')
	tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
		.addTo(map);
	// get a place up in the form
	json(`${server}/fresh-place.php`)
		.then( response => {
			setFormData(response)
			geocode()
		} )
}

function setFormData(newData){
	form.uid.property('value',newData.uid)
	form.world_region.property('value',newData.world_region)
	form.country.property('value',newData.country)
	form.subnational_region.property('value',newData.subnational_region)
	form.province.property('value',newData.province)
	form.city.property('value',newData.city)
	form.suburb.property('value',newData.suburb)
}

function updateAddress(){
	console.log('updateAddress')
	geocode()
}

function currentFormData(){
	return {
		'uid': form.uid.property('value'),
		'world_region': form.world_region.property('value'),
		'country': form.country.property('value'),
		'subnational_region': form.subnational_region.property('value'),
		'province': form.province.property('value'),
		'city': form.city.property('value'),
		'suburb': form.suburb.property('value'),
		'lat': form.lat.property('value'),
		'lon': form.lon.property('value')
	};
}

function save(){
	let options = {
		method:'POST',
		body: JSON.stringify( currentFormData() ),
		headers: { 'Content-Type': 'application/json' } 
	}
	json(`${server}/update.php`, options )
		.then( r => console.log(r) )
}

function geocode(){
	let data = currentFormData()
	let params = new URLSearchParams( {
		'key': 'pk.3acf24fbf7ce2d8e0239a9e882b4919b',
	 	'format': 'json',
		'country': data.country,
		'state': data.province,
		'city': data.city,
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
				geoJSON(r.geojson)
					.addTo(map)
					.bindPopup(popupHTML)
			} )
			// compute the aggregate bounding box and set view
			let bottom = Math.min(...response.map( r => r.boundingbox[0] ))
			let top = Math.max(...response.map( r => r.boundingbox[1] ))
			let left = Math.min(...response.map( r => r.boundingbox[2] ))
			let right = Math.max(...response.map( r => r.boundingbox[3] ))
			let totalBounds = [[top,left],[bottom,right]]
			map.fitBounds(totalBounds,{maxZoom:14,padding:[20,20]})
		} )
		.catch( err => console.warn(err) )
}
