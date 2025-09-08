export function partitionLocalStorage() {
	const storageData = Object.assign({}, localStorage);
	localStorage.clear();
	return { local: storageData };
}
