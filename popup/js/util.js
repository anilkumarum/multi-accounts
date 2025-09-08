export function getDomainFromUrls(urls) {
	const domains = [];

	for (const linkUrl of urls) {
		if (URL.canParse(linkUrl)) {
			const url = new URL(linkUrl);
			const origin = `*://${url.host}/*`;
			domains.indexOf(origin) === -1 && domains.push(origin);

			if (url.host.indexOf(".") === url.host.lastIndexOf(".")) continue;
			const index = url.host.lastIndexOf(".", url.host.lastIndexOf(".") - 1) + 1;
			const topDomain = url.host.slice(index);
			const topOrigin = `*://*.${topDomain}/*`;
			domains.indexOf(topOrigin) === -1 && domains.push(topOrigin);
		}
	}
	return domains;
}

export async function validateImportKeys(account) {
	const neededKeys = new Set(["url", "host", "cookies"]);
	Object.keys(account).every((key) => neededKeys.has(key));
}

export async function reportSite() {
	const gmailUrl = "https://mail.google.com/mail/u/0/";
	const mailTo = "webrailhelp@gmail.com";
	const { version, short_name } = chrome.runtime.getManifest();
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const error = `${i18n("cannot_add_account")}%20%0A${tab.url}%0APlease%20fix%20the%20Issue%20ASAP%0A`;
	let browser = navigator["userAgentData"].brands[0];
	browser.brand.startsWith("Not") && (browser = navigator["userAgentData"].brands[1]);
	const url = `${gmailUrl}?to=${mailTo}&su=${error}&body=Error:%20${error}%0AExtensionId:%20${chrome.runtime.id}%0AExtension%20Name:%20${short_name}%0AExtension%20Version:%20${version}%0ALanguage:%20${navigator.language}%0ABrowser%20Brand:%20${browser.brand}%20${browser.version}%0ABrowser%20Info:%20${navigator.userAgent}&fs=1&tf=cm`;
	await chrome.tabs.create({ url });
}

/** @param {() => void} func @param {number} tabId*/
export async function injectFuncScript(func, tabId, arg = null) {
	const results = await chrome.scripting.executeScript({
		target: { tabId, allFrames: true },
		func: func,
		args: [arg],
	});
	return results.map((result) => result.result);
}
