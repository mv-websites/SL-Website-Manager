export default {
	async getProductsQuery (page = 1, search = "", order = "desc", orderby = "date") {
		const rawData = await Get_Products.run({
			page,
			order,
			orderby,
			search: (search ? search : "")
		})
		
		const sanitisedData = rawData.map((product) => {
			return {
				id: product.id,
				name: product.name,
				brand: product.brands?.[0]?.name || "",
				price: product.price,
				permalink: product.permalink,
				images: product.images[0]?.src || "https://www.service-line.co.uk/wp-content/uploads/woocommerce-placeholder.png"
			}
		})
		return sanitisedData;
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