# EDD API Chrome Extension
This Chrome extension allows you to fetch and display Easy Digital Downloads (EDD) purchase records directly from FreshDesk tickets or by manually entering an email.

![Popup Example](https://github.com/wpbean/EDD-API-Chrome-Extension/blob/main/Screenshot1.png?raw=true)

![FreshDesk Example](https://github.com/wpbean/EDD-API-Chrome-Extension/blob/main/Screenshot2.png?raw=true)

## 🚀 Setup & Installation
Follow these steps to set up and use the extension:

### 1️⃣ Clone the Repository
```
git clone https://github.com/wpbean/EDD-API-Chrome-Extension.git
cd EDD-API-Chrome-Extension
```

### 2️⃣ Update API URL
Open popup.js and content.js, and update the EDD Proxy Server API URL:
```
const apiUrl = "http://localhost:5050/fetch-sales?email=";
```
Replace http://localhost:5050 with your actual server URL.

### 3️⃣ Update Static URLs
In content.js and popup.js, update static URLs like:
```
let customerURL = `https://wpbean.com/wp-admin/edit.php?post_type=download&page=edd-customers&view=overview&id=${customerID}`;
```
Replace https://wpbean.com with your own domain if necessary.

### 4️⃣ Update FreshDesk URL in manifest.json
If your FreshDesk URL is different, update the host_permissions and matches fields in manifest.json:
```
{
    "host_permissions": ["https://yourcompany.freshdesk.com/a/tickets/*"],
    "content_scripts": [
        {
            "matches": ["https://yourcompany.freshdesk.com/a/tickets/*"],
            "js": ["content.js"],
            "css": ["style.css"]
        }
    ]
}
```
Replace yourcompany.freshdesk.com with your actual FreshDesk domain.

### 5️⃣ Load the Extension in Chrome
1. Open Chrome and go to chrome://extensions/
2. Enable Developer mode (top-right corner)
3. Click Load unpacked
4. Select the EDD-API-Chrome-Extension folder

### 6️⃣ Using the Extension
* FreshDesk Integration: The extension automatically detects customer emails in FreshDesk and fetches purchase records.
* Manual Email Lookup: Open the extension popup and enter an email to fetch purchase records manually.

## 🛟 Want to support?
Please give this repo a star for helping me.