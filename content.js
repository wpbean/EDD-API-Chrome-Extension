(async function () {
    let lastFetchedEmail = null;
    let debounceTimeout = null;
    let lastURL = location.href; // Track the last visited URL

    function getEmailFromPage() {
        let emailElement = document.querySelector(".info-details-content"); // Email selector
        return emailElement ? emailElement.innerText.trim() : null;
    }

    function createInfoBox(data) {
        let ticketContainer = document.querySelector(".info-details"); // Ticket container selector
        if (!ticketContainer) return;

        // Remove existing box if already added
        let existingBox = document.querySelector(".edd-info-box");
        if (existingBox) existingBox.remove();

        // Extract required data
        let customerID = data.sales[0]?.customer_id || "N/A";
        let totalSpent = data.sales
            .reduce((sum, order) => sum + parseFloat(order.total), 0)
            .toFixed(2);

        let customerURL = `https://wpbean.com/wp-admin/edit.php?post_type=download&page=edd-customers&view=overview&id=${customerID}`;
        let customerLink =
            customerID !== "N/A"
                ? `<a class="text--xsmall" href="${customerURL}" target="_blank">${customerID}</a>`
                : "N/A";

        let products = [];
        let licenses = [];

        data.sales.forEach((order) => {
            let orderDate = new Date(order.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

            order.products.forEach((product) => {
                let formattedPrice = parseFloat(product.price).toFixed(2);
                products.push(`
                    <li>
                        <a class="text--semibold" href="https://wpbean.com/wp-admin/edit.php?post_type=download&page=edd-payment-history&view=view-order-details&id=${order.ID}" target="_blank">${product.name}</a>
                        <span class="order-date text--verylightgrey mt-4">${orderDate} - $${formattedPrice}</span>
                    </li>
                `);
            });

            order.licenses.forEach((license) => {
                let statusClass = `status-${license.status.toLowerCase()}`;
                licenses.push(`
                    <li>
                        <span class="${statusClass}"></span>
                        <span class="license-key" title="${license.name}">${license.key}</span>
                    </li>
                `);
            });
        });

        let productsList = products.length
            ? `<ul class="mb-10">${products.join("")}</ul>`
            : "<p>No products found.</p>";
        let licensesList = licenses.length
            ? `<ul class="license-list">${licenses.join("")}</ul>`
            : "<p>No licenses found.</p>";

        let infoBox = document.createElement("div");
        infoBox.classList.add("edd-info-box");
        infoBox.innerHTML = `
            <div class="edd-box">
                <div class="mb-10 d-flex g-5"><div class="text__infotext text--xsmall">Customer ID:</div> ${customerLink}</div>
                <div class="mb-10 d-flex g-5"><div class="text__infotext text--xsmall">Total Spent:</div> <span class="text--xsmall">$${totalSpent}</span></div>
                <div class="text__infotext text--xsmall">Purchased Products:</div>
                ${productsList}
                <div class="text__infotext text--xsmall">Licenses:</div>
                ${licensesList}
            </div>
        `;

        // Append to the ticket container
        ticketContainer.appendChild(infoBox);
    }

    async function fetchAndDisplayEDDData(email) {
        if (!email || email === lastFetchedEmail) return;
        lastFetchedEmail = email;

        console.log("Fetching EDD purchases for:", email);

        let ticketContainer = document.querySelector(".info-details"); // Ticket container selector
        if (!ticketContainer) return;

        // ✅ Show loading indicator
        let loadingIndicator = document.createElement("div");
        loadingIndicator.classList.add("edd-loading");
        loadingIndicator.innerHTML = `<span class="spinner"></span> Fetching purchase details...`;

        // Remove any existing info box before showing loading
        let existingBox = document.querySelector(".edd-info-box");
        if (existingBox) existingBox.remove();

        ticketContainer.appendChild(loadingIndicator);

        try {
            let response = await fetch(
                `http://localhost:5050/fetch-sales?email=${encodeURIComponent(
                    email
                )}`
            );
            let data = await response.json();

            // ✅ Remove loading indicator
            loadingIndicator.remove();

            if (data.sales && data.sales.length > 0) {
                createInfoBox(data);
            } else {
                let ticketContainer = document.querySelector(".info-details");
                if (!ticketContainer) return;

                // Remove existing box
                let existingBox = document.querySelector(".edd-info-box");
                if (existingBox) existingBox.remove();

                // Create message box
                let noPurchaseBox = document.createElement("div");
                noPurchaseBox.classList.add("edd-info-box");
                noPurchaseBox.innerHTML = `
                    <div class="edd-box">
                        <div class="text--semibold">No purchases found</div>
                        <p class="text--xsmall text--verylightgrey mb-0">Maybe using free version.</p>
                    </div>
                `;

                ticketContainer.appendChild(noPurchaseBox);
            }
        } catch (error) {
            console.error("Error fetching EDD data:", error);
            loadingIndicator.innerHTML = `<span class="error">Error loading data.</span>`;
            setTimeout(() => loadingIndicator.remove(), 3000); // Remove after 3 seconds
        }
    }

    function handleEmailChange() {
        let email = getEmailFromPage();
        if (!email || email === lastFetchedEmail) return;

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => fetchAndDisplayEDDData(email), 500);
    }

    function observePageChanges() {
        let targetNode = document.body;
        let config = { childList: true, subtree: true };

        let observer = new MutationObserver(() => handleEmailChange());
        observer.observe(targetNode, config);

        // ✅ Detect URL changes (for SPA navigation)
        setInterval(() => {
            if (location.href !== lastURL) {
                console.log("URL changed:", location.href);
                lastURL = location.href;
                setTimeout(handleEmailChange, 1000); // Delay to allow content to load
            }
        }, 1000);
    }

    // ✅ Ensure first ticket loads data
    setTimeout(handleEmailChange, 1000);

    // ✅ Observe page changes for FreshDesk SPA
    observePageChanges();
})();
