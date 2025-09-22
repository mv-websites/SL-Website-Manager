export default {
	formatPowerBIFromMeta (meta_data) {
    const item = meta_data.find(d => d.key === "reactive_jobs");
    return item ? item : { "key": "reactive_jobs", "value": "" };
	},
	async formattedCustomerData () {
		const rawData = await Get_Customers.run({"search": Table1.searchText, "page": Table1.pageNo});
		
		const formattedData = rawData.map((customer) => {
			return {
				id: customer.id,
				name: customer.first_name + " " + customer.last_name,
				email: customer.email,
				username: customer.username,
				powerBI: JSObject1.formatPowerBIFromMeta(customer.meta_data).value,
				powerBIObject: JSObject1.formatPowerBIFromMeta(customer.meta_data)
			}
		})

		return formattedData;
	}
}