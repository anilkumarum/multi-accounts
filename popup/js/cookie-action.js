export async function moveCookies(url) {
	const cookies = await chrome.cookies.getAll({ url: url });

	const promises = [];
	for (const cookie of cookies) {
		if (cookie.name.startsWith("__Host-")) continue;
		const setDetails = {
			name: cookie.name,
			value: cookie.value,
			domain: cookie.domain,
			path: cookie.path,
			expirationDate: cookie.expirationDate,
			httpOnly: cookie.httpOnly,
			secure: true,
			sameSite: cookie.sameSite,
			url: url,
		};
		promises.push(chrome.cookies.set(setDetails));
		promises.push(chrome.cookies.remove({ name: cookie.name, url: url }));
	}
	await Promise.all(promises);
}

export async function getPartitionCookies(url) {
	return await chrome.cookies.getAll({ url: url });
}

export async function isPartitionCookiesEmpty(url) {
	const cookies = await chrome.cookies.getAll({ url: url });
	return cookies.length === 0;
}
export async function insertPartitionCookies(cookies, url) {
	const promises = [];
	for (const cookie of cookies) {
		if (cookie.name.startsWith("__Host-")) continue;
		const setDetails = {
			name: cookie.name,
			value: cookie.value,
			domain: cookie.domain,
			path: cookie.path,
			expirationDate: cookie.expirationDate,
			httpOnly: cookie.httpOnly,
			secure: cookie.secure,
			sameSite: cookie.sameSite,
			url: url,
		};
		promises.push(chrome.cookies.set(setDetails));
	}
	await Promise.all(promises);
}

export async function deletePartitionCookies(host, url) {
	const cookies = await chrome.cookies.getAll({ url: url });
	for (const cookie of cookies) chrome.cookies.remove({ name: cookie.name, url: url });
}
