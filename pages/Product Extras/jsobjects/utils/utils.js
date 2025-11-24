export default {
	async GetLabels () {
		try {
			storeValue("isLoading", true)
			const data = await Get_Labels.run({page: Table1.pageNo, per_page: Table1.pageSize, search: Table1.searchText})
			storeValue("isLoading", false)
			return data;
		} catch (error) {
			showAlert(error.message, "error")
		}
	},
	async UpdateLabelPrice (label, amount, description) {
		try{
			const data = await Update_Label_Price.run({label, amount, description})
			showAlert(`Succesfully updated ${data.label} details!`, "success")
			await utils.GetLabels();
			return data;
		} catch (error) {
			showAlert(error.message, "error")
		}
	}
}