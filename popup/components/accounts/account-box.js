import { deletePartitionCookies, isPartitionCookiesEmpty } from "../../js/cookie-action.js";
import { Account, deleteAccountInDb, updateAccountInDb } from "../../db/account-db.js";
import { openAccount } from "../../js/add-account.js";
import { ReportBug } from "../helper/report-bug.js";
import { html } from "../../js/om.event.js";

export class AccountBox extends HTMLElement {
	/** @param {Account} account*/
	constructor(account, index) {
		super();
		this.account = account;
		this.style.setProperty("--h", (index * 50).toString());
	}

	async deleteAccount() {
		await deleteAccountInDb(this.account.accountId);
		await deletePartitionCookies(this.account.host.domain, this.account.url);
		this.remove();
	}

	async openAccount() {
		try {
			await openAccount(this.account.host, this.account.url, null, this.account.name, null, this.account.group);
		} catch (error) {
			error.stack += this.account.url;
			console.error(error);
			document.body.appendChild(new ReportBug(error));
		}
	}

	async openTabGroupSelect({ pageX, pageY }) {
		const granted = await chrome.permissions.request({ permissions: ["tabGroups"] });
		if (!granted) return;
		const url = `${this.account.host.domain}${this.account.host.path}*`;
		const tabs = await chrome.tabs.query({ url });
		let tabId;
		for (const tab of tabs)
			if (tab.url.split("#", 2).at(-1).startsWith(this.account.url)) {
				tabId = tab.id;
				break;
			}
		const { TabgroupSelect } = await import("./tabgroup-select.js");
		const tabgroupSelect = new TabgroupSelect(tabId, pageX, pageY);
		$on(tabgroupSelect, "group", this.moveAccountToGroup.bind(this));
		document.body.appendChild(tabgroupSelect);
	}

	async updateAccountName({ target }) {
		this.account.name = target.value;
		await updateAccountInDb(this.account);
	}

	async moveAccountToGroup({ detail: groupName }) {
		this.account.group = groupName;
		$("var", this.lastElementChild).textContent = groupName;
		await updateAccountInDb(this.account);
	}

	render() {
		const hostName = this.account.host.domain.replace("https://", "").replace("chrome-extension://", "");
		return html`<div>
				<atom-icon ico="account" title=""></atom-icon>
				<div><span>${i18n("name")}</span>: <input type="text" value="${this.account.name}" title="${i18n("edit_profile_name")}" @change=${this.updateAccountName.bind(this)} /></div>
				<atom-icon ico="open-account" title="${i18n("open_account_in_new_tab")}" @click=${this.openAccount.bind(this)}></atom-icon>
			</div>
			<div>
				<atom-icon ico="tab"></atom-icon>
				<div><span>${i18n("host")}</span>: <var style="font-size: 0.9rem;">${hostName}</var></div>
			</div>
			<div>
				<atom-icon ico="category"></atom-icon>
				<span>${i18n("group")}</span>: <var>${this.account.group}</var>
				<atom-icon ico="chev-down" title="" @click=${this.openTabGroupSelect.bind(this)}></atom-icon>
				<atom-icon ico="delete" title="${i18n("delete_account")}" @click=${this.deleteAccount.bind(this)}></atom-icon>
			</div>`;
	}

	async connectedCallback() {
		if (await isPartitionCookiesEmpty(this.account.host.domain, this.account.url)) return this.deleteAccount();
		this.replaceChildren(this.render());
	}
}

customElements.define("account-box", AccountBox);
