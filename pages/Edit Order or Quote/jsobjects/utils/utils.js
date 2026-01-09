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
			"shipping_lines": [
				{
					"id": Retrieve_an_order.data.shipping_lines[0].id,
					"method_title": Select1.selectedOptionLabel,
					"instance_id": Select1.selectedOptionValue.toString(),
					"total": Input1.text.toString()
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
	},
	notesValue() {
		var note; 
		try {
			note = Retrieve_an_order.data.meta_data.filter((item) => item.key === "_wcpdf_invoice_notes")[0].value
		} catch {
			note = ''
		}
		return note;
	},
	async saveNotes(order_id = Retrieve_an_order.data.id) {
		const body = {
			"id": order_id,
			"meta_data": [
				{
					key: "_wcpdf_invoice_notes",
					value: Notes.text
				}
			]
		}
		try {
			await Update_an_order.run({id: order_id, body: body});
			showAlert("Updated succesfully!", "success")
		} catch (err) {
			showAlert("Update failed!", "error")
		}
		await data.retrieveAnOrderLineItems();
		return body;
	},
	updatePostagePriceText () {
		Input1.setValue(Retrieve_shipping_methods.data.filter(item => item.instance_id == Select1.selectedOptionValue)[0].settings.cost.value)
	}
}