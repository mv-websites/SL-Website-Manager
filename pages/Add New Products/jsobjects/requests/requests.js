export default {
	async fullProductCategoryList () {
		const initialPage = 1;

		// 1) Fetch first page and detect total pages
		const firstPageData = await List_all_product_categories.run({ page_number: initialPage });
		const totalPagesHeader = List_all_product_categories?.responseMeta?.headers?.["X-WP-TotalPages"];
		const totalPages = Number(totalPagesHeader || 1);

		// 2) Start with first page data
		let allCategories = Array.isArray(firstPageData)
		? firstPageData
		: (List_all_product_categories.data || []);

		// 3) Fetch remaining pages and combine
		for (let page = initialPage + 1; page <= totalPages; page++) {
			const nextPageData = await List_all_product_categories.run({ page_number: page });
			const pageArray = Array.isArray(nextPageData)
			? nextPageData
			: (List_all_product_categories.data || []);
			allCategories = allCategories.concat(pageArray);
		}

		// 4) De-duplicate by id (safety)
		const byId = new Map();
		for (const c of allCategories) {
			if (c && typeof c.id !== "undefined") byId.set(c.id, c);
		}
		allCategories = Array.from(byId.values());

		// 5) Build node map with children arrays
		const nodes = new Map();
		allCategories.forEach(c => nodes.set(c.id, { ...c, children: [] }));

		// 6) Link children to parents
		const roots = [];
		nodes.forEach(node => {
			const parentId = node.parent;
			if (parentId && parentId !== 0 && nodes.has(parentId)) {
				nodes.get(parentId).children.push(node);
			} else {
				roots.push(node);
			}
		});

		// 7) Sort roots and all descendants (menu_order then name)
		const sortRecursively = (arr) => {
			arr.sort((a, b) => {
				const ao = typeof a.menu_order === "number" ? a.menu_order : 0;
				const bo = typeof b.menu_order === "number" ? b.menu_order : 0;
				if (ao !== bo) return ao - bo;
				return String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" });
			});
			arr.forEach(n => n.children && n.children.length && sortRecursively(n.children));
		};
		sortRecursively(roots);

		// 8) Transform to the requested shape and omit everything else
		const toOptionTree = (node) => {
			const option = {
				label: String(node.name || ""),
				value: String(node.id)
			};
			if (node.children && node.children.length) {
				option.children = node.children.map(toOptionTree);
			}
			return option;
		};

		const result = roots.map(toOptionTree);

		// 9) Clean up action state
		List_all_product_categories.clear();

		// 10) Return exactly the required array shape
		return result;
	}
}