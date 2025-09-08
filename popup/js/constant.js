/**@type {chrome.tabs.query} */
export const getTabs = chrome.tabs.query.bind(chrome.tabs),
	/**@type {chrome.tabGroups.query} */
	getGroups = chrome.tabGroups?.query.bind(chrome.tabGroups),
	/**@type {chrome.storage.StorageArea['get']} */
	getSync = chrome.storage.sync.get.bind(chrome.storage.sync),
	/**@type {chrome.storage.StorageArea['set']} */
	setSync = chrome.storage.sync.set.bind(chrome.storage.sync),
	/**@type {chrome.storage.StorageArea['get']} */
	getSession = chrome.storage.session.get.bind(chrome.storage.session),
	/**@type {chrome.storage.StorageArea['set']} */
	setSession = chrome.storage.session.set.bind(chrome.storage.session);

export const colors = ["blue", "red", "yellow", "green", "cyan", "purple", "yellow", "pink", "orange", "grey"];

export const hosts = [{ domain: `chrome-extension://${chrome.runtime.id}`, path: "/site/index.html" }];

export const hostDomains = new Set([chrome.runtime.id]);

export const hostOrigins = new Set([`chrome-extension://${chrome.runtime.id}`]);

export const Profiles = ["❤️ Personal", "🧰 Work", "💰 Banking", "🛒 Shopping", "🗺️ Travel", "🧩 Other"];
