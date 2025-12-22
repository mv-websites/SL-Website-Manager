export default {
	updateBilling () {
		return "billing_details.formData"
	},
	updateShipping () {
		return "shipping_details.formData"
	},
	async updateLineItems(order_id, line_item_id, lite_item_qty, line_item_total) {
		const body = {
			"id": order_id,
			"line_items": [
				{
					"id": line_item_id,
					"quantity": lite_item_qty,
					"total": line_item_total
				}
			],
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