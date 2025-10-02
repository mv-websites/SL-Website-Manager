export default {
	async getProducts () {
	const sqlData = await Asset_Repl_Stat.run({ eq_code: appsmith.store.eq_code });

		// Build the full products object
		const selectedProducts = {};

		// Loop through all entries
		for (const item of sqlData) {
			const productDetails = await Retrieve_a_Product.run({ product_id: item.post_id });

			const keyName = item.status_level.toLowerCase() + "Product"; // e.g., goldProduct
			selectedProducts[keyName] = {
				id: productDetails.id,
				name: productDetails.name,
				imageURL: productDetails.images[0]?.src || "",
				short_description: productDetails.short_description,
				price: productDetails.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
				permalink: productDetails.permalink
			};
		}

		// Store the entire object **once**, outside the loop
		storeValue("selectedReplacementProducts", selectedProducts);

		return sqlData;
	},
	removeValues(){
		removeValue("selectedReplacementProducts")
	}
}