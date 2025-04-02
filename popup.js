document.getElementById("fetchData").addEventListener("click", async () => {
    let email = document.getElementById("emailInput").value.trim();
    let resultsDiv = document.getElementById("results");
    let loadingDiv = document.getElementById("loading");

    if (!email) {
        resultsDiv.innerHTML =
            "<p style='color: red;'>Please enter a valid email.</p>";
        return;
    }

    resultsDiv.innerHTML = "";
    loadingDiv.style.display = "block";

    try {
        let response = await fetch(
            `http://localhost:5050/fetch-sales?email=${encodeURIComponent(
                email
            )}`
        );
        let data = await response.json();
        loadingDiv.style.display = "none";

        if (data.sales && data.sales.length > 0) {
            let customerID = data.sales[0]?.customer_id || "N/A";
            let totalSpent = data.sales
                .reduce((sum, order) => sum + parseFloat(order.total), 0)
                .toFixed(2);
            let customerURL = `https://wpbean.com/wp-admin/edit.php?post_type=download&page=edd-customers&view=overview&id=${customerID}`;
            let customerLink =
                customerID !== "N/A"
                    ? `<a href="${customerURL}" target="_blank">${customerID}</a>`
                    : "N/A";

            let products = [];
            let licenses = [];

            data.sales.forEach((order) => {
                let orderDate = new Date(order.date).toLocaleDateString(
                    "en-GB",
                    { day: "2-digit", month: "short", year: "numeric" }
                );

                order.products.forEach((product) => {
                    let formattedPrice = parseFloat(product.price).toFixed(2);
                    products.push(`
                        <li>
                            <a class="text--semibold" href="https://wpbean.com/wp-admin/edit.php?post_type=download&page=edd-payment-history&view=view-order-details&id=${order.ID}" target="_blank">${product.name}</a>
                            <span class="order-date">${orderDate} - $${formattedPrice}</span>
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
                ? `<ul class="products-list mb-10">${products.join("")}</ul>`
                : "<p>No products found.</p>";
            let licensesList = licenses.length
                ? `<ul class="license-list">${licenses.join("")}</ul>`
                : "<p>No licenses found.</p>";

            resultsDiv.innerHTML = `
                <div class="edd-box">
                    <div class="mb-10 d-flex g-5"><div class="text--xsmall">Customer ID:</div> ${customerLink}</div>
                    <div class="mb-10 d-flex g-5"><div class="text--xsmall">Total Spent:</div> <span>$${totalSpent}</span></div>
                    <div class="text--xsmall">Purchased Products:</div>
                    ${productsList}
                    <div class="text--xsmall">Licenses:</div>
                    ${licensesList}
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="edd-box">
                    <div class="text--semibold">No purchases found</div>
                    <p class="text--xsmall text--verylightgrey">Maybe using free version.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error fetching EDD data:", error);
        loadingDiv.style.display = "none";
        resultsDiv.innerHTML =
            "<p style='color: red;'>Error fetching data.</p>";
    }
});
