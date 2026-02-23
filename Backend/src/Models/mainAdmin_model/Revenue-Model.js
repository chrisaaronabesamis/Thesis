


import { connect } from '../../core/database.js';
import { getDBNamesByCommunityType } from './site-model.js';


class RevenueModel {
    async getRevenueForCommunity(communityType) {
        try {
            const dbNames = await getDBNamesByCommunityType(communityType);

            if (dbNames.length === 0) return [];

            const result = [];

            for (const dbName of dbNames) {
                let siteDB;
                try {
                    siteDB = await connect(dbName);

                    const [dailyRevenue] = await siteDB.query(`
                        SELECT date, total_amount
                        FROM daily_revenue
                        ORDER BY date DESC
                        LIMIT 30
                    `);

                    result.push({
                        db_name: dbName,
                        daily_revenue: dailyRevenue
                    });
                } catch (dbError) {
                    console.error(`Error fetching daily_revenue for site DB "${dbName}":`, dbError);
                } finally {
                    if (siteDB && siteDB.end) await siteDB.end();
                }
            }

            return result;

        } catch (error) {
            console.error('Error fetching revenue for community:', error);
            throw error;
        }
    }
}

export default RevenueModel;
