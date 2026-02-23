import ShippingRatesModel from "../../../Models/ecommerce_model/shipping_rates_model.js";

class ShippingRatesController {
    constructor() {
        this.shippingRatesModel = new ShippingRatesModel();
    }

    async getShippingRates(req, res) {
        try {
            const province_name = req.body?.province_name ?? req.query?.province_name;

            // validation
            if (!province_name) {
                return res.status(400).json({
                    success: false,
                    message: "province_name is required"
                });
            }

            const shippingFee = await this.shippingRatesModel.getShippingFee(province_name);

            console.log(`Shipping fee result: ${shippingFee}`);

            return res.status(200).json({
                success: true,
                shipping_fee: shippingFee || 0
            });

        } catch (error) {
            console.error("Shipping rate error:", error);
            console.error("Error stack:", error.stack);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
}

export default ShippingRatesController;
