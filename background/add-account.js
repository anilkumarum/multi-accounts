import { Account, insertAccountInDb } from "../popup/db/account-db.js";
import { partitionLocalStorage } from "../scripts/storage-partition.js";
import { openAccount } from "../popup/js/add-account.js";
import { moveCookies } from "../popup/js/cookie-action.js";
import { getTabs } from "../popup/js/constant.js";
import { injectFuncScript } from "./cookie.js";

/**
 * @param {Object} param0
 * @param {string[]} param0.origins
 * @param {string[]} param0.urls
 * @param {{domain:string,path:string}} param0.host
 * @param {string} param0.profile  */
export async function addAccount({ origins, urls, host, profile }) {
	try {
		const granted = await chrome.permissions.request({ origins });
		if (!granted) return;
		const promises = urls.map((url) => moveCookies(url, ));
		await Promise.all(promises);

		const [tab] = await getTabs({ active: true, currentWindow: true });
		const storage = await injectFuncScript(partitionLocalStorage, tab.id);
		await openAccount(host, tab.url, , profile, storage);

		const account = new Account(profile, tab.url);
		account.host = host;
		await insertAccountInDb(account);
		setTimeout(() => chrome.tabs.reload(tab.id), 300);
	} catch (error) {
		console.error(error);
	}
}
