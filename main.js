import { 
	map as leafletMap, 
	tileLayer,
	marker,
	geoJSON,
	circleMarker
} from 'leaflet/src/Leaflet'
import { select, selectAll } from 'd3-selection'
import { transition } from 'd3-transition'
import { json } from 'd3-fetch'

const server = 'http://localhost/interactive-geocoder/server'
const locationIQ = 'https://us1.locationiq.com/v1/search.php'

const mbMap =   'https://api.mapbox.com/styles/v1/apfcanada/'+
                'ckgl4ahu31y5e19o0gt1z6ymb/tiles/256/{z}/{x}/{y}'
const mbToken = 'pk.eyJ1IjoiYXBmY2FuYWRhIiwiYSI6ImNrY3hpdzcwbz'+
                'AwZzIydms3NGRtZzY2eXIifQ.E7PbT0YGmjJjLiLmyRWSuw'

var map, placesLayer
var spot = circleMarker()

window.onload = ()=>{ 
	emptyFormFields()
	// add actions
	select('input[name="search"]')
		.on('input',findSimilar)
		.on('unfocus',)
	select('#controls button#update').on('click',geocode)
	select('#controls button#save').on('click',save)
	select('#controls button#next').on('click',()=>fetchPlace())
	// make a map
	map = leafletMap('map').setView([43.67,-79.38],13)
	tileLayer(`${mbMap}?access_token=${mbToken}`).addTo(map)
	placesLayer = geoJSON(undefined,{'onEachFeature':addPopup}).addTo(map)
}

function undisplaySearchResults(){
	selectAll('ol#search-results li').remove()
}

function findSimilar(event){
	let term = event.target.value
	if( term.length > 2 ){
		json(`${server}/suggester.php?addr=${term}`).then( response => {
			console.log(term, response)
			select('ol#search-results')
				.selectAll('li')
				.data(response,d=>d.geo_id)
				.join('li')
				.text(d=>d.addr)
				.on('click',event => {
					fetchPlace(select(event.target).datum().geo_id) 
					undisplaySearchResults()
				} )
		} )
	}else{ // search key is too short
		undisplaySearchResults()
	} 
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
		setFormData( {
			'point_geojson': `{"type":"Point","coordinates":[${p.lon},${p.lat}]}`,
			'osm_id':p.osm_id
		} )
		spot.setLatLng([p.lat,p.lon]).addTo(map)
	} )
}

function emptyFormFields(){
	selectAll('form input').property('value','')
}

function setFormData(newData){
	// iterate over data object setting corresponding form elements
	for( let [ key, value ] of Object.entries(newData)){
		select(`input[name="${key}"]`)
			.property('value', value ? value : '')
	}
}

function fetchPlace(geo_id){
	let URL = `${server}/get-place.php`
	if(!isNaN(geo_id)){ 
		URL += `?geo_id=${geo_id}`
	}
	// tidy up from before
	placesLayer.clearLayers()
	spot.remove()
	// fetch data from server
	json(URL) .then( response => {
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
		.then( response => {
			console.log(response) 
			// give feedback on updated form fields
			for( [key,val] of Object.entries(response.updated)){
				select(`input[name="${key}"]`)
					.style('background-color',val?'green':'red')
					.transition().duration(2000)
					.style('background-color',null)
			}
		} )
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
		data.district, 
		data.city, 
		data.county,
		data.metro,
		data.province,
		data.subnational_region, 
		data.country
	]
	let queryParams = { q: addressFields.filter(val=>val!='').join(', ') }
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
					'address': r.address,
					'osm_id' : r.osm_id
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
		.catch( err => console.warn('No matches for',queryParams) )
}

