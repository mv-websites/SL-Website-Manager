export default {
	async getAllOrders (group, search, status, customer, per_page, page) {
		const orders = await List_All_Orders.run({group, search, status, customer, per_page, page})
		const totalCount = List_All_Orders.responseMeta.headers['X-Total-Count'][0];

		// Flatten metadata into order object
		const transformedOrders = orders.map(order => {
			const meta = order.meta_data || [];

			// Helper to extract metadata by key
			const getMetaValue = (key) => {
				const item = meta.find(m => m.key === key);
				return item ? item.value : false;
			};

			return {
				...order,
				_purchase_order_file_path: getMetaValue("_purchase_order_file_path"),
				_purchase_order_number: getMetaValue("_purchase_order_number"),
				meta_data: undefined
			};
		});

		return {
			total_records: totalCount,
			orders: transformedOrders
		};
	},
	test () {
		requests.getAllOrders.data.order
	},
	async uploadMediaBinary(fileObject) {
		const myHeaders = {
			"Content-Disposition": `attachment; filename=${fileObject.name}`,
			"Content-Type": fileObject.type,
			"Authorization": "Basic c2wtYXBpLXNlcnZpY2U6UnZQUyAzU1ZZIE5zQ2QgVVMzRiBQa0hDIGs5YmE="
		};

		const file = fileObject.data;
		const base64 = file.split(",")[1];

		const binaryString = atob(base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		const requestOptions = {
			method: "POST",
			headers: myHeaders,
			body: bytes,
			redirect: "follow"
		};

		const response = await fetch(
			"https://www.service-line.co.uk/wp-json/wp/v2/media",
			requestOptions
		);

		const text = await response.json();  // actual WordPress response
		console.log("Upload response:", text);
		return text;
	},
	async uploadPO(order_id, uploadedFile) {
		try {
			const fileInfo = await requests.uploadMediaBinary(uploadedFile)
			await Update_order_PO.run({
				id: order_id,
				file_path: fileInfo.guid.raw.replace("https://www.service-line.co.uk/wp-content/uploads", ""),
				order_number: Input2.text
			})
			resetWidget("FilePicker1")
			utils.clearModal2()
			closeModal(Modal2.name)
			showAlert("Uploaded and saved succesfully!", "success")
			await utils.statusSetting(utils.statusSetting.data)
		} catch (err) {
			console.log(err)
			showAlert(err.message, "error")
		}
	}
}