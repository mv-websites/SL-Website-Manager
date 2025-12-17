export default {
	async myFun2 () {
		const order = await Retrieve_an_order.data;
		// const orderObject = order.json
		resetWidget("Custom1")

		const essentialOrderInfo = {
			id: order.id,
			date_created: order.date_created,
			editableData: {
				status: order.status,
				line_items: order.line_items.map((item) => ({
					id: item.id,
					name: item.name,
					quantity: item.quantity,
					meta_data: item.meta_data
					.filter(
						dataItem =>
						typeof dataItem.value === 'string' &&
						typeof dataItem.display_value === 'string'
					)
					.map(dataItem => ({
						display_key: dataItem.display_key,
						display_value: dataItem.display_value
					}))
				}))
			},
		}

		return essentialOrderInfo

	},
	async testUpdate() {
		return Retrieve_an_order.run()
	},
  fetchOrderData: async () => {
    const response = await Retrieve_an_order.run(); // your API
    return response; // Custom Component property binding will use this
  }
}