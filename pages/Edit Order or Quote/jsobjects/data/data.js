export default {
	async myFun2 () {
		const order = await Retrieve_an_order.data;
		// const orderObject = order.json

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

		await Get_Customer.run({"customer_id": order.customer_id})

		return essentialOrderInfo

	},
	async retrieveAnOrderLineItems() {
		// Retrieve_an_Order Query is set to Manual. This function should be set to autmatic/on page load
		const order = await Retrieve_an_order.run();
		await Get_Customer.run({"customer_id": order.customer_id })
		if (!order?.line_items?.length) return [];
		

		return order.line_items.map((item) => {
			// Product URL
			const productUrl = item.product_id
			? `https://service-line.co.uk/?p=${item.product_id}`
			: null;

			// Meta data processing
			const meta = (item.meta_data || [])
			.filter((m) => !m.key.startsWith("_"))
			.map((m) => {
				let value = m.display_value;

				// Ignore if not a string or empty
				if (typeof value !== "string" || !value.trim()) return null;

				// Ignore JSON objects/arrays
				try {
					const parsed = JSON.parse(value);
					if (typeof parsed === "object") return null;
				} catch (e) {
					// Not JSON, fine
				}

				// Handle objects safely
				if (typeof value === "object") {
					if (Array.isArray(value)) value = value.join(", ");
					else value = JSON.stringify(value);
				}

				return {
					key: m.display_key,
					value: value,
				};
			})
			.filter(Boolean); // Remove nulls

			return {
				id: item.id,
				name: item.name,
				sku: item.sku || null,
				image: item.image?.src || null,
				quantity: item.quantity,
				total: Number(item.total).toFixed(2),
				productUrl,
				meta,
			};
		});
	}
}