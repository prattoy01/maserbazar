# Homepage banner management

Open `/admin`, enter the existing store access key, and select **ব্যানার পরিচালনা** (Banner management).

You can add or edit Bengali/English titles and descriptions, select a product collection, choose a color, upload a JPG/PNG/WebP image (up to 3 MB), and preview the result. Choose **উপরের স্লাইডার** for the top slideshow or **পণ্যের সারির উপরে** for a product-row banner. A plain theme shows a collection heading without a colored banner.

Use the up/down buttons to change order within the chosen placement. Hide/show keeps the banner saved. Delete asks for confirmation. The manager supports up to 20 banners. Uploaded image removal clears its reference from a banner; it does not delete shared image data.

Changes save to the database and appear on a fresh homepage load, with no deployment required. Empty collections do not show a product row. Product assignment, availability and pricing continue to be managed in the product editor.

Conflicting saves are rejected using a revision number. Refresh the manager to load the latest list before retrying. Admin writes require the existing access key and same-site requests; image links accept HTTPS or an existing uploaded image.

Migration: `0006_homepage_banners.sql` creates the settings table and seeds the existing two slideshow banners and five collections. It is applied to the local and Vercel testing databases.
