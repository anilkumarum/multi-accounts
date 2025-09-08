const iFrame = document.createElement("iframe");
const siteUrl = location.hash.slice(1);
if (!siteUrl) alert("Site url required");
URL.canParse(siteUrl) && (iFrame.src = siteUrl);
document.body.prepend(iFrame);

document.head.querySelector("link[rel='icon']")["href"] =
	`https://s2.googleusercontent.com/s2/favicons?domain=${new URL(siteUrl).host}`;

onmessage = (event) => {
	if (event.data?.[0] === "navigate") {
		const [_, url, title, favIcon] = event.data;
		url && (location.hash = url);
		title && (document.title = title);
		favIcon && (document.head.querySelector("link[rel='icon']")["href"] = favIcon);
	}
};
