export default {
	formatPowerBIFromMeta (meta_data) {
		const item = meta_data.find(d => d.key === "reactive_jobs");
		return item ? item : { "key": "reactive_jobs", "value": "" };
	},
	formatClientGroupFromMeta (meta_data) {
		const item = meta_data.find(d => d.key === "client_group");
		return item ? item : { "key": "client_group", "value": "" };
	},
	formatClientRefFromMeta (meta_data) {
		const item = meta_data.find(d => d.key === "client_ref");
		return item ? item : { "key": "client_ref", "value": "" };
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
				powerBIObject: JSObject1.formatPowerBIFromMeta(customer.meta_data),
				ClientGroup: JSObject1.formatClientGroupFromMeta(customer.meta_data).value,
				ClientGroupObject: JSObject1.formatClientGroupFromMeta(customer.meta_data),
				ClientRefObject: JSObject1.formatClientRefFromMeta(customer.meta_data)
			}
		})
		return formattedData;
	},
	async saveNewUser(email, username, first_name, last_name = "") {
		// Generate a random 3 word password
		function randomWord(length = 5) {
			const letters = "abcdefghijklmnopqrstuvwxyz";
			return Array.from({ length }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
		}
		function getRandomWords(count = 3) {
			return Array.from({ length: count }, () => randomWord()).join('-');
		}
		const password = getRandomWords()

		// Add customer
		var newCustomer;
		try {
			newCustomer = await Create_a_Customer.run({email, first_name, last_name, username, password})
			// Clear Form on success
			resetWidget("first_name");
			resetWidget("last_name");
			resetWidget("username");
			resetWidget("email_address");
			showAlert("Succesfully created customer!", "success")
		} catch (err) {
			showAlert(err.message, "error")
		}
		
		const customerObject = {
			...newCustomer,
			password
		}
		return customerObject;
	}
}