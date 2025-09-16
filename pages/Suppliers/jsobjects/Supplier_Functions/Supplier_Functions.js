export default {
	calculatePrice (listPrice, supplierDiscount, markup) {
		supplierDiscount = supplierDiscount/100;
		markup = markup/100;
		const priceAfterSupplierDiscount = (listPrice * (1-supplierDiscount)) || 1;
		return `${priceAfterSupplierDiscount * (1+markup)}`
	},
	async updateProductPricing () {
		const count = await Supplier_Product_Count.run({"id": Table1.updatedRow.id})
		const loopCount = Math.ceil((count[0]?.row_count || 1)/100);		
		
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
		
		}
		// console.log(testVar)
		// Get all products where the supplier ID = 123
		// LOOP1: for each 100 products
			// map products to { id: 123, regular_price: 123 }
			// Post to website the mapped products
		
			// LOOP2: for each product that has a variation
				// map variations to { id: 123, regular_price: 123 }
				// Post to website the mapped variations
	}
}