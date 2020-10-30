import { 
	map as leafletMap, 
	tileLayer,
	geoJSON,
	circleMarker
} from 'leaflet/src/Leaflet'
import { select, selectAll } from 'd3-selection'
import { transition } from 'd3-transition'
import { json } from 'd3-fetch'

const server = 'http://localhost/interactive-geocoder/server'

const mbMap =   'https://api.mapbox.com/styles/v1/apfcanada/'+
                'ckgl4ahu31y5e19o0gt1z6ymb/tiles/256/{z}/{x}/{y}'
const mbToken = 'pk.eyJ1IjoiYXBmY2FuYWRhIiwiYSI6ImNrY3hpdzcwbz'+
                'AwZzIydms3NGRtZzY2eXIifQ.E7PbT0YGmjJjLiLmyRWSuw'

const defaultCenter = [43.67,-79.38] // toronto
const defaultMaxZoom = 13

var map
const responseLayer = geoJSON( undefined, {
	'style': { color: 'red' },
	'pointToLayer': ( feature, latlng ) => {
		return circleMarker( latlng, { radius: 5, color: 'red' } )
	}
} )
const selectionLayer = geoJSON( undefined, {
	'style': { color: 'blue' },
	'pointToLayer': ( feature, latlng ) => {
		return circleMarker( latlng, { radius: 10, color: 'blue' } )
	}
} )

const textInputFields = [
	{'name':'geo_id','label':'geo_id','readonly':true},
	{'name':'country','label':'Country'},
	{'name':'subnational_region','label':'Subnational Region'},
	{'name':'province','label':'Province/State'},
	{'name':'metro','label':'Metro Area'},
	{'name':'county','label':'County'},
	{'name':'city','label':'City'},
	{'name':'district','label':'Suburb/District'},
	{'name':'osm_id','label':'OSM ID'},
	{'name':'notes','label':'Notes'}
]

window.onload = ()=>{ 
	emptyFormFields()
	// add actions
	select('input[name="search"]')
		.on('input focus',search)
		.on('unfocus',hideResults)
	select('#controls button#update').on('click',geocode)
	select('#controls button#save').on('click',save)
	select('#controls button#next').on('click',()=>fetchPlace())
	// make a map and add all layers
	map = leafletMap('map')
		.setView(defaultCenter,defaultMaxZoom)
		.on('click drag',hideResults)
	selectionLayer.addTo(map)
	responseLayer.addTo(map)
	tileLayer(`${mbMap}?access_token=${mbToken}`).addTo(map)
	// create text input fields
	let inputContainers = select('#text-inputs').selectAll('div')
		.data(textInputFields).join('div')
		.classed('input-container empty',true)
	inputContainers.append('input').attr('type','text')
		.attr('name',d=>d.name)
		.attr('readonly',d=>'readonly' in d ? 'true' : null )
	inputContainers.append('label').attr('for',d=>d.name).text(d=>d.label)
	inputContainers
		.selectAll('input')
		.on('unfocus change',(event)=>{
			select(event.target.parentNode)
				.classed('empty',event.target.value.trim()=='')
		})	
}

function search(event){
	// handles input/changes to the search parameters
	var resource = null
	let searchTerm = event.target.value
	// is this a search by name or geo_id?
	if(!isNaN(searchTerm) & Number(searchTerm) > 0){
		resource = `${server}/suggester.php?geo_id=${Number(searchTerm)}`
	}else if(searchTerm.trim().length > 2){
		resource = `${server}/suggester.php?addr=${searchTerm}`
	}
	if(resource){
		json(resource).then( response => {
			select('ol#results')
				.selectAll('li')
				.data(response,d=>d.geo_id)
				.join('li').classed('own-search',true)
				.text(d=>d.addr)
				.on('click',event => {
					fetchPlace( select(event.target).datum().geo_id) 
					hideResults()
				} )	
		} )
	}else{
		hideResults()
	}
}

function hideResults(){
	selectAll('ol#results li').remove()
}
/*
function addPopup(feature,layer){
	let p = feature.properties
	let enName = p.namedetails['name:en']
	let frName = p.namedetails['name:fr']
	let popupHTML = `
		<b>${p.namedetails.name}</b> 
		${enName ? '| en: <b>'+enName+'</b>' : ''}
		${frName ? '| fr: <b>'+frName+'</b>' : ''}
		<br>`
		for( let [ key, value ] of Object.entries(p.address)){
			popupHTML += `<b>${key}</b>: ${value}<br>`
		}
	layer.bindPopup(popupHTML)
}
*/

function emptyFormFields(){
	selectAll('#text-inputs input').property('value','')
}

function setFormData(newData){
	// iterate over data object setting corresponding form elements
	for( let [ key, value ] of Object.entries(newData)){
		select(`input[name="${key}"]`)
			.property('value', value ? value : '')
			.dispatch('change')
	}
	selectionLayer.clearLayers()
	if('point_geojson' in newData && newData.point_geojson){
		selectionLayer.addData(newData.point_geojson)
	}
	if('polygon_geojson' in newData && newData.polygon_geojson){
		selectionLayer.addData(newData.polygon_geojson)
	}
	map.fitBounds( selectionLayer.getBounds(), {maxZoom:defaultMaxZoom} )
}

function fetchPlace(geo_id){
	let URL = `${server}/get-place.php`
	if(!isNaN(geo_id)){ 
		URL += `?geo_id=${geo_id}`
	}
	// fetch data from server
	json(URL).then( response => {
		setFormData(response)
	} )
}

function currentFormData(){
	let data = {}
	selectAll('#text-inputs input').each(function(d,i){
		let key = select(this).property('name')
		let val = select(this).property('value').trim()
		data[key] = val == '' ? null : val
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
				console.log(key,val)
				select(`#text-inputs input[name="${key}"]`)
					.style('background-color',val?'green':'red')
					.transition().duration(2000)
					.style('background-color',null)
			}
		} )
}

const nominatimData = {}

function geocode(){
	// geocode with Nominatim
	let params = new URLSearchParams( {
		'q': currentAddressString(), 'format': 'json', 'polygon_geojson': 1,
		'matchquality': 1, 'namedetails': 1, 'addressdetails': 1, 'extratags': 1
	} )
	let URL = `https://nominatim.openstreetmap.org/search?${params.toString()}`	
	if( URL in nominatimData ){ // this exact request has already been made
		return showResults(nominatimData[URL])
	}
	// or else this is a new request in this session
	json(URL).then( response => {
		showResults(response)
		nominatimData[URL] = response
	} )
	function showResults(response){
		select('ol#results')
			.selectAll('li')
			.data(response,d=>d.display_name)
			.join('li').text(d=>d.display_name)
			.classed('nominatim-search',true)
			.on('click',showGeoResult)
	} 
}

function showGeoResult(event){
	let data = select(event.target).datum()
	console.log(data)
	responseLayer
		.clearLayers()
		.addData( data.geojson )
	// if response is a polygon, ad the center point too
	if(data.geojson.type='Polygon'){
		responseLayer
			.addData( {type:'Point',coordinates:[data.lon,data.lat]} )
	}
	map.fitBounds( 
		selectionLayer
			.getBounds()
			.extend(responseLayer.getBounds()), 
		{maxZoom:defaultMaxZoom} )
}

function currentAddressString(){
	// use the available data to make an address query string
	// e.g. "Toronto, Ontario, Canada"
	let d = currentFormData()
	let addressFields = [ 
		d.district, d.city, d.county, d.metro,
		d.province, d.subnational_region, d.country ]
	return addressFields.filter(v=>''!=v).join(', ')
}

