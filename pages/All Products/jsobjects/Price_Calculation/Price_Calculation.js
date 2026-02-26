export default{
	calculatePrice(listPrice, supplierDiscount, markup, deliveryFee) {
		console.log("calculatePrice Delivery Fee: ", deliveryFee);
		supplierDiscount = Number(supplierDiscount) / 100;
		markup = Number(markup) / 100;

		const priceAfterSupplierDiscount = Number(listPrice) * (1 - supplierDiscount);
		const priceNum = priceAfterSupplierDiscount * (1 + markup);

		const deliveryNum = Number(deliveryFee) || 0;

		// Keep console for debugging
		console.log("PRICE + DELIVERY: ", priceNum, '+', deliveryNum, '=', priceNum + deliveryNum);

		// Return as string with 2 decimals (or as number, up to you)
		return (priceNum + deliveryNum).toFixed(2);
	},
	/**
	* UPDATE PRICE FOR SIMPLE PRODUCTS
	*/
	async updatePrice () {
		// Get Supplier Discount
		const response = await Get_Supplier_Discount.run({
			"product_id": Table1.updatedRow.product_id
		})
		const supplierDiscount = response[0].discount;

		// Calculate new price using updated row information
		const updatedPrice = Price_Calculation.calculatePrice(Table1.updatedRow.aq_list_price, supplierDiscount, Table1.updatedRow.product_markup, Table1.updatedRow.delivery_fee);
		// console.log("UPDATED PRICE: ", updatedPrice)

		// Update the price using WordPress update simple product API
		try {
			const response = await Table1_Update_Price.run({
				body: {
					"regular_price": updatedPrice
				}
			});
			// Update table data
			// await All_Products.run();
			showAlert("Succesfully Updated", "success")
			return response;
		} catch (err) {
			console.log("API error:", err);
			showAlert("Failed to Update", "error")
			return err;
		}
	},
	/**
	* UPDATE PRICE FOR PRODUCT VARIATIONS
	*/
	async updatePriceVariation () {
		// Calculate new price using updated row information
		const updatedPrice = Price_Calculation.calculatePrice(Modal_Table.updatedRow.aq_list_price, JSON.parse(appsmith.store.modalValues).supplier_discount, JSON.parse(appsmith.store.modalValues).markup, JSON.parse(appsmith.store.modalValues).delivery_fee);

		// Update the price using WordPress update product variation API
		try {
			console.log("UPDATED PRICE: ", updatedPrice)
			const response = await Modal_Table_Update_Price.run({
				body: {
					"regular_price": updatedPrice
				}
			});
			console.log("RESPONSE: ", response)
			// Update Table data for viewing
			await Custom_Queries.getVariations(JSON.parse(appsmith.store.modalValues).id)
			showAlert("Succesfully Updated Variation Price", "success")
			return response;
		} catch (err) {
			console.log("API error:", err);
			showAlert("Failed to Update", "error")
			return err;
		}
	},
	/**
	* UPDATE PRICE FOR MULTIPLE PRODUCT VARIATIONS
	*/
	async updateMultipleVariations () {
		// Get Supplier Discount
		const response = await Get_Supplier_Discount.run({
			"product_id": Table1.updatedRow.product_id
		})
		const supplierDiscount = response[0].discount;
		const variableProducts = await Custom_Queries.getVariations(JSON.parse(appsmith.store.modalValues).id)
		const updatedPriceList = variableProducts.map((product) => {
			const newPrice = Price_Calculation.calculatePrice(product.aq_list_price, supplierDiscount, Table1.updatedRow.product_markup, Table1.updatedRow.delivery_fee)

			return {
				"id": product.product_id,
				"regular_price": newPrice
			}
		})

		// Update the price using WordPress update product variation API
		try {
			const response = await Bulk_Update_Variations.run({
				body: {
					"update": updatedPriceList
				}
			});
			showAlert("Succesfully Updated Variations", "success")
			return response;
		} catch (err) {
			console.log("API error:", err);
			showAlert("Failed to Update Variations", "error")
			return err;
		}
	}
}