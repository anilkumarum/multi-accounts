import { partitionLocalStorage } from "../../scripts/storage-partition.js";

import { getDomainFromUrls, injectFuncScript } from "./util.js";
import { moveCookies } from "./cookie-action.js";
import { getTabs } from "./constant.js";

export async function addAccount(host, profile) {
	try {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		const urls = await extractAllFrameUrls(tab.id);
		const origins = getDomainFromUrls(urls);
		host.domain.startsWith("https://") && origins.push(host.domain + "/*");
		if (!(await chrome.permissions.contains({ origins }))) {
			const { HostPermission } = await import("../components/helper/host-permission.js");
			return document.body.appendChild(new HostPermission({ origins, urls, host, profile }));
		}

		const promises = urls.map((url) => moveCookies(url));
		await Promise.all(promises);
		const storage = await injectFuncScript(partitionLocalStorage, tab.id);
		await openAccount(host, tab.url, profile, storage);
		setTimeout(() => chrome.tabs.reload(tab.id), 100);
	} catch (error) {
		console.error(error);
	}
}

/**
 * @param {{domain:string,path:string}} host
 * @param {string} profile */
export async function openAccount(host, url, profile, storage, group) {
	try {
		const [tab] = await getTabs({ active: true, currentWindow: true });

		const { id } = await chrome.tabs.create({
			url: `${host.domain}${host.path}#${url}`,
			index: tab.index + 1,
			active: false,
		});

		const message = { command: "setReceiveHeadersObserver", tabId: id, host: host.domain, profile, storage };
		await chrome.runtime.sendMessage(message);
		setTimeout(() => chrome.tabs.update(id, { active: true }), 100);

		group === "ungrouped" || (await applyTabGroup(id, group));
	} catch (error) {
		console.error(error);
	}
}

async function extractAllFrameUrls(tabId) {
	function getUrl() {
		return location.protocol === "https:" ? location.href : null;
	}

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId, allFrames: true },
			func: getUrl,
		});
		return results.map((frame) => frame.result).filter((url) => url);
	} catch (error) {
		console.info(error);
	}
}

async function applyTabGroup(tabId, groupTitle) {
	if (!chrome.tabGroups) return;
	const tabGroups = await chrome.tabGroups?.query({ title: groupTitle });
	const createdTabGroups = (await getStore("createdTabGroups")).createdTabGroups ?? {};

	async function addTabinGroup() {
		if (tabGroups.length != 0) {
			chrome.tabs.group({ tabIds: tabId, groupId: tabGroups[0].id });
		} else {
			try {
				const newId = await chrome.tabs.group({ tabIds: tabId });
				chrome.tabGroups.update(newId, { collapsed: false, title: groupTitle, color: "grey" });
				setStore({ createdTabGroups });
			} catch (error) {
				console.warn(error);
			}
		}
	}

	addTabinGroup();
}
