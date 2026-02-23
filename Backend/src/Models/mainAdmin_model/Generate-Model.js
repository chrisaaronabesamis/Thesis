import { connectAdmin } from '../../core/database.js';

class GenerateModel {
  constructor() {
    this.db = null;
  }

  // Connect to DB
  async connectAdmin() {
    if (this.db) return;
    try {
      this.db = await connectAdmin();
    } catch (err) {
      console.error('DB connection failed:', err);
      throw new Error('Database connection failed');
    }
  }

  // Generate Website
  async generateWebsite({ siteName, domain, primaryColor, secondaryColor, accentColor, buttonStyle, fontStyle, navPosition, logo, banner, members }) {
    console.log('domain' , domain);
    try {
      if (!this.db) await this.connectAdmin();

      const siteQuery = `
        INSERT INTO sites (site_name, domain, status, created_at)
        VALUES (?, ?, 'active', NOW())
      `;
      try {
        const [siteResult] = await this.db.query(siteQuery, [siteName, domain]);
        const siteId = siteResult.insertId;

        const settingQuery = `
          INSERT INTO sites_setting (site_id, primary_color, secondary_color, accent_color, button_style, font_style, nav_position, logo, banner, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        await this.db.query(settingQuery, [siteId, primaryColor, secondaryColor, accentColor, buttonStyle, fontStyle, navPosition, logo, banner]);

        if (members && members.length > 0) {
          const memberQuery = `
            INSERT INTO site_members (site_id, name, role, description, image_profile, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
          `;
          for (const member of members) {
            await this.db.query(memberQuery, [
              siteId,
              member.name,
              member.role,
              member.description,
              member.image || null
            ]);
          }
        }

        return siteId;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          throw new Error('Duplicate site or domain detected');
        }
        throw err;
      }
    } catch (err) {
      console.error('Generate website error:', err);
      throw new Error('Failed to generate website');
    }
  }

  // Get all generated websites
  async getGeneratedWebsites() {
    try {
      if (!this.db) await this.connectAdmin();
      const sitesQuery = `
        SELECT 
          s.id,
          s.site_name,
          s.subdomain,
          s.status,
          s.created_at,
          ss.primary_color,
          ss.secondary_color,
          ss.accent_color,
          ss.button_style,
          ss.font_style,
          ss.nav_position,
          ss.logo,
          ss.banner
        FROM sites s
        LEFT JOIN sites_setting ss ON s.id = ss.site_id
        ORDER BY s.created_at DESC
      `;
      const [sites] = await this.db.query(sitesQuery);

      const sitesWithMembers = await Promise.all(
        sites.map(async (site) => {
          const membersQuery = `
            SELECT id, name, role, description, image_path
            FROM site_members
            WHERE site_id = ?
            ORDER BY created_at ASC
          `;
          const [members] = await this.db.query(membersQuery, [site.id]);
          return { ...site, members: members || [] };
        })
      );

      return sitesWithMembers;
    } catch (err) {
      console.error('Get generated websites error:', err);
      throw new Error('Failed to fetch websites');
    }
  }

  // Get single website by ID
  async getWebsiteById(siteId) {
    try {
      if (!this.db) await this.connectAdmin();
      const siteQuery = `
        SELECT 
          s.id,
          s.site_name,
          s.subdomain,
          s.status,
          s.created_at,
          ss.primary_color,
          ss.secondary_color,
          ss.accent_color,
          ss.button_style,
          ss.font_style,
          ss.nav_position,
          ss.logo,
          ss.banner
        FROM sites s
        LEFT JOIN sites_setting ss ON s.id = ss.site_id
        WHERE s.id = ?
      `;
      const [sites] = await this.db.query(siteQuery, [siteId]);
      if (!sites || sites.length === 0) return null;
      const site = sites[0];

      const membersQuery = `
        SELECT id, name, role, description, image_path
        FROM site_members
        WHERE site_id = ?
        ORDER BY created_at ASC
      `;
      const [members] = await this.db.query(membersQuery, [siteId]);

      return { ...site, members: members || [] };
    } catch (err) {
      console.error('Get website by ID error:', err);
      throw new Error('Failed to fetch website');
    }
  }

  // 🔹 Get all site names and subdomains
  async getTemplateModel() {
    try {
      if (!this.db) await this.connectAdmin();
      const query = `
        SELECT 
          t.template_id,
          t.template_name,
          s.site_id,
          s.site_name,
          ss.subdomain
      FROM 
          templates t
      JOIN 
          sites_setting ss ON t.site_setting_id = ss.site_setting_id
      JOIN 
          sites s ON ss.site_id = s.site_id
      ORDER BY 
          s.site_name ASC;
      `;
      const [sites] = await this.db.query(query);
      return sites;
    } catch (err) {
      console.error('Get site names error:', err);
      throw new Error('Failed to fetch site names');
    }
  }
}

export default GenerateModel;