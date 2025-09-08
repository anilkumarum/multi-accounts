import { getAllAccounts, insertMultiAccountInDb } from "../../db/account-db.js";
import { getPartitionCookies } from "../../js/cookie-action.js";
import { validateImportKeys } from "../../js/util.js";
import { html } from "../../js/om.event.js";

export class TopBar extends HTMLElement {
	constructor() {
		super();
	}

	async downloadAccounts(accounts) {
		const fileBlob = new Blob([accounts], { type: "application/json" });
		const a = document.createElement("a");
		a.setAttribute("href", URL.createObjectURL(fileBlob));
		a.setAttribute("download", `multi_accounts-${new Date().toISOString()}.json`);
		a.click();
	}

	async exportCookie() {
		const accounts = await getAllAccounts();
		const promises = [];
		for (const account of accounts) promises.push(await getPartitionCookies(account.host.domain, account.url));
		const accountCookies = await Promise.all(promises);
		for (let index = 0; index < accounts.length; index++) accounts[index].cookies = accountCookies[index];
		this.downloadAccounts(JSON.stringify(accounts));
	}

	onFileUpload(event) {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = async (evt) => {
			const textData = evt.target.result;
			if (typeof textData !== "string") return;
			if (file.type !== "application/json") return;
			try {
				const accounts = JSON.parse(textData);
				console.log(accounts);
				if (Array.isArray(accounts) && validateImportKeys(accounts[0])) insertMultiAccountInDb(accounts);
				else alert("Imported data is invalid");
			} catch (error) {
				console.error(error);
			}
		};
		reader.onerror = (event) => console.error(event);
		reader.readAsText(file);
	}

	render() {
		return html`<span>multiAccounts</span>
			<label>
				<atom-icon
					ico="account-plus"
					title="${i18n("import_accounts")}"></atom-icon>
				<input type="file" accept="application/json" @change=${this.onFileUpload.bind(this)} hidden />
			</label>

			<atom-icon
				ico="export"
				title="${i18n("export_all_accounts")}"
				@click=${this.exportCookie.bind(this)}></atom-icon>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("top-bar", TopBar);
