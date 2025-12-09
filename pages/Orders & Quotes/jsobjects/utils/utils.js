export default {
	customerName (group) {
		const clientList = Get_List_Clients_SL.data;
		const item = clientList.find(obj => obj.value === group);
  	return item ? item.label : null;
	},
	statusSetting (selectedStatus = 'all') {
		return selectedStatus;
	},
	itemBackgroundColor (status) {
		switch (status) {
			case "processing":
				return "#fef9c3";
			case "completed":
				return "#dcfce7";
			case "quote-ready":
				return "#dbeafe";
			case "quote-requested":
				return "#fee2e2";
			case "on-hold":
				return "#f3e8ff";
			default:
				return "#f4f4f5"
		}
	}
}