export default {
	async getAllOrders (group, search, status, customer, per_page, page) {
		const orders = await List_All_Orders.run({group, search, status, customer, per_page, page})
		const totalCount = List_All_Orders.responseMeta.headers['X-Total-Count'][0];
		
		return { 
			total_records: totalCount,
			orders
		};
	},
	test () {
		requests.getAllOrders.data.order
	}
}