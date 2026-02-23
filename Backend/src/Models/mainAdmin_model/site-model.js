import { connectAdmin, connect } from '../../core/database.js';

function resolveDbName(site) {
    return site?.db_name || site?.database_name || site?.site_db || site?.site_name || null;
}

/**
 * Get DB names by community type
 * @param {string} communityType
 * @returns {Promise<Array>}
 */
export async function getDBNamesByCommunityType(communityType) {
    let adminDB;

    try {
        adminDB = await connectAdmin();

        const params = [];
        const whereClause = (communityType && communityType !== 'all')
            ? ' WHERE community_type = ?'
            : '';

        if (whereClause) params.push(communityType);

        let sites;

        try {
            [sites] = await adminDB.query(
                `SELECT * FROM websites${whereClause}`,
                params
            );
        } catch {
            [sites] = await adminDB.query(
                `SELECT * FROM sites${whereClause}`,
                params
            );
        }

        return (sites || []).map(resolveDbName).filter(Boolean);

    } catch (error) {
        console.error(`Error fetching db_names for "${communityType}":`, error);
        throw error;

    } finally {
        if (adminDB) await adminDB.end();
    }
}


/**
 * 🔥 Get All Community Data
 * Loop per site → store per site → compute totals
 */
export async function getCommunityAll(communityType = 'all') {
    let adminDB;

    try {
        adminDB = await connectAdmin();

        // Get sites (optionally filter by community)
        const params = [];
        const whereClause = (communityType !== 'all')
            ? ' WHERE community_type = ?'
            : '';

        if (whereClause) params.push(communityType);

        let sites;

        try {
            [sites] = await adminDB.query(
                `SELECT * FROM websites${whereClause}`,
                params
            );
        } catch {
            [sites] = await adminDB.query(
                `SELECT * FROM sites${whereClause}`,
                params
            );
        }

        if (!sites || sites.length === 0) return [];

        let results = [];
        let totals = {
            totalRevenue: 0,
            totalOrders: 0
        };

        // 🔁 LOOP PER SITE
        for (const site of sites) {

            const dbName = resolveDbName(site);
            if (!dbName) continue;

            const siteDB = await connect(dbName);

            // Example queries
            const [[{ revenue = 0 }]] = await siteDB.query(
                `SELECT IFNULL(SUM(total_amount),0) AS revenue FROM daily_revenue`
            );

            const [[{ orders = 0 }]] = await siteDB.query(
                `SELECT COUNT(*) AS orders FROM orders`
            );

            // Store per site data
            results.push({
                site_name: site.name || site.site_name,
                db_name: dbName,
                revenue,
                orders
            });

            // Compute totals
            totals.totalRevenue += revenue;
            totals.totalOrders += orders;

            await siteDB.end();
        }
 
        return {
            sites: results,
            totals
        };

    } catch (error) {
        console.error('Error fetching community data:', error);
        throw error;

    } finally {
        if (adminDB) await adminDB.end();
    }
}
