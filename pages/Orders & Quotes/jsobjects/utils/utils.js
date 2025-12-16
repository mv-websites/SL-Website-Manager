export default {
	customerName (group) {
		const clientList = Get_List_Clients_SL.data;
		const item = clientList.find(obj => obj.value === group);
		return item ? item.label : null;
	},
	async statusSetting (selectedStatus = 'all') {
		await requests.getAllOrders(Select1.selectedOptionValue, '', selectedStatus, '', List1.pageSize, 1);
		return selectedStatus;
	},
	statusTypesDtata () {
		return {
			'quote-ready': {'name': 'Quote Ready', bgColor: '#e3f2fd', primaryColor: '#1d4ed8'},
			'quote-requested': {'name': 'Quote Requested', bgColor: '#ffebee', primaryColor: '#ef4444'},
			'completed': {'name': 'Completed', bgColor: '#dcfce7', primaryColor: '#22c55e'},
			'on-hold': {'name': 'Order in Progress', bgColor: '#fff9c4', primaryColor: '#eab308'},
			'processing': {'name': 'Delivery Scheduled', bgColor: '#f3e5f5', primaryColor: '#a855f7'},
			'cancelled': {'name': 'Cancelled', bgColor: '#f5f5f5', primaryColor: '#71717a'},
			'no-status': {'name': 'No Status', bgColor: '#f5f5f5', primaryColor: '#71717a'}
		}
	},
	statusTypes (statusKey = 'quote-ready') {
		const types = utils.statusTypesDtata()
		return types[statusKey];
	},
	statusTypesSelect() {
		const types = utils.statusTypesDtata()
		const result = Object.entries(types).map(([key, value]) => ({ label: value.name, value: key }));
		return result;
	}
}