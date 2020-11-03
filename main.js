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
	addSearchBarTo('body')
/*
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
*/
}

function addSearchBarTo(selector){
	select(selector)
		.append('div').classed('search',true)
		.append('input')
		.attr('type','text')
		.attr('placeholder','Search by name or geo_id')
		.attr('autocomplete','off')
		.on('input focus',search)
		.on('unfocus',hideResults)
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
	if(!resource){ return hideResults(); }
	json(resource).then( response => {
		showPlaceResults(response,event.target) 
	} )
}

function showPlaceResults(results,searchBar){
	// append results list right after search bar
	let resultsList = select(searchBar.parentNode)
		.selectAll('ol.results')
		.data([results]).join('ol').classed('results',true)
	resultsList.selectAll('li')
		.data(d=>d,d=>d.geo_id)
		.join('li').classed('own-search',true).text(d=>d.addr)
		.on('click',event => {
			showExistingPlace( select(event.target).datum().geo_id)
		} )
	// display "new place" button 
	resultsList
		.selectAll('li#new-place')
		.data([{'id':'1'}]).join('li').attr('id','new-place')
		.append('button').on('click',newPlaceForm)
		.text('New Place')
}

function newPlaceForm(){
	// TODO clear page and add form to create new place
}

function showExistingPlace(geo_id){
	// clear the page
	let body = select('body').selectChildren().remove()
	// fetch the data
	let URL = `${server}/get-place.php${isNaN(geo_id)?'':'?geo_id='+geo_id}`
	json(URL).then( response => {
		addPlaceFormTo('body',response)
	} )
}

function addPlaceFormTo(selector,data={}){
	let form = select(selector).append('form').classed('place',true)
	let inputContainers = form.selectAll('div.input-container')
		.data(textInputFields).join('div')
		.classed('input-container',true)
		.classed('empty',d => {
			return ((d.name in data) && data[d.name]) ? null : true 
		} )
	inputContainers
		.append('input')
		.attr('type','text')
		.attr('name',d=>d.name)
		.attr('readonly',d=>'readonly' in d ? 'true' : null )
		.property('value',d => (d.name in data) ? data[d.name] : null )
		
	inputContainers
		.append('label')
		.attr('for',d=>d.name)
		.text(d=>d.label)
	inputContainers
		.selectAll('input')
		.on('unfocus change',(event)=>{
			select(event.target.parentNode)
				.classed('empty',event.target.value.trim()=='')
		})	
	return form
}

function hideResults(){
	select('.search .results').remove()
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

