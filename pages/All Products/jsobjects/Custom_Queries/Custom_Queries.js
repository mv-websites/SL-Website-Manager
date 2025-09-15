export default {
	async getVariations (variableProductId) {
		Modal_Table.setData([])
		const variations = await Get_Product_Variations.run({
        id: variableProductId,
      });
		console.log(variations)
		Modal_Table.setData(variations)
		return variations;
	}
}