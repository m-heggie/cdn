class WebflowComponentLoader {
	constructor() {
		this.cache = new Map();
	}

	// Helper to determine if string is a full URL
	isFullUrl(str) {
		try {
			new URL(str);
			return true;
		} catch {
			return false;
		}
	}

	// Helper to construct full URL
	getFullUrl(path) {
		if (this.isFullUrl(path)) {
			return path; // Already a full URL
		}

		// Convert relative path to absolute URL
		if (path.startsWith("/")) {
			return window.location.origin + path;
		} else {
			return window.location.href + "/" + path;
		}
	}

	async loadComponent(componentId, scriptElement) {
		try {
			const componentUrl = this.getFullUrl("/components");
			const cacheKey = `${componentUrl}:${componentId}`;
			let componentHtml = this.cache.get(cacheKey);

			if (componentHtml) {
				console.log(
					`[WebflowComponentLoader] Loaded component '${componentId}' from cache.`
				);
			} else {
				console.log(
					`[WebflowComponentLoader] Fetching component '${componentId}' from: ${componentUrl}`
				);

				const response = await fetch(componentUrl, {
					method: "GET",
					mode: "cors",
					credentials: "same-origin",
				});

				if (!response.ok) {
					console.error(
						`[WebflowComponentLoader] HTTP error! status: ${response.status} for URL: ${componentUrl}`
					);
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				console.log(
					`[WebflowComponentLoader] Successfully fetched HTML for component '${componentId}'.`
				);

				const html = await response.text();
				const parser = new DOMParser();
				const doc = parser.parseFromString(html, "text/html");
				const component = doc.getElementById(componentId);

				if (!component) {
					console.error(
						`[WebflowComponentLoader] Component '${componentId}' not found in fetched HTML from ${componentUrl}`
					);
					throw new Error(
						`Component ${componentId} not found at ${componentUrl}`
					);
				}

				componentHtml = component.outerHTML;
				this.cache.set(cacheKey, componentHtml);
				console.log(
					`[WebflowComponentLoader] Cached component '${componentId}'.`
				);
			}

			// Use the provided scriptElement, or fallback to the last script tag
			const currentScript =
				scriptElement ||
				document.getElementsByTagName("script")[
					document.getElementsByTagName("script").length - 1
				];

			// Create a temporary container to parse the HTML string
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = componentHtml;
			const newElement = tempDiv.firstElementChild;

			// Replace the script tag with the new element
			currentScript.replaceWith(newElement);
			console.log(
				`[WebflowComponentLoader] Inserted component '${componentId}' into DOM.`
			);

			if (window.Webflow) {
				window.Webflow.ready();
			}
		} catch (error) {
			console.error("[WebflowComponentLoader] Error loading component:", error);
			if (error && error.stack) {
				console.error("[WebflowComponentLoader] Stack trace:", error.stack);
			}
			// Use the provided scriptElement, or fallback to the last script tag
			const currentScript =
				scriptElement ||
				document.getElementsByTagName("script")[
					document.getElementsByTagName("script").length - 1
				];
			const errorDiv = document.createElement("div");
			errorDiv.style.padding = "20px";
			errorDiv.style.background = "#fee";
			errorDiv.style.border = "1px solid #fcc";
			errorDiv.style.color = "#c33";
			errorDiv.textContent = `Error loading component: ${error.message}`;
			currentScript.replaceWith(errorDiv);
		}
	}
}

// Initialize
window.componentLoader = new WebflowComponentLoader();

document.addEventListener("DOMContentLoaded", () => {
	const scripts = document.querySelectorAll("script[component]");
	scripts.forEach((script) => {
		const componentId = script.getAttribute("component");
		if (componentId) {
			window.componentLoader.loadComponent(componentId, script);
		}
	});
});
