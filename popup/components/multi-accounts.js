import { Account, getHost, insertAccountInDb } from "../db/account-db.js";
import { AccountList } from "./accounts/account-list.js";
import { addAccount } from "../js/add-account.js";
import { TopBar } from "./toolbar/top-bar.js";
import { html } from "../js/om.event.js";
// @ts-ignore
import multiAccountsCss from "../style/multi-accounts.css" with { type: "css" };
import { ReportBug } from "./helper/report-bug.js";
import { hostDomains, Profiles } from "../js/constant.js";
document.adoptedStyleSheets.push(multiAccountsCss);

export class MultiAccounts extends HTMLElement {
	constructor() {
		super();
	}

	async addAccount(url) {
		try {
			const profile = Profiles[this.children[2].childElementCount];
			const host = await getHost(new URL(url).host);
			await addAccount(host, profile);
		} catch (error) {
			error.stack += url;
			console.error(error);
			document.body.appendChild(new ReportBug(error));
		}
	}

	render(tabData, profileName) {
		const domain = new URL(tabData.url).host;
		const siteInfo = html`<site-info>
			<img src="${tabData.favIconUrl}" />
			<div>
				<div class="title">${tabData.title.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</div>
				<div class="domain">${domain}</div>
			</div>
		</site-info>`;
		hostDomains.has(domain) && (eId("reportSite").hidden = true);
		const addBtn = !hostDomains.has(domain)
			? html`<button id="add-account" @click=${this.addAccount.bind(this, tabData.url)}><atom-icon ico="plus" title="Add new Account"></atom-icon> ${i18n("add_account")}</button>`
			: html`<div>Profile name: ${profileName}</div> <p>Cannot add acccount on this site</p>`;
		return [new TopBar(), siteInfo, new AccountList(domain), addBtn];
	}

	async connectedCallback() {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (tab.url.startsWith("https://chromewebstore.google.com/") || tab.url.startsWith("chrome://")) {
			eId("reportSite").hidden = true;
			return document.body.appendChild(new Text("MultiAccount cannot work on chrome web store and chrome://"))
		}

		const tabData = { url: tab.url, title: tab.title, favIconUrl: tab.favIconUrl };
		const profileName = await chrome.action.getTitle({ tabId: tab.id });
		this.replaceChildren(...this.render(tabData, profileName));
	}
}

customElements.define("multi-accounts", MultiAccounts);
