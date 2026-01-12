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
					"id": Number(Retrieve_an_order.data.shipping_lines[0].id),
					"method_title": Select1.selectedOptionLabel,
					"instance_id": Select1.selectedOptionValue.toString(),
					"total": Input1.text.toString()
				}
			],
			"shipping": {
				"first_name": ShipToFname.text,
				"last_name": ShipToLname.text,
				"company": ShipToCompany.text,
				"address_1": ShipToAddrLn1.text,
				"address_2":ShipToAddrLn2.text,
				"city": ShipToCity.text,
				"state": ShipToState.text,
				"postcode": ShipToPostcode.text,
				"phone": ShipToPhone.text
			},
			"billing": {
				"first_name": BillingFname.text,
				"last_name": BillingLname.text,
				"company": BillingCompany.text,
				"address_1": BillingAddrLn1.text,
				"address_2": BillingAddrLn2.text,
				"city": BillingCity.text,
				"state": BillingState.text,
				"postcode": BillingPostcode.text,
				"email": BillingEmail.text,
				"phone": BillingPhone.text
			},
			"calculate_totals": true
		}
		try {
			await Update_an_order.run({id: order_id, body: body});
			showAlert("Updated succesfully!", "success")
		} catch (err) {
			showAlert("Update failed!", "error")
		}
		resetWidget('Input2')
		Text18.setText("")
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
	},
	async findProductSKU() {
		const productArray = await Retrieve_Product_by_SKU.run()
		const singleProduct = productArray[0]
		Text18.setText(singleProduct.name)
		return singleProduct
	},
	pullCustomerShippingAddress() {
		const shippingAddress = Get_Customer.data.shipping;
		if (!shippingAddress) {
			showAlert("Error pulling customer information", "error")
		}
		ShipToFname.setValue(shippingAddress.first_name)
		ShipToLname.setValue(shippingAddress.last_name)
		ShipToCompany.setValue(shippingAddress.company)
		ShipToAddrLn1.setValue(shippingAddress.address_1)
		ShipToAddrLn2.setValue(shippingAddress.address_2)
		ShipToCity.setValue(shippingAddress.city)
		ShipToState.setValue(shippingAddress.state)
		ShipToPostcode.setValue(shippingAddress.postcode)
		ShipToPostcode.setValue(shippingAddress.phone)
	},
	pullCustomerBillingDetails() {
		const billingDetails = Get_Customer.data.billing;
		if (!billingDetails) {
			showAlert("Error pulling customer information", "error")
		}
		BillingFname.setValue(billingDetails.first_name)
		BillingLname.setValue(billingDetails.last_name)
		BillingCompany.setValue(billingDetails.company)
		BillingAddrLn1.setValue(billingDetails.address_1)
		BillingAddrLn2.setValue(billingDetails.address_2)
		BillingCity.setValue(billingDetails.city)
		BillingState.setValue(billingDetails.state)
		BillingPostcode.setValue(billingDetails.postcode)
		BillingPhone.setValue(billingDetails.phone)
		BillingEmail.setValue(billingDetails.email)
	},
	async saveUpdatedCustomer(order_id = Retrieve_an_order.data.id) {
		const body = {
			"id": order_id,
			"customer_id": Number(Select2.selectedOptionValue)
		}
		try {
			await Update_an_order.run({id: order_id, body: body});
			resetWidget("Select2")
			showAlert("Updated succesfully!", "success")
		} catch (err) {
			showAlert("Update failed!", "error")
		}
		await data.retrieveAnOrderLineItems();
		return body;
	},
	async addNewLineItem(order_id = Retrieve_an_order.data.id) {
		const body = {
			"id": order_id,
			"line_items": [
        {
            "sku": Retrieve_Product_by_SKU.data[0].sku
        }
    ],
		}
		try {
			await Update_an_order.run({id: order_id, body: body});
			resetWidget("Select2")
			showAlert("Updated succesfully!", "success")
		} catch (err) {
			showAlert("Update failed!", "error")
		}
		await data.retrieveAnOrderLineItems();
		return body;
	},
}