document.addEventListener("DOMContentLoaded", function () {
	const tabWrapper = document.querySelector('[data-hd-tabs="wrapper"]');
	const newTabBtn = tabWrapper?.querySelector('[data-hd-tabs="new-tab"]');
	const tabTemplate = tabWrapper?.querySelector('[data-hd-tabs="tab"]');

	if (!tabWrapper || !tabTemplate || !newTabBtn) {
		console.warn(
			"[Tabs] Required elements not found, aborting tab system initialization."
		);
		return;
	}

	const TABS_STORAGE_KEY = "hd-tabs-list";
	const ACTIVE_TAB_KEY = "hd-tabs-active";

	function getSavedTabs() {
		try {
			const tabs = JSON.parse(localStorage.getItem(TABS_STORAGE_KEY)) || [];
			console.log("[Tabs] Loaded from storage:", tabs);
			return tabs;
		} catch (e) {
			console.log("[Tabs] Error loading from storage:", e);
			return [];
		}
	}

	function saveTabs(tabs) {
		console.log("[Tabs] Saving to storage:", tabs);
		localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
	}

	function getActiveTab() {
		const active = localStorage.getItem(ACTIVE_TAB_KEY) || "";
		console.log("[Tabs] Getting active tab:", active);
		return active;
	}

	function setActiveTab(href) {
		console.log("[Tabs] Setting active tab:", href);
		localStorage.setItem(ACTIVE_TAB_KEY, href);
	}

	function createTabElement(href, label, isActive) {
		console.log("[Tabs] Creating tab element:", { href, label, isActive });
		const tab = tabTemplate.cloneNode(true);
		tab.setAttribute("href", href);
		tab.style.display = ""; // Make sure it's visible
		if (isActive) tab.classList.add("active");
		const tabTextDiv = tab.querySelector(".tab_text");
		if (tabTextDiv) {
			tabTextDiv.textContent = label || href;
		} else {
			tab.textContent = label || href;
		}
		// Accessibility: ensure close button has aria-label
		const closeBtn = tab.querySelector('[data-hd-tabs="close-tab"]');
		if (closeBtn) {
			closeBtn.setAttribute("aria-label", "Close tab");
		}
		return tab;
	}

	function renderTabs() {
		console.log("[Tabs] Rendering tabs...");
		// Remove all tabs except the template and newTabBtn
		tabWrapper.querySelectorAll('[data-hd-tabs="tab"]').forEach((tab) => {
			if (tab !== tabTemplate) tab.remove();
		});
		const tabs = getSavedTabs();
		const activeHref = getActiveTab();
		tabs.forEach((tabData) => {
			// Prevent rendering the template tab or duplicate Home tab
			if (tabData.href === tabTemplate.getAttribute("href")) return;
			const isActive = tabData.href === activeHref;
			const tab = createTabElement(tabData.href, tabData.label, isActive);
			tabWrapper.insertBefore(tab, newTabBtn);
		});
		console.log("[Tabs] After render, tabs:", tabs);
	}

	// Initial render
	tabTemplate.style.display = "none"; // Hide template
	renderTabs();

	// Handle tab and close button clicks
	tabWrapper.addEventListener("click", function (e) {
		e.preventDefault();
		const closeBtn = e.target.closest('[data-hd-tabs="close-tab"]');
		if (closeBtn) {
			// Prevent close button click from bubbling to tab activation
			e.stopPropagation();
			const tab = closeBtn.closest('[data-hd-tabs="tab"]');
			if (tab) {
				const href = tab.getAttribute("href");
				let tabs = getSavedTabs();
				tabs = tabs.filter((t) => t.href !== href);
				console.log("[Tabs] Removing tab:", href, "New tabs array:", tabs);
				saveTabs(tabs);
				if (getActiveTab() === href) {
					// If closing active tab, switch to first tab or new tab
					const nextTab = tabs[0] || { href: newTabBtn.getAttribute("href") };
					setActiveTab(nextTab.href);
					console.log("[Tabs] Closed active tab, switching to:", nextTab.href);
					window.location.href = nextTab.href;
				} else {
					renderTabs();
				}
			}
			return;
		}

		const tab = e.target.closest('[data-hd-tabs="tab"]');
		if (tab && tab !== tabTemplate) {
			const href = tab.getAttribute("href");
			console.log("[Tabs] Tab clicked:", href);
			setActiveTab(href);
			window.location.href = href;
			e.preventDefault();
		}
	});

	// Handle new tab creation
	newTabBtn.addEventListener("click", function (e) {
		e.preventDefault();
		let newHref = newTabBtn.getAttribute("href");
		if (!newHref) {
			console.log("[Tabs] New tab button has no href, defaulting to '/'.");
			newHref = "/";
		}

		const currentUrl =
			window.location.pathname + window.location.search + window.location.hash;
		const currentLabel = document.title || currentUrl;

		let tabs = getSavedTabs();
		console.log("[Tabs] Before new tab, tabs:", tabs);
		// Remove any existing tab with the same href as the currentUrl
		tabs = tabs.filter((tab) => tab.href !== currentUrl);
		console.log("[Tabs] After removing currentUrl, tabs:", tabs);
		// Prevent duplicate Home tab (assume Home is '/')
		if (currentUrl === "/" && tabs.some((tab) => tab.href === "/")) {
			console.log("[Tabs] Home tab already exists, not adding duplicate.");
		} else {
			tabs.unshift({ href: currentUrl, label: currentLabel });
			console.log("[Tabs] After unshift current, tabs:", tabs);
		}

		// Prevent duplicate new tab
		if (!tabs.some((tab) => tab.href === newHref)) {
			tabs.push({ href: newHref, label: "New tab" });
			console.log("[Tabs] Added new tab:", newHref, "Tabs now:", tabs);
		} else {
			console.log("[Tabs] New tab already exists:", newHref);
		}
		saveTabs(tabs);
		setActiveTab(newHref);
		window.location.href = newHref;
	});

	// On page load, set the current tab as active if not already
	const currentUrl =
		window.location.pathname + window.location.search + window.location.hash;
	if (getActiveTab() !== currentUrl) {
		setActiveTab(currentUrl);
	}
	renderTabs(); // Always render tabs on load
});
