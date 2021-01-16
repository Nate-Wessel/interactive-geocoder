
export function displayName(place){
	let article = /^[aeiouh]/.test(place.type_of) ? 'an' : 'a'
	// TODO set preposition properly
	let preposition_parent = place.parent ? `in ${place.parent.name} ` : ''
	return `${place.name} ( ${article} ${place.type_of} ${preposition_parent})`
}
