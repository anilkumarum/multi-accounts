export const Store = {
	Accounts: "Accounts",
};

function onupgradeneeded({ target }) {
	const accountStore = target.result.createObjectStore(Store.Accounts, { keyPath: "accountId" });
	accountStore.createIndex("domain", "domain", { unique: false });
}

/**@returns {Promise<IDBDatabase>} */
export function connect() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("multi-accounts", 1);
		request.onupgradeneeded = onupgradeneeded;
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
		request.onblocked = () => console.warn("pending till unblocked");
	});
}
