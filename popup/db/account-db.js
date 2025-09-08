import { insertPartitionCookies } from "../js/cookie-action.js";
import { hosts } from "../js/constant.js";
import { connect, Store } from "./db.js";

export class Account {
	/** @param {string} name @param {string} url */
	constructor(name, url) {
		this.accountId = crypto.randomUUID();
		this.name = name;
		this.url = url;
		this.domain = new URL(url).host;
		this.host = null;
		this.group = "ungrouped";
		this.color = null;
		this.createAt = Date.now();
	}

	async setHost() {
		this.host = await getHost(this.domain);
	}
}

/** @param {string} domain*/
export async function getHost(domain) {
	return new Promise((resolve, reject) => {
		connect().then((db) => {
			const store = db.transaction(Store.Accounts, "readwrite").objectStore(Store.Accounts);
			const storeIdx = store.index("domain");
			const queryTask = storeIdx.getAll(IDBKeyRange.only(domain));
			queryTask.onsuccess = ({ target }) => {
				const hostDomains = new Set(target["result"].map((account) => account.host.domain));
				for (const host of hosts) if (!hostDomains.has(host.domain)) return resolve(host);
			};
			queryTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/** @param {string} domain*/
export async function getAccounts(domain) {
	return new Promise((resolve, reject) => {
		connect().then((db) => {
			const store = db.transaction(Store.Accounts, "readwrite").objectStore(Store.Accounts);
			const storeIdx = store.index("domain");
			const queryTask = storeIdx.getAll(IDBKeyRange.only(domain));
			queryTask.onsuccess = ({ target }) => resolve(target["result"]);
			queryTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

export async function getAllAccounts() {
	return new Promise((resolve, reject) => {
		connect().then((db) => {
			const store = db.transaction(Store.Accounts, "readwrite").objectStore(Store.Accounts);
			const queryTask = store.getAll();
			queryTask.onsuccess = ({ target }) => resolve(target["result"]);
			queryTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/**@param {Account} account*/
export async function insertAccountInDb(account) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.Accounts, "readwrite").objectStore(Store.Accounts);
			const putTask = store.add(account);
			putTask.onsuccess = (e) => resolve(e);
			putTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/**@param {Account[]} accounts*/
export async function insertMultiAccountInDb(accounts) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const transaction = db.transaction(Store.Accounts, "readwrite");
			const store = transaction.objectStore(Store.Accounts);
			for (const account of accounts) {
				if (account["cookies"] && account["cookies"].length !== 0) {
					insertPartitionCookies(account["cookies"], account.url);
					account.accountId ??= crypto.randomUUID();
					account.domain ??= new URL(account.url).host;
					store.put(account);
				}
			}
			transaction.oncomplete = (e) => resolve(e);
			transaction.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/**@param {Account} account*/
export async function updateAccountInDb(account) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.Accounts, "readwrite").objectStore(Store.Accounts);
			const putTask = store.put(account);
			putTask.onsuccess = (e) => resolve(e);
			putTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

export async function deleteAccountInDb(accountId) {
	return new Promise((resolve, reject) => {
		connect().then(async (db) => {
			const store = db.transaction(Store.Accounts, "readwrite").objectStore(Store.Accounts);
			const deleteTask = store.delete(accountId);
			deleteTask.onsuccess = (e) => resolve(e);
			deleteTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}
