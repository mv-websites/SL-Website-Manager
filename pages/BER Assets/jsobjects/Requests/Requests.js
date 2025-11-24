export default {
	async getProducts () {
		removeValue("selectedReplacementProducts");
		showModal(LoadingModal.name)
		const sqlData = await Asset_Repl_Stat.run({ eq_code: appsmith.store.eq_code });
		const replacementStatus = await Get_Asset_replacement_Status.run({eq_code: appsmith.store.eq_code})

		// Build the full products object
		const selectedProducts = {};

		// Loop through all entries
		for (const item of sqlData) {
			const productDetails = await Retrieve_a_Product.run({ product_id: item.post_id });

			const keyName = item.status_level.toLowerCase() + "Product"; // e.g., goldProduct
			selectedProducts[keyName] = {
				id: productDetails.id,
				name: productDetails.name,
				imageURL: productDetails.images[0]?.src || "",
				short_description: productDetails.short_description,
				price: productDetails.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
				permalink: productDetails.permalink
			};
		}

		// Store the entire object **once**, outside the loop
		storeValue("selectedReplacementProducts", selectedProducts);
		storeValue("replacementStatus", replacementStatus[0])
		closeModal(LoadingModal.name)

		return sqlData;
	},
	async updateCustomerLinkDetails () {
		const replacementStatus = await Get_Asset_replacement_Status.run({eq_code: appsmith.store.eq_code})
		storeValue("replacementStatus", replacementStatus[0])
	},
	removeValues(){
		removeValue("selectedReplacementProducts")
	},
	async getMergedEquipmentData() {
		try {
			const liveEquipmentRows = await utils.BER_Assets_v3(); // await BER_Assets.run();
			
			// Get a list of refs to make more efficient queries and exclude unused data from queries below
			const allEquipmentRefs = liveEquipmentRows.map(asset => {return asset.eq_code})
			
			const replacementRows = await Get_All_Asset_Rep_Stat.run({eq_refs: allEquipmentRefs});
			const EqBerLinks = await Get_BER_Links.run({eq_refs: allEquipmentRefs})
			
			// Build a lookup map from replacementRows for fast access
			const replacementMap = new Map();
			replacementRows.forEach(row => {
				const eqCode = String(row.eq_code).trim();
				replacementMap.set(eqCode, row.has_customer_viewed);
			});
			
			// Build lookup map from EqBerLink
			const EqBerMap = new Map();
			EqBerLinks.forEach(row => {
				const eqCode = String(row.eq_code).trim();
				EqBerMap.set(eqCode, row.url);
			});

			// Merge the data
			const mergedData = liveEquipmentRows.map(le => {
				const eqCode = String(le.eq_code).trim();
				const hasCustomerViewed = replacementMap.get(eqCode) ?? 0;
				const hasReplacementOptions = replacementMap.has(eqCode) ? 1 : 0;
				const EqBerLink = EqBerMap.get(eqCode) || ""

				return {
					serviceable: le.Equip_Status_Description,
					Customer: le.Customer,
					Client_Group: le.Client_Group,
					asset_number: le.asset_number,
					serial_number: le.serial_number,
					make_model: le.make_model,
					description: le.description,
					location: le.Location,
					site: le.site,
					postcode: le.Post_Code,
					eq_code: le.eq_code,
					ber_report: EqBerLink, 
					has_replacement_options: hasReplacementOptions,
					has_customer_viewed: hasCustomerViewed
				};
			});

			storeValue("all_assets_ber", mergedData);
			// All_Assets_BER.setData(mergedData);
			return mergedData;

		} catch (error) {
			// await showAlert("Failed to merge equipment data. Check console.", "error");
			return [];
		}
	}

}