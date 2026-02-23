import RevenueModel from '../../../Models/mainAdmin_model/Revenue-Model.js';
import { getDBNamesByCommunityType, getCommunityAll } from '../../../Models/mainAdmin_model/site-model.js';
import { connect } from '../../../core/database.js';

class DashboardController {
    constructor() {
        this.revenueModel = new RevenueModel();
    }

    // GET /api/dashboard/stats
    async getCommunityStats(req, res) {
        try {
            const communityType = String(req.query.community || 'all').toLowerCase();

            let dbNames = [];
            const precomputedMap = new Map();
            let precomputedTotals = null;

            if (communityType == 'all') {
                const db = await getCommunityAll();

                // Debug: show full getCommunityAll response to inspect why counts differ
                console.log('getCommunityStats: getCommunityAll result', { communityType, db });

                if (Array.isArray(db) && db.length === 0) {
                    dbNames = [];
                } else if (db && db.sites) {
                    dbNames = db.sites.map(s => s.db_name).filter(Boolean);
                    precomputedTotals = db.totals || null;
                    for (const s of db.sites) {
                        if (s.db_name) precomputedMap.set(s.db_name, { revenue: s.revenue || 0, orders: s.orders || 0 });
                    }
                }
            } else {
                dbNames = await getDBNamesByCommunityType(communityType);
                // Debug: show dbNames returned for specific community
                console.log('getCommunityStats: getDBNamesByCommunityType', { communityType, dbNames });
            }

            // Debug: raw dbNames before dedupe
            console.log('getCommunityStats: raw dbNames', { communityType, count: dbNames.length, dbNames });

            // Show duplicates if any
            const duplicates = dbNames.filter((v, i, a) => a.indexOf(v) !== i);
            if (duplicates.length) console.log('getCommunityStats: duplicate db names found', { duplicates });

            const stats = {
                all: { revenue: 0, orders: 0, posts: 0, pendingModeration: 0, lowStock: 0, newOrdersToday: 0 },
            };

            if (communityType !== 'all') {
                stats[communityType] = { revenue: 0, orders: 0, posts: 0, pendingModeration: 0, lowStock: 0, newOrdersToday: 0 };
            }

            // If we have precomputed totals (from getCommunityAll), use them
            if (precomputedTotals) {
                stats.all.revenue = precomputedTotals.totalRevenue || 0;
                stats.all.orders = precomputedTotals.totalOrders || 0;
            }

            for (const dbName of dbNames) {
                let siteDB;
                try {
                    siteDB = await connect(dbName);
                    console.log(`Connected to site DB: ${dbName} for community: ${communityType}`);

                    let total_revenue = 0;
                    let total_orders = 0;

                    if (precomputedMap.has(dbName)) {
                        const vals = precomputedMap.get(dbName);
                        total_revenue = vals.revenue || 0;
                        total_orders = vals.orders || 0;
                    } else {
                        const [[{ total_revenue: tr = 0 }]] = await siteDB.query('SELECT SUM(total_amount) AS total_revenue FROM daily_revenue');
                        const [[{ total_orders: to = 0 }]] = await siteDB.query('SELECT COUNT(*) AS total_orders FROM orders');
                        total_revenue = tr || 0;
                        total_orders = to || 0;
                    }

                    const [[{ total_posts = 0 }]] = await siteDB.query('SELECT COUNT(*) AS total_posts FROM posts');
                    const pending_moderation = 0;
                    const low_stock = 0;
                    const [[{ new_orders_today = 0 }]] = await siteDB.query(`
                        SELECT COUNT(*) AS new_orders_today
                        FROM orders
                        WHERE DATE(created_at) = CURDATE()
                    `);

                    if (stats[communityType]) {
                        if (!precomputedMap.has(dbName)) {
                            stats[communityType].revenue += total_revenue;
                            stats[communityType].orders += total_orders;
                        }
                        stats[communityType].posts += total_posts;
                        stats[communityType].pendingModeration += pending_moderation;
                        stats[communityType].lowStock += low_stock;
                        stats[communityType].newOrdersToday += new_orders_today;
                    }

                    if (precomputedTotals) {
                        stats.all.revenue = precomputedTotals.totalRevenue || stats.all.revenue;
                        stats.all.orders = precomputedTotals.totalOrders || stats.all.orders;
                    } else {
                        stats.all.revenue += total_revenue;
                        stats.all.orders += total_orders;
                    }

                    stats.all.posts += total_posts;
                    stats.all.pendingModeration += pending_moderation;
                    stats.all.lowStock += low_stock;
                    stats.all.newOrdersToday += new_orders_today;

                } catch (err) {
                    console.error(`Error fetching stats for site ${dbName}:`, err);
                } finally {
                    if (siteDB && siteDB.end) await siteDB.end();
                }
            }

            res.json(stats);
        } catch (error) {
            console.error('Error fetching community stats:', error);
            res.status(500).json({ error: 'Failed to fetch community stats' });
        }
    }

    // GET /api/revenue?community=bini
    async getRevenueByCommunity(req, res) {
        try {
            const communityType = req.query.community || 'all';
            console.log(`Fetching revenue data for community: ${communityType}`);

            const revenueData = await this.revenueModel.getRevenueForCommunity(communityType);
            const mergedRevenue = [];

            revenueData.forEach(site => {
                mergedRevenue.push(...site.daily_revenue);
            });

            mergedRevenue.sort((a, b) => new Date(b.date) - new Date(a.date));
            res.json(mergedRevenue);
        } catch (err) {
            console.error('Error fetching revenue data:', err);
            res.status(500).json({ error: 'Failed to fetch revenue data' });
        }
    }
}

export default new DashboardController();
