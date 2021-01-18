export function displayName(place){
	return `${place.name} ${placeParenthetical(place)}`
}

export function placeTypeArticle(jurisdictionType){
	return /island|autonomous*/i.test(jurisdictionType) ? 'an' : 'a'
}

export function placeTypePreposition(jurisdictionType){
	return /island|world/i.test(jurisdictionType) ? 'on' : 'in'
}

export function placeParenthetical(place){
	let article = placeTypeArticle(place.type_of)
	let parentText = ''
	if( place.parent && isNaN(place.parent) ){
		let preposition = placeTypePreposition(place.parent.type_of)
		parentText = ` ${preposition} ${place.parent.name} `	
	}
	return `( ${article} ${place.type_of} ${parentText})`
}
