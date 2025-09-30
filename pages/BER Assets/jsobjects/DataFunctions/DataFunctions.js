export default {
	async getProductsQuery (page = 1, search = "", order = "desc", orderby = "date") {
		try {
			const rawData = await Get_Products.run({
				page,
				order,
				orderby,
				search: (search ? search : "")
			})
			const assignedTiers = await Asset_Repl_Stat.run({"eq_code": appsmith.store.eq_code})

			const sanitisedData = rawData.map((product) => {
				const tier = assignedTiers.find(tier => tier.post_id === product.id);
				console.log("TIER: ", tier)
				return {
					id: product.id,
					name: product.name,
					brand: product.brands?.[0]?.name || "",
					price: product.price,
					permalink: product.permalink,
					images: product.images[0]?.src || "https://www.service-line.co.uk/wp-content/uploads/woocommerce-placeholder.png",
					assigned_option: (tier? tier.status_level : "" )
				}
			})
			return sanitisedData;
		} catch (err) {
			showAlert(`Could not get product list: ${err.message}`, "ERROR")
		}
	},
	async getReplacementOption () {
		// Get database entries where eq_code = ?
	},
	async setTable1Data (page, search) {
		storeValue("isTableLoading", true); 
		
		const products = await DataFunctions.getProductsQuery(page, search);

		storeValue("products", products);  

		storeValue("isTableLoading", false); 
	},
	categoryTreeTransform(categories, parentId = 0) {
    function buildTree(cats, parent) {
    return cats
      .filter(cat => cat.parent === parent)
      .map(cat => ({
        label: cat.name,
        value: String(cat.id),
        children: buildTree(cats, cat.id)
      }));
  }

  return buildTree(categories, parentId);
	}
}