import { 
	map as leafletMap, 
	tileLayer,
	geoJSON,
	circleMarker
} from 'leaflet/src/Leaflet'
import { select, selectAll } from 'd3-selection'
import { transition } from 'd3-transition'
import { json } from 'd3-fetch'

const server = 'http://localhost/places-db-admin/server'

const mbMap =   'https://api.mapbox.com/styles/v1/apfcanada/'+
                'ckgl4ahu31y5e19o0gt1z6ymb/tiles/256/{z}/{x}/{y}'
const mbToken = 'pk.eyJ1IjoiYXBmY2FuYWRhIiwiYSI6ImNrY3hpdzcwbz'+
                'AwZzIydms3NGRtZzY2eXIifQ.E7PbT0YGmjJjLiLmyRWSuw'

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

window.onload = ()=>{
	// set up search bar
	select('.search input')
		.on('input focus',search)
		.on('unfocus',clearSearchResults)
	// initialize the map
	map = leafletMap('map')
	responseLayer.addTo(map)
	selectionLayer.addTo(map)
	tileLayer(`${mbMap}?access_token=${mbToken}`).addTo(map)
}

function search(event){
	// handles input/changes to the search parameters
	var query = null
	let searchTerm = event.target.value
	// is this a search by name or geo_id?
	if(!isNaN(searchTerm) & Number(searchTerm) > 0){
		query = `geo_id=${Number(searchTerm)}`
	}else if(searchTerm.trim().length >= 2){
		query = `search=${searchTerm}`
	}else{ 
		return clearSearchResults();
	}
	json(`${server}/jurisdiction.php?${query}`).then( response => {
		showSearchResults(response,event.target) 
	} )
}

function showSearchResults(results,searchBar){
	// append results list right after search bar
	let resultsList = select(searchBar.parentNode)
		.selectAll('ol.results')
		.data([results]).join('ol').classed('results',true)
	resultsList.selectAll('li')
		.data(d=>d,d=>d.geo_id)
		.join('li').classed('own-search',true)
		.text(d=>`${d.name} (${d.type_of} ${d.parent?'in '+d.parent.name:''})`)
		.on('click',event => {
			select('.search input').property('value','')
			clearSearchResults()
			showPlace( select(event.target).datum().geo_id)
		} )
}

function clearSearchResults(){
	select('.search .results').remove()
}

function showPlace(geo_id){
	if( isNaN(geo_id) ){ 
		return console.warn('not a valid geo_id')
	}
	let div = select('#place-meta')
	div.selectChildren().remove()
	let form = div.append('form')
	json(`${server}/jurisdiction.php?geo_id=${geo_id}`).then( jurisdiction => {	
		let container = form.append('div')
			.classed('input-container',true)
		container.append('input')
			.attr('type','text')
			.attr('name','geo_id')
			.attr('readonly',true)
			.property('value',geo_id)
		container.append('label')
			.attr('for','geo_id')
			.text('geo_id')
		container = form.append('div').classed('input-container',true)
		container.append('input')
			.attr('type','text')
			.attr('name','name')
			.property('value',jurisdiction.name)
		container.append('label')
			.attr('for','name')
			.text('Name')
		json(`${server}/jurisdiction.php?types`).then( types => {
			container = form.append('div').classed('input-container',true)
			let selector = container
				.append('select')
				.selectAll('option')
				.data(types)
				.join('option')
				.attr('selected',t => jurisdiction.type_of == t.label ? true : null )
				.text(d=>d.label)
			container.append('label')
				.attr('for','type')
				.text('Type')
		} )
	} )
}

function showMap(geojson){
	responseLayer.clearLayers().addData( geojson )
	select('#map').style('display','block')
	map.fitBounds( 
		selectionLayer
			.getBounds()
			.extend(responseLayer.getBounds()), 
		{maxZoom:defaultMaxZoom} )
	
}

function hideMap(){
	select('#map').style('display',null)
}

function addPlaceFormTo(selector,placeData={}){
	select(selector)
		.selectAll('form.place')
		.data([textInputFields]).join('form').classed('place',true)
		.selectAll('div.input-container')
		.data(d=>d,d=>d.name)
		.join(
			enter => {
				let container = enter.append('div')
					.classed('input-container',true)
				container.append('input')
					.attr('type','text')
					.attr('name',d=>d.name)
					.attr('readonly',d=>'readonly' in d ? 'true' : null )
					.on('unfocus change',checkIfEmpty)
					.property('value',d => {
						return (d.name in placeData) ? placeData[d.name] : ''
					} )
					.dispatch('change')
					.on('input',checkIfDifferent)
				container.append('label')
					.attr('for',d=>d.name)
					.text(d=>d.label)
			},
			update => { 
				update.select('input') 
					.property('value',d => {
						return (d.name in placeData) ? placeData[d.name] : ''
					} )
					.dispatch('change')
			}
		)
	function checkIfEmpty(event){
		select(event.target.parentNode)
			.classed('empty',event.target.value.trim()=='')
	}
	function checkIfDifferent(event){
		// check current form value against original value from DB
		let field = select(event.target).attr('name')
		let orig = (field in placeData && placeData[field]) ? placeData[field] : ''
		let curr = event.target.value.trim()
		select(event.target)
			.style('background-color',curr != orig ? 'pink' : null)
	}
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

function currentFormData(){
	let data = {}
	selectAll('#text-inputs input').each(function(){
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
	// add spatial data to the map
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
	// add textual data to the div
	let div = select('#selected-match')
	div.selectAll('p,h3,h4').remove()
	// append info
	div.append('h3')
		.text(data.namedetails.name)
	// get other names 
	let translations = new Set()
	if('name:en' in data.namedetails){ 
		translations.add(data.namedetails['name:en']) 
	}
	if('name:fr' in data.namedetails){ 
		translations.add(data.namedetails['name:fr']) 
	}
	translations.delete(data.namedetails.name)
	if(translations.size > 0){
		div.append('p').text(`(${[...translations].join(' | ')})`)
	}
	// link to OSM
	let osmLink = `https://www.openstreetmap.org/${data.osm_type}/${data.osm_id}`
	div.append('p').append('a').attr('href',osmLink).attr('target','_blank')
		.text(`OSM ${data.osm_type}`)
	// wikipedia
	if('wikipedia' in data.extratags){
		let enPage = 'wikipedia:en' in data.extratags ? 
			data.extratags['wikipedia:en'] : data.extratags.wikipedia
		let wikiLink = `https://en.wikipedia.org/wiki/${enPage}`
		div.append('p').append('a').attr('href',wikiLink).attr('target','_blank')
			.text(enPage)
	}
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
