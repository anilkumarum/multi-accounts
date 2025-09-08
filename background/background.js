import { addAccount } from "./add-account.js";
import { injectFuncScript, parseCookie, setCookie } from "./cookie.js";

import("./add-account.js");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if ((request.command = "addAccount")) return addAccount(request.data);
	if ((request.command = "setReceiveHeadersObserver")) {
		setHeaderListener(request.tabId, request.host, request.storage);
		if (request.profile) {
			chrome.action.setBadgeText({ tabId: request.tabId, text: request.profile });
			chrome.action.setTitle({ tabId: request.tabId, title: request.profile });
		}
	}
});

async function onTabActivate({ tabId }) {
	try {
		await new Promise((r) => setTimeout(r, 3000));
		const tab = await chrome.tabs.get(tabId);
		if (!tab.url?.startsWith("https://multi-account")) return;
	} catch (error) {}
}
// chrome.tabs.onActivated.addListener(onTabActivate);

async function setHeaderListener(tabId, host, storage) {
	const accountTabIds = (await chrome.storage.session.get("accountTabIds")).accountTabIds ?? [];
	await chrome.storage.session.set({ accountTabIds });

	function onHeadersReceived(details) {
		if (details.type === "sub_frame" && details.parentFrameId === 0)
			setTimeout(() => injectFuncScript(details.tabId, details.frameId, host, storage), 20);

		const setCookieHeaders = details.responseHeaders.filter((header) => header.name === "set-cookie");
		if (setCookieHeaders && setCookieHeaders.length !== 0) {
			for (const setCookieHeader of setCookieHeaders) {
				const cookie = parseCookie(setCookieHeader.value);
				setCookie(cookie, details.url, details.tabId.toString());
			}
		}
	}
	const filter = { tabId, types: ["sub_frame", "xmlhttprequest", "websocket"], urls: ["https://*/*"] };
	const extraInfo = ["responseHeaders", "extraHeaders"];
	// @ts-ignore
	chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, filter, extraInfo);
}

export const setInstallation = ({ reason }) => {
	async function oneTimeInstall() {
		chrome.commands.getAll(async (commands) => {
			const missingShortcuts = [];
			for (const gks of commands) gks.shortcut === "" && missingShortcuts.push(gks);
			missingShortcuts.length === 0 || (await chrome.storage.local.set({ missingShortcuts }));
			chrome.tabs.create({ url: "/guide/welcome-guide.html" });
		});
		//> uninstall survey setup
		const LAMBA_KD = crypto.randomUUID();
		chrome.storage.local.set({ modHeaderEnable: true, extUserId: LAMBA_KD });
		const SURVEY_URL = `https://uninstall-feedback.pages.dev/?e=${chrome.runtime.id}&u=${LAMBA_KD}`;
		chrome.runtime.setUninstallURL(SURVEY_URL);
	}
	reason === "install" && oneTimeInstall();
};

// installation setup
chrome.runtime.onInstalled.addListener(setInstallation);
