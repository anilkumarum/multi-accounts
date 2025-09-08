import { colors } from "../../js/constant.js";
import { html } from "../../js/om.event.js";

export class TabGroupUpdator extends HTMLElement {
	/** @type {HTMLInputElement}*/
	titleInput;

	/** @param {chrome.tabGroups.TabGroup} tabGroup, @param {number} [tabId] */
	constructor(tabGroup, tabId) {
		super();
		this.tabGroup = tabGroup;
		this.tabId = tabId;
	}

	async updateGroup() {
		try {
			const tabGroupId = this.tabGroup?.id ?? (await chrome.tabs.group({ tabIds: this.tabId }));

			await chrome.tabGroups.update(tabGroupId, {
				collapsed: false,
				title: this.titleInput.value,
				color: this.color,
			});
			fireEvent(this.parentElement, "group", this.titleInput.value);
			this.remove();
			$("marked-action")?.remove();
		} catch (error) {
			console.error(error);
		}
	}

	onColorPick({ target }) {
		this.color = target.value;
	}

	render() {
		const clrItem = (color) => `<label style="--clr:${color}">
			<input type="radio" name="group-color" value="${color}" hidden />
		</label>`;

		return html`<div class="color-box" @change=${this.onColorPick.bind(this)}>${colors.map(clrItem).join("")}</div>
			<input
				type="text"
				part="title-input"
				list="group_titles"
				value="${this.tabGroup?.title ?? ""}"
				placeholder="${i18n("update_tabgroup_title")}" />
			<button @click=${this.updateGroup.bind(this)}>${this.tabGroup ? "Update" : "Create"}</button>
			<datalist id="group_titles"></datalist>`;
	}

	connectedCallback() {
		this.id = "tabgroup-updator";
		this.setAttribute("popover", "");
		this.replaceChildren(this.render());
		this.addDataList();
		this.showPopover();
		// @ts-ignore
		this.titleInput = this.children[1];
		$on(this, "toggle", (event) => event.newState === "closed" && this.parentElement.remove());
	}

	//create tabgroup for colorpot input suggestion
	async addDataList() {
		try {
			const { tabGroups } = await getStore("tabGroups");
			if (!tabGroups) return;
			const groupFrag = new DocumentFragment();
			for (const key of Object.keys(tabGroups)) {
				const opt = document.createElement("option");
				opt.value = key;
				groupFrag.appendChild(opt);
			}
			this.lastElementChild.appendChild(groupFrag);
		} catch (error) {
			console.error(error);
		}
	}
}

customElements.define("tabgroup-updator", TabGroupUpdator);
