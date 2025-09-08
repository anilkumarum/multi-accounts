import { html } from "../../js/om.event.js";

const cssStyleSheet = new CSSStyleSheet();
cssStyleSheet.insertRule(`#host-permission {
	width: 24rem;

	& h2 {
		text-align: center;
	}

	& li {
		margin-block: 0.4em;
		font-size: smaller;
		text-decoration: underline;
	}

	& button {
		--btn-clr: dodgerblue;
		display: block;
		text-align: center;
		margin-inline: auto;
		width: 84%;
		padding-block: 0.3em;
		border-radius: 0.4em;
		border: none;
		background-color: var(--btn-clr);
		font-size: 0.96rem;
		color: #fff;
		text-align: center;
		font-weight: bold;
		cursor: pointer;

		& + button {
			margin-top: 0.5em;
		}
	}
}`);

document.adoptedStyleSheets.push(cssStyleSheet);

export class HostPermission extends HTMLDialogElement {
	constructor(data) {
		super();
		this.data = data;
	}

	async requestPermission(allPages) {
		this.data.origins = allPages ? ["<all_urls>"] : this.data.origins;
		const message = { command: "addAccount", data: this.data };
		const response = await chrome.runtime.sendMessage(message);
	}

	render() {
		return html`<h2>🔐 ${i18n("permission_required")}</h2>
			<p>${i18n("webpage_permission_required")}</p>
			<ol>${this.data.origins.map((page) => `<li>${page}</li>`).join("")}</ol>
			<button @click=${this.requestPermission.bind(this, false)}>
				${i18n("grant_permission_for_above_webpages")}
			</button>
			<button style="--btn-clr:orange" @click=${this.requestPermission.bind(this, true)}>
				${i18n("grant_permission_for_all_webpages")}
			</button>`;
	}

	connectedCallback() {
		this.id = "host-permission";
		this.replaceChildren(this.render());
		this.showModal();
		document.body.style.minHeight = "20lh";
		document.body.style.minWidth = "27em";
	}
}

customElements.define("host-permission", HostPermission, { extends: "dialog" });
