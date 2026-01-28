export default {
	generateAiPrompt () {
		const prompt = `Use the product links provided below to gather accurate product information. 
Based on the information from these sources:

1. Generate an SEO‑optimised product name suitable for use in WooCommerce.
2. Write a concise, factual short description (suitable for WooCommerce's "short description" field).
3. Write a detailed long description that is informative, well‑structured, and suitable for a product page.
4. Do not include emojis, special characters, or decorative symbols.

Source URLs for reference: 
- ${product_ref_one.text}
- ${product_ref_two.text}

If available, also use the product specification sheet here:
- ${spec_sheet_url.text}

Ensure that:
- All details are accurate and based only on the provided sources.
- No copyrighted text is copied verbatim; rewrite all content in original wording.
- The tone should be professional, neutral, and suitable for e‑commerce.

Format the long description using clear sections such as:
- Overview
- Key Features
- Specifications
- What's Included

Do not invent specifications, features, or claims that are not supported by the provided sources.

Do not include in-line reference links.

Return the final output in this structure:

Product Name:
Short Description:
Long Description:`;
		try {
			copyToClipboard(prompt);
			showAlert("Copied AI Prompt!", 'success')
			navigateTo("https://copilot.microsoft.com", {},"NEW_WINDOW")
		} catch {
			showAlert("Failed to copy Prompt", 'error')
		}
	},
	async insertSpecSheet(fileObject = spec_sheet.files[0]) {
		try {
			const uploadInfo = await requests.uploadMediaBinary(fileObject)
			const uploadInfoFiltered = {
				id: uploadInfo.id,
				fileName: (uploadInfo.guid.rendered).split('/').pop(),
				url: uploadInfo.guid.rendered
			}
			storeValue("uploadInfo", uploadInfoFiltered)
			resetWidget('spec_sheet')
			showAlert("Succesfully uploaded Spec Sheet to site!", "success")
		} catch (err) {
			removeValue("uploadInfo")
			showAlert(`Failed to upload Spec Sheet. Err: ${err.message}`, "error")
		}
	},
	clearAll() {
		resetWidget('product_name')
		resetWidget('brand')
		resetWidget('product_sku')
		resetWidget('category')
		resetWidget('weight')
		resetWidget('height')
		resetWidget('length')
		resetWidget('width')
		resetWidget('short_description')
		resetWidget('long_description')
		resetWidget('spec_sheet')
		Text3.setText("")
		removeValue("uploadInfo")
	},
	generateAttachmentCode(length = 13) {
		const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
		return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
	},
	categoryIdArray() {
		const categoryList = category.selectedOptionValues;
		const categoryArray = [];
		for (const value of categoryList) {
			categoryArray.push({ id: value });
		}
		return categoryArray;
	},
	async addProduct() {
		try {
			const productInfo = await Create_a_product.run()
			this.clearAll()
			navigateTo("All Products", {sku: productInfo.sku}, "SAME_WINDOW")
		} catch(err) {
			showAlert(Create_a_product.data.message, 'error')
		}
	},
	async testFunc() {
		const testVar = await requests.uploadMediaBinaryOrUrl({
			imageUrl: 'https://images.pexels.com/photos/34857354/pexels-photo-34857354.jpeg',
			meta: { alt_text: 'Blue sofa', caption: 'New spring range' }
		});
		return testVar

	}
}