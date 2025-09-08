export function onFrameNavigate(hostOrigin, storage) {
	self.BroadcastChannel = null;
	navigator.serviceWorker.register = () => new Promise((res, rej) => rej());

	if (!globalThis.hostOrigin) {
		globalThis.hostOrigin = hostOrigin;
		function sendMessage(url) {
			const favIcon = document.querySelector('link[rel~="icon"]')?.["href"];
			top.postMessage(["navigate", url ?? location.href, document.title, favIcon], hostOrigin);
		}

		// @ts-ignore
		navigation.addEventListener("navigate", (event) => sendMessage(event.destination.url));
		sendMessage(location.href);
	}

	//remove service worker
	async function unRegisterServiceWorker() {
		const registrations = await navigator.serviceWorker.getRegistrations();
		registrations && registrations.forEach((registration) => registration.unregister());
	}
	unRegisterServiceWorker();
	setTimeout(unRegisterServiceWorker, 1000 * 2);
	setTimeout(unRegisterServiceWorker, 1000 * 60);
}
