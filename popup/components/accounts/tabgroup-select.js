import { html } from "../../js/om.event.js";
import { getGroups } from "../../js/constant.js";
import { TabGroupUpdator } from "../helper/tabgroup-updator.js";
// @ts-ignore
import tabGroupCss from "../../style/tabgroup-select.css" with { type: "css" };
document.adoptedStyleSheets.push(tabGroupCss);

export class TabgroupSelect extends HTMLElement {
	constructor(tabId, pageX, pageY) {
		super();
		this.tabId = tabId;
		this.style.left = pageX - 100 + "px";
		this.style.top = pageY + 15 + "px";
	}

	async groupTabsInExistGroup(tabGroupId) {
		try {
			await chrome.tabs.group({ tabIds: this.tabId, groupId: tabGroupId });
			$("marked-action")?.remove();
			notify(i18n("added_in_tabgroup"));
		} catch (error) {
			console.error(error);
		}
	}

	async onTabGroupSelect({ target }) {
		const li = target.closest("li");
		const tabGroupId = +li.id;
		if (tabGroupId) {
			await this.groupTabsInExistGroup(tabGroupId);
			return fireEvent(this, "group", li.firstElementChild.textContent.trim());
		}
		this.appendChild(new TabGroupUpdator(null, this.tabId));
	}

	render() {
		const groupItem = (tabgroup) => `<li id=${tabgroup.id}>
			<cite>${tabgroup.title}</cite>
			<atom-icon ico="edit" title="Edit group"></atom-icon>
		</li>`;
		return html`${this.tabGroups.map(groupItem).join("")}
			<li>${i18n("create_group")}</li>`;
	}

	async connectedCallback() {
		this.id = "tabgroup-list";
		this.setAttribute("popover", "");
		this.tabGroups = await getGroups({});
		this.replaceChildren(this.render());
		this.showPopover();
		$on(this, "click", this.onTabGroupSelect);
		$on(this, "toggle", (event) => event.newState === "closed" && this.remove());
	}
}

customElements.define("tabgroup-select", TabgroupSelect);
