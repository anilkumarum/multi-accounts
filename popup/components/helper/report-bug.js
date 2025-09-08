export class ReportBug extends HTMLDialogElement {
	constructor(error) {
		super();
		this.error = error;
		this.gmailUrl = "https://mail.google.com/mail/u/0/";
		this.mailTo = "webrailhelp@gmail.com";
	}

	async reportBug() {
		const { version, short_name } = chrome.runtime.getManifest();
		const stack = this.error.stack?.replaceAll("\n", "%0A");
		let browser = navigator["userAgentData"].brands[0];
		browser.brand.startsWith("Not") && (browser = navigator["userAgentData"].brands[1]);
		const url = `${this.gmailUrl}?to=${this.mailTo}&su=${this.error.message}&body=Error:%20${this.error.message}%0AStack:%20${stack}%0AExtensionId:%20${chrome.runtime.id}%0AExtension%20Name:%20${short_name}%0AExtension%20Version:%20${version}%0ALanguage:%20${navigator.language}%0ABrowser%20Brand:%20${browser.brand}%20${browser.version}%0ABrowser%20Info:%20${navigator.userAgent}&fs=1&tf=cm`;
		await chrome.tabs.create({ url });
	}

	render() {
		return `<h2>😪 ${chrome.i18n.getMessage("sorry_something_went_wrong")} 🐛</h2>
			<p style="max-width: 50ch;overflow-wrap: break-word;">❌ ${this.error.message
				?.replaceAll("<", "&lt;")
				?.replaceAll(">", "&gt;")}</p>
			<button style="font-size: 1rem;margin-inline: auto;display: block;"> 
				🐞 <span>${chrome.i18n.getMessage("report_bug")}</span>
			</button>
			<div style="text-align:center;font-size:x-small;">${chrome.i18n.getMessage("just_one_click")}</div>`;
	}

	connectedCallback() {
		this.id = "report-bug";
		this.innerHTML = this.render();
		this.showModal();
		this.lastElementChild.previousElementSibling.addEventListener("click", this.reportBug.bind(this));
	}
}

customElements.define("report-bug", ReportBug, { extends: "dialog" });
