export default {
	async BER_Assets_v3 () {
		const live = await All_BER_Assets.run(); // from DB1
		const replacements = await Assets_With_Replacement_Select.run(); // from DB2

		// Create a Set of all replacement eq_codes for fast lookup
		const replacementSet = new Set(replacements.map(r => r.eq_code));

		// Map over live equipment and add eq_code_exists flag
		return live.map(item => ({
			...item,
			eq_code_exists: replacementSet.has(item.eq_code) ? 1 : 0
		}));
	},
	async uploadPDF() {
		try {
			const eq_code = parseInt(All_Assets_BER.triggeredRow.eq_code, 10);
			
			const response = await Create_Media_Item.run();

			const insertStatus = await Insert_BER.run({eq_code: eq_code, url: response.source_url });
			
			showAlert("Uploaded File Succesfully!", "success")
			
			await Requests.getMergedEquipmentData()
			
			closeModal(Upload_BER_Modal.name)
			
			return insertStatus;
		} catch (err) {
			showAlert(err.message, "error")
		}
	},

}
