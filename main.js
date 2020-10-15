import { map, tileLayer } from 'leaflet/src/Leaflet'

window.onload = ()=>{
	const m = map('map').setView([43.7,-79.4], 10)
	tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
		.addTo(m);
}
