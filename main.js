import { 
	map as leafletMap, 
	tileLayer,
	marker,
	geoJSON
} from 'leaflet/src/Leaflet'
import { select, selectAll } from 'd3-selection'
import { json } from 'd3-fetch'

const server = 'http://localhost/interactive-geocoder/server'
const locationIQ = 'https://us1.locationiq.com/v1/search.php'

const mbMap =   'https://api.mapbox.com/styles/v1/apfcanada/'+
                'ckgl4ahu31y5e19o0gt1z6ymb/tiles/256/{z}/{x}/{y}'
const mbToken = 'pk.eyJ1IjoiYXBmY2FuYWRhIiwiYSI6ImNrY3hpdzcwbz'+
                'AwZzIydms3NGRtZzY2eXIifQ.E7PbT0YGmjJjLiLmyRWSuw'

var map, placesLayer

window.onload = ()=>{
	// add button actions
	select('form button#update-addr').on('click',geocode)
	select('form button#save').on('click',save)
	select('form button#next-place').on('click',fetchNewPlace)
	// make a map
	map = leafletMap('map')
	tileLayer(`${mbMap}?access_token=${mbToken}`).addTo(map)
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
		${p.matchquality.matchcode}<br>`
		for( let [ key, value ] of Object.entries(p.address)){
			popupHTML += `<b>${key}</b>: ${value}<br>`
		}
	layer.bindPopup(popupHTML)
	layer.on('click',() => {
		setFormData({'lat':p.lat,'lon':p.lon})
	} )
}

function setFormData(newData){
	// iterate over object setting corresponding form elements
	for( let [ key, value ] of Object.entries(newData)){
		select(`input[name="${key}"]`)
			.property('value', value ? value : '')
	}
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

function currentFormData(){
	let data = {}
	selectAll('form input').each(function(d,i){
		let key = select(this).property('name')
		let val = select(this).property('value')
		data[key] = val
	} )
	return data
}

function save(){
	let options = {
		method:'POST',
		body: JSON.stringify( currentFormData() ),
		headers: { 'Content-Type': 'application/json' } 
	}
	json(`${server}/update.php`, options )
		.then( response => console.log(response) )
}

function geocode(){
	placesLayer.clearLayers()
	geocodeLocationIQ()
}

function geocodeLocationIQ(){
	let staticParams = {
		'key': 'pk.3acf24fbf7ce2d8e0239a9e882b4919b',
		'format': 'json',
		'polygon_geojson': 1,
		'matchquality': 1,
		'namedetails': 1,
		'addressdetails': 1,
		'extratags': 1
	}
	let data = currentFormData()
	let addressFields = [ 
		data.suburb, 
		data.city, 
		data.province, 
		data.country
	]
	let queryParams = {
		q: addressFields.filter(val=>val!='').join(', ')
	}
	// merge static and query parameters
	let params = new URLSearchParams({...staticParams,...queryParams})
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
					'namedetails':r.namedetails,
					'address': r.address
				}
				return place
			} )
			placesLayer.addData(geojsonPlaces)
			map.fitBounds(
				placesLayer.getBounds(),
				{ 
					maxZoom: 14, 
					paddingTopLeft: [10,10],
					paddingBottomRight: [200,10]
				}
			)
		} )
		.catch( err => console.warn(err) )
}

