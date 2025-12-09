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
				return "#fff9c4";
			case "completed":
				return "#e0f7fa";
			case "quote-ready":
				return "#e3f2fd";
			case "quote-requested":
				return "#ffebee";
			case "on-hold":
				return "#f3e5f5";
			default:
				return "#f5f5f5"
		}
	}
}