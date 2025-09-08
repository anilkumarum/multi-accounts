import { onFrameNavigate } from "../scripts/sub_frame.js";

export async function setCookie(cookie, url, tabId) {
	const siteData = (await chrome.storage.session.get(tabId))[tabId];
	cookie.samesite && (cookie.samesite = cookie.samesite.toLowerCase());
	const setDetails = {
		name: cookie.name,
		value: cookie.value,
		domain: cookie.domain,
		path: cookie.path,
		expirationDate: cookie.expires ? new Date(cookie.expires).getTime() : undefined,
		httpOnly: cookie.httponly,
		secure: true,
		sameSite: cookie.samesite === "none" ? "unspecified" : cookie.samesite,
		url: url,
	};
	chrome.cookies.set(setDetails).catch((err) => console.log(err));
}

export function parseCookie(cookieString) {
	const attributes = cookieString.split(";");
	const [name, value] = attributes.shift().split("=");
	const cookie = { name, value };

	for (const attr of attributes) {
		const [key, value] = attr.split("=");
		cookie[key.trimStart().toLowerCase()] = value ? value : true;
	}

	return cookie;
}

export async function injectFuncScript(tabId, frameId, ...args) {
	try {
		await chrome.scripting.executeScript({
			target: { tabId, frameIds: [frameId] },
			func: onFrameNavigate,
			args: args,
			world: "MAIN",
			injectImmediately: true,
		});
	} catch (error) {}
}
