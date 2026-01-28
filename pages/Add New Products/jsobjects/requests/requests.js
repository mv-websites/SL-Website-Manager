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
	},
	async uploadMediaBinary(fileObject) {
		const myHeaders = {
			"Content-Disposition": `attachment; filename=${fileObject.name}`,
			"Content-Type": fileObject.type,
			"Authorization": variables.pageConstants()['api-auth']
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
		return text;
	},
	/**
   * Upload a media file to WordPress via REST:
   * - Pass EITHER a `fileObject` (from FilePicker) OR an `imageUrl`.
   * - Optionally pass `meta` to set alt/caption/title after upload.
   *
   * @param {Object} opts
   * @param {Object} [opts.fileObject] - Appsmith FilePicker file: { name, type, data: 'data:<mime>;base64,...' }
   * @param {string} [opts.imageUrl] - Remote image URL to fetch and upload
   * @param {Object} [opts.meta] - { alt_text, caption, title, description }
   * @returns {Promise<Object>} WordPress media object (JSON)
   */
	async uploadMediaBinaryOrUrl(opts = {}) {
		const { fileObject, imageUrl, meta } = opts;
		if (!fileObject && !imageUrl) {
			throw new Error('Provide either fileObject or imageUrl');
		}

		// ---- 1) Prepare bytes + filename + mime -------------------------------
		let bytes;            // Uint8Array
		let filename;         // string
		let mime;             // string

		if (fileObject) {
			// From FilePicker: data URL like "data:image/jpeg;base64,...."
			const { name, type, data } = fileObject;
			if (!data?.startsWith('data:')) {
				throw new Error('fileObject.data must be a data URL (base64).');
			}
			filename = name || 'upload.bin';
			mime = type || 'application/octet-stream';

			const base64 = data.split(',')[1] || '';
			const binaryString = atob(base64);
			const len = binaryString.length;
			bytes = new Uint8Array(len);
			for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

		} else {
			// From remote URL: fetch as Blob and turn into bytes
			const r = await fetch(imageUrl, { mode: 'cors' }); // may require CORS/allowlist on remote host
			if (!r.ok) throw new Error(`Fetch image failed: ${r.status} ${r.statusText}`);
			const blob = await r.blob();
			const ab = await blob.arrayBuffer();
			bytes = new Uint8Array(ab);

			const urlParts = imageUrl.split('?')[0].split('#')[0].split('/');
			const urlName = urlParts[urlParts.length - 1] || 'image';
			const guessedExt = /\.[a-z0-9]+$/i.test(urlName) ? '' : '.jpg';
			filename = urlName || ('image' + guessedExt);
			mime = r.headers.get('content-type') || 'image/jpeg';
		}

		// ---- 2) Build request -------------------------------------------------
		const authHeader = variables.pageConstants()['api-auth']; // e.g., "Basic base64(user:app-password)" or "Bearer <token>"
		const myHeaders = {
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Content-Type': mime,
			'Authorization': authHeader,
			'Accept': 'application/json',
		};

		const requestOptions = {
			method: 'POST',
			headers: myHeaders,
			// fetch accepts a Uint8Array directly as the body
			body: bytes,
			redirect: 'follow',
		};

		// ---- 3) Upload to WP --------------------------------------------------
		const endpoint = 'https://www.service-line.co.uk/wp-json/wp/v2/media';
		const response = await fetch(endpoint, requestOptions);

		// Better error surfacing
		if (!response.ok) {
			const errText = await response.text().catch(() => '');
			throw new Error(`Upload failed: ${response.status} ${errText}`);
		}

		const media = await response.json(); // WP media object with id, source_url, etc.

		// ---- 4) Optional: patch metadata (alt/caption/title) ------------------
		if (meta && media?.id) {
			// Only send keys provided
			const payload = {};
			if (meta.alt_text != null) payload.alt_text = String(meta.alt_text);
			if (meta.caption != null)  payload.caption  = String(meta.caption);
			if (meta.title != null)    payload.title    = String(meta.title);
			if (meta.description != null) payload.description = String(meta.description);

			if (Object.keys(payload).length) {
				const metaResp = await fetch(`${endpoint}/${media.id}`, {
					method: 'POST', // WP supports POST for update
					headers: {
						'Authorization': authHeader,
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					},
					body: JSON.stringify(payload),
				});
				if (metaResp.ok) {
					const updated = await metaResp.json();
					return updated;
				}
				// If meta update fails, still return the created media
				console.warn('Meta update failed', await metaResp.text());
			}
		}

		return media;
	},
};