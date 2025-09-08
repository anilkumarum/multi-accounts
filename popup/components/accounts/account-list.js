import { AccountBox } from "./account-box.js";
import { Account, getAccounts } from "../../db/account-db.js";
// @ts-ignore
import accountCss from "../../style/account-box.css" with { type: "css" };
document.adoptedStyleSheets.push(accountCss);

export class AccountList extends HTMLElement {
	constructor(domain) {
		super();
		this.domain = domain;
	}

	/** @param {Account[]} accounts*/
	render(accounts) {
		return accounts.map((account, index) => new AccountBox(account, index));
	}

	async connectedCallback() {
		const accounts = await getAccounts(this.domain);
		this.replaceChildren(...this.render(accounts));
	}
}

customElements.define("account-list", AccountList);
