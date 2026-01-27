export default {
	async fullProductCategoryList () {
		// 1) Fetch first page
		const initialPage = 1;
		const firstPageResp = await List_all_product_categories.run({ page_number: initialPage });

		const headers = List_all_product_categories.responseMeta?.headers || {};
		const totalPages =
					Number(
						headers["X-WP-TotalPages"] ??
						headers["x-wp-totalpages"] ??
						headers["X-Wp-Totalpages"]
					) || 1;

		// 2) Start category list
		let allCategories = Array.isArray(firstPageResp)
		? firstPageResp
		: (List_all_product_categories.data || []);

		// 3) Fetch and merge additional pages
		for (let page = initialPage + 1; page <= totalPages; page++) {
			const pageData = await List_all_product_categories.run({ page_number: page });
			const items = Array.isArray(pageData) ? pageData : (List_all_product_categories.data || []);
			allCategories = allCategories.concat(items);
		}

		// 4) Remove duplicates just in case
		const seen = new Set();
		allCategories = allCategories.filter(c => {
			if (seen.has(c.id)) return false;
			seen.add(c.id);
			return true;
		});

		// 5) Build lookup map
		const categoryMap = {};
		allCategories.forEach(cat => {
			categoryMap[cat.id] = { ...cat, children: [] };
		});

		// 6) Build tree structure
		const roots = [];
		allCategories.forEach(cat => {
			if (cat.parent === 0) {
				roots.push(categoryMap[cat.id]);
			} else if (categoryMap[cat.parent]) {
				categoryMap[cat.parent].children.push(categoryMap[cat.id]);
			}
		});

		// 7) Sort parents and all children alphabetically
		function sortTree(nodeList) {
			nodeList.sort((a, b) => a.name.localeCompare(b.name));
			nodeList.forEach(node => {
				if (node.children.length > 0) {
					sortTree(node.children);
				}
			});
		}

		sortTree(roots);

		// 8) Flatten into list with indentation
		function flattenTree(nodes, depth = 0) {
			const result = [];

			nodes.forEach(node => {
				const prefix = depth > 0 ? `${"— ".repeat(depth)} ` : "";
				result.push({
					key: `${prefix}${node.name}`,
					value: node.id
				});

				if (node.children.length > 0) {
					result.push(...flattenTree(node.children, depth + 1));
				}
			});

			return result;
		}

		const finalList = flattenTree(roots);

		List_all_product_categories.clear();

		return finalList;
	},
	async fullBrandList () {
		// 1) Fetch first page
		const initialPage = 1;
		const firstPageResp = await List_all_brands.run({ page_number: initialPage });

		// Handle header casing differences
		const headers = List_all_brands.responseMeta?.headers || {};
		const totalPages =
					Number(
						headers["X-WP-TotalPages"] ??
						headers["x-wp-totalpages"] ??
						headers["X-Wp-Totalpages"]
					) || 1;

		// 2) Start list
		let allBrands = Array.isArray(firstPageResp)
		? firstPageResp
		: (List_all_brands.data || []);

		// 3) Fetch remaining pages
		for (let page = initialPage + 1; page <= totalPages; page++) {
			const pageData = await List_all_brands.run({ page_number: page });
			const items = Array.isArray(pageData) ? pageData : (List_all_brands.data || []);
			allBrands = allBrands.concat(items);
		}

		// 4) Remove duplicates just in case
		const seen = new Set();
		allBrands = allBrands.filter(b => {
			if (seen.has(b.id)) return false;
			seen.add(b.id);
			return true;
		});

		// 5) Sort alphabetically
		allBrands.sort((a, b) => a.name.localeCompare(b.name));

		// 6) Convert to { key, value }
		const finalList = allBrands.map(brand => ({
			key: brand.name,
			value: brand.id
		}));

		// 7) Clear query cache
		List_all_brands.clear();

		return finalList;
	}
}