export default {
	async getAllOrders (group, search, status, customer, per_page, page) {
		const orders = await List_All_Orders.run({group, search, status, customer, per_page, page})
		
		return orders;
	}
}