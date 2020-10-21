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

var map, placesLayer

window.onload = ()=>{
	// identify form elements
	form.uid =                select('input[name="uid"]')
	form.world_region =       select('input[name="world_region"]')
	form.country =            select('input[name="country"]')
	form.subnational_region = select('input[name="subnational_region"]')
	form.province =           select('input[name="province"]')
	form.city =               select('input[name="city"]')
	form.suburb =             select('input[name="suburb"]')
	form.lat =                select('input[name="lat"]')
	form.lon =                select('input[name="lon"]')
	// add button actions
	select('form button#update-addr').on('click',updateAddress)
	select('form button#save').on('click',save)
	select('form button#next-place').on('click',fetchNewPlace)
	// make a map
	map = leafletMap('map')
	tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
		.addTo(map)
	placesLayer = geoJSON(undefined,{'onEachFeature':addPopup}).addTo(map)
	
	fetchNewPlace()
}

function addPopup(feature,layer){
	let p = feature.properties
	let enName = p.namedetails['name:en']
	let frName = p.namedetails['name:fr']
	let popupHTML = `
		<b>${p.namedetails.name}</b> 
		${enName ? '| en: <b>'+enName+'</b>' : ''}
		${frName ? '| fr: <b>'+frName+'</b>' : ''}
		<br>
		${p.matchquality.matchtype},
		${p.matchquality.matchlevel},
		${p.matchquality.matchcode}<br>
		<button>Use coords</button>
	`
	layer.bindPopup(popupHTML)
}

function setFormData(newData){
	form.uid.property('value',newData.uid)
	form.world_region.property('value',newData.world_region)
	form.country.property('value',newData.country)
	form.subnational_region.property('value',newData.subnational_region)
	form.province.property('value',newData.province)
	form.city.property('value',newData.city)
	form.suburb.property('value',newData.suburb)
	form.lat.property('value',newData.lat)
	form.lon.property('value',newData.lon)
}

function fetchNewPlace(){
	// tidy up from before
	placesLayer.clearLayers()
	// fetch data from server
	json(`${server}/fresh-place.php`)
		.then( response => {
			setFormData(response)
			geocode()
		} )
}

function updateAddress(){
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
		'namedetails': 1,
		'addressdetails': 1,
		'extratags': 1
	} )
	json(`${locationIQ}?${params.toString()}`)
		.then( response => {
			console.log(response)
			// convert response into properly formatted geoJSON
			let geojsonPlaces = response.map( r => {
				let place = r.geojson
				place.properties = { 
					'lat': r.lat,
					'lon': r.lon,
					'class': r.class,
					'type': r.type,
					'osd_id':r.osm_id,
					'osm_type': r.osm_type,
					'matchquality':r.matchquality,
					'namedetails':r.namedetails
				}
				return place
			} )
			placesLayer.addData(geojsonPlaces)
			map.fitBounds(placesLayer.getBounds(),{maxZoom:14,padding:[20,20]})
		} )
		.catch( err => console.warn(err) )
}
