chrome.action.getUserSettings(onUserSettingsChanged);
chrome.action.onUserSettingsChanged.addListener(onUserSettingsChanged);

function onUserSettingsChanged(obj) {
	const varElem = document.getElementById("pin_ext");
	varElem.textContent = obj.isOnToolbar ? "pinned" : "not pinned";
	varElem.style.color = obj.isOnToolbar ? "limegreen" : "red";
}

/**@type {HTMLTableElement} */
const keyShortcutTable = document.getElementById("global-keyboard-shortcuts");

for (let index = 1; index < keyShortcutTable.rows.length; index++) {
	const actionBtn = keyShortcutTable.rows[index].lastElementChild;
	actionBtn.addEventListener("click", () => chrome.tabs.create({ url: "chrome://extensions/shortcuts" }));
}

const { missingShortcuts } = await chrome.storage.local.get("missingShortcuts");
if (missingShortcuts) {
	for (const gks of missingShortcuts) {
		const cellElem = document.getElementById(gks.name);
		cellElem.style.color = "red";
		cellElem.style.border = "1px solid";
		cellElem.firstElementChild.textContent = `${gks.shortcut} not set`;
		cellElem.nextElementSibling.firstElementChild.textContent = "Set Shortcut";
	}
}
