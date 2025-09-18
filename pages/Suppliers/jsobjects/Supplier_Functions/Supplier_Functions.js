export default {
	calculatePrice (listPrice, supplierDiscount, markup) {
		supplierDiscount = supplierDiscount/100;
		markup = markup/100;
		const priceAfterSupplierDiscount = (listPrice * (1-supplierDiscount)) || 1;
		const price = (priceAfterSupplierDiscount === 1 ? null : (priceAfterSupplierDiscount * (1+markup)).toFixed(2))
		return `${price}`
	},
	async updateProductPricing () {
		storeValue("loadingStatus", 0);
		showModal(LoadingModal.name)
		const count = await Supplier_Product_Count.run({"id": Table1.updatedRow.id})
		const loopCount = Math.ceil((count[0]?.row_count || 1)/100);		
		
		// Update parent products
		storeValue("loadingStatus", 10);
		for (let i = 0; i < loopCount; i++) {
			const products = await Get_Supplier_Products.run({ offsetVar: 0 * 100 });
			const mappedProducts = products.map((val) => {
				const newPrice = Supplier_Functions.calculatePrice(val.aq_list_price, val.supplier_discount, val.product_markup)
				return {
					"id": val.product_id,
					"regular_price": newPrice
				}
			})
			try {
				await Batch_Update_Products.run({
					body: {
						"update": mappedProducts
					}
				});
				showAlert("Succesfully updated parent products", "success")
			} catch {
				showAlert("Failed to update Parent Products", "error")
			}
			
			// UPDATE VARIATIONS
			const parentIDs = await Get_Parent_IDs.run({parent_id: Table1.updatedRow.id});
			
			// Update each variation under parent ID
			try {
				for (const [index, id] of parentIDs.entries()) {
					const variations = await Get_Supplier_Variations.run({"parent_id": id.parent_product_id});

					const childVariations = variations.map((variation) => {
						const newPrice = Supplier_Functions.calculatePrice(variation.aq_list_price, variation.supplier_discount, variation.product_markup)
						return {
							"id": variation.product_id,
							"regular_price": newPrice
						}
					})

					const response = await Update_Variations.run({
						"parent_id": id.parent_product_id,
						"update": childVariations
					})
					console.log("Update response: ", response)
					const completed = (i * parentIDs.length) + (index + 1); 
					const total = loopCount * parentIDs.length;
					const progress = 10 + Math.floor((completed / total) * 90); 
					storeValue("loadingStatus", progress);
				}
				showAlert("Succesfully updated child products", "success")
			} catch (error) {
				console.log(error)
				showAlert("Failed to update child products", "error")
			}
		}
		closeModal(LoadingModal.name)

	}
}