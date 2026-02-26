export default {
	getPriceBreakdown(listPrice, supplierDiscount, markup, deliveryFee) {
		const lp = Number(listPrice);
		const sd = Number(supplierDiscount) / 100;
		const mu = Number(markup) / 100;
		const df = Number(deliveryFee);

		// Step calculations
		const priceAfterDiscount = lp * (1 - sd);
		const priceAfterMarkup = priceAfterDiscount * (1 + mu);
		const pricePlusDelivery = priceAfterMarkup + df;

		// Format to 2 decimals for display
		const discountPriceFmt = priceAfterDiscount.toFixed(2);
		const markupPriceFmt = priceAfterMarkup.toFixed(2);
		const deliveryPriceFmt = pricePlusDelivery.toFixed(2);

		// Return final formatted breakdown
		return `<u>SELECT A PRODUCT TO SEE PRICING BREAKDOWN</u>
List Price: £${lp} - Supplier Discount: ${supplierDiscount}% 
= £${discountPriceFmt}
+ 
Markup: ${markup}% 
= £${markupPriceFmt}
+ 
Delivery: £${df}
<b>*Price (Excl. VAT) = £${deliveryPriceFmt}</b>`;
	}

}