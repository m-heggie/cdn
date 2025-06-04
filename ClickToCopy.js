const copyButtons = document.querySelectorAll('[data-copy="button"]');

copyButtons.forEach((copyButton) => {
	copyButton.addEventListener("click", function () {
		const buttonText = this.querySelector('[data-copy="button-text"]');
		const jsonEl = this.querySelector('[data-copy="json"]');
		const txtEl = this.querySelector('[data-copy="txt"]');
		if (!buttonText) return;

		const originalText = buttonText.textContent;
		buttonText.textContent = "Copying...";

		if (jsonEl) {
			const componentJson = jsonEl.textContent;

			const copyJson = (event) => {
				event.preventDefault();
				event.clipboardData.setData("application/json", componentJson);
			};

			document.addEventListener("copy", copyJson);
			document.execCommand("copy");
			document.removeEventListener("copy", copyJson);

			setTimeout(() => {
				buttonText.textContent = "Copied!";
				setTimeout(() => {
					buttonText.textContent = originalText;
				}, 1000);
			}, 1000);
		} else if (txtEl) {
			const txtValue = txtEl.textContent;
			navigator.clipboard
				.writeText(txtValue)
				.then(() => {
					setTimeout(() => {
						buttonText.textContent = "Copied!";
						setTimeout(() => {
							buttonText.textContent = originalText;
						}, 1000);
					}, 1000);
				})
				.catch(() => {
					buttonText.textContent = "Failed to copy";
					setTimeout(() => {
						buttonText.textContent = originalText;
					}, 1000);
				});
		} else {
			buttonText.textContent = originalText;
		}
	});
});
