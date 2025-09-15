export default{
	calculatePrice (listPrice, supplierDiscount, markup) {
		supplierDiscount = supplierDiscount/100;
		markup = markup/100;
		const priceAfterSupplierDiscount = (listPrice * (1-supplierDiscount)) || 1;
		return `${priceAfterSupplierDiscount * (1+markup)}`
	},
	async updatePrice () {

		const response = await Get_Supplier_Discount.run({
			"product_id": Table1.updatedRow.product_id
		})
		const supplierDiscount = response[0].discount;
		

		const updatedPrice = Price_Calculation.calculatePrice(Table1.updatedRow.aq_list_price, supplierDiscount, Table1.updatedRow.product_markup);
		try {
			const response = await Table1_Update_Price.run({
				body: {
					"regular_price": updatedPrice
				}
			});
			await All_Products.run();
			showAlert("Succesfully Updated", "success")
			return response;
		} catch (err) {
			console.log("API error:", err);
			showAlert("Failed to Update", "error")
    	return err;
		}
		
	}
}