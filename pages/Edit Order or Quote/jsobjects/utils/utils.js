export default {
	updateBilling () {
		return "billing_details.formData"
	},
	updateShipping () {
		return "shipping_details.formData"
	},
	formatLineItems() {
		const formattedItems = List1.currentItemsView.map((item) => {
			return {
				id: item.ItemID.text,
				quantity: item.Qty.text,
				total: item.Total.text
			}
		})
		return formattedItems
	},
	async updateLineItems(order_id) {
		const body = {
			"id": order_id,
			"line_items": utils.formatLineItems(),
			"calculate_totals": true
		}
		try {
			await Update_an_order.run({id: order_id, body: body});
			showAlert("Updated succesfully!", "success")
		} catch (err) {
			showAlert("Update failed!", "error")
		}
		await data.retrieveAnOrderLineItems();
		return body;
	}
}