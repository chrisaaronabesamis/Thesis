import { connect } from '../../core/database.js';

class ShippingRatesModel {
    constructor() {
        this.db = null;
        this.connect();
    }

    async connect() {
        this.db = await connect();
    }

    /**
     * Get shipping fee by province only (community-independent)
     */
    async getShippingFee(provinceName) {
        if (!this.db) {
            await this.connect();
        }

        // Try to find any matching zone for the province and return its fee
        const [rows] = await this.db.execute(
            `SELECT sz.shipping_fee
             FROM zone_locations zl
             INNER JOIN shipping_zones sz ON zl.zone_id = sz.id
             WHERE zl.province_name = ?
             LIMIT 1`,
            [provinceName]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0].shipping_fee;
    }
}

export default ShippingRatesModel;
