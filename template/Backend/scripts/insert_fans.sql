-- Add a lightweight 'fans' site if it doesn't already exist
-- This is idempotent: it will not duplicate rows if run multiple times

INSERT INTO sites (site_id, site_name, domain, short_bio, description, status, created_at)
SELECT 20, 'fans', 'fans-website', 'Fans community (auto-created)', 'Auto-created fans site for local dev', 'active', NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM sites WHERE LOWER(TRIM(site_name)) = 'fans' OR LOWER(TRIM(domain)) = 'fans-website'
);

-- Ensure there is a sites_setting entry for the new site
INSERT INTO sites_setting (site_id, primary_color, secondary_color, accent_color, button_style, font_style, nav_position, logo, banner)
SELECT 20, '#ffffff', '#f6f6f6', '#000000', '', 'Inter', 'top', NULL, NULL
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM sites_setting WHERE site_id = 20
);

-- Optionally ensure a site_databases row exists (not strictly required in single-db mode)
INSERT INTO site_databases (site_id, db_host, db_name, db_user, db_password, created_at)
SELECT 20, 'localhost', 'bini', 'root', '', NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM site_databases WHERE site_id = 20
);
