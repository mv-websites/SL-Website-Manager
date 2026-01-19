export default {
	async getAllOrders (group, search, status, customer, per_page, page) {
		const orders = await List_All_Orders.run({group, search, status, customer, per_page, page})
		const totalCount = List_All_Orders.responseMeta.headers['X-Total-Count'][0];

		// Flatten metadata into order object
		const transformedOrders = orders.map(order => {
			const meta = order.meta_data || [];

			// Helper to extract metadata by key
			const getMetaValue = (key) => {
				const item = meta.find(m => m.key === key);
				return item ? item.value : false;
			};

			return {
				...order,
				_purchase_order_file_path: getMetaValue("_purchase_order_file_path"),
				_purchase_order_number: getMetaValue("_purchase_order_number"),
				meta_data: undefined
			};
		});

		return {
			total_records: totalCount,
			orders: transformedOrders
		};

		// return { 
		// total_records: totalCount,
		// orders
		// };
	},
	test () {
		requests.getAllOrders.data.order
	}
}