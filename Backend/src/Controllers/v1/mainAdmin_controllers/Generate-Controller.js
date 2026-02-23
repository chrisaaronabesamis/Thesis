import GenerateModel from '../../../Models/mainAdmin_model/Generate-Model.js'; // fixed path to model
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cloudinary from '../../../core/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GenerateController {
  constructor() {
    this.model = new GenerateModel();
  }

  // POST /generate-website
  async generateWebsite(req, res) {
    try {
      const {
        siteName,
        subdomain,
        primaryColor,
        secondaryColor,
        accentColor,
        buttonStyle,
        fontStyle,
        navPosition,
        members // array of objects {name, role, description, image}
      } = req.body;

      // Map subdomain to domain for DB
      const domain = subdomain;

      // Handle file uploads
      let logoUrl = null;
      let bannerUrl = null;

      if (req.files) {
        if (req.files.logo) {
          const logoFile = req.files.logo;
          // Upload to Cloudinary
          const logoUpload = await cloudinary.uploader.upload(logoFile.tempFilePath || logoFile.path, { folder: 'websites' });
          logoUrl = logoUpload.secure_url;
        }
        if (req.files.banner) {
          const bannerFile = req.files.banner;
          // Upload to Cloudinary
          const bannerUpload = await cloudinary.uploader.upload(bannerFile.tempFilePath || bannerFile.path, { folder: 'websites' });
          bannerUrl = bannerUpload.secure_url;
        }
      }

      // Save to DB via model
      const siteId = await this.model.generateWebsite({
        siteName,
        domain,
        primaryColor,
        secondaryColor,
        accentColor,
        buttonStyle,
        fontStyle,
        navPosition,
        logo: logoUrl,
        banner: bannerUrl,
        members: members ? JSON.parse(members) : []
      });

      res.status(200).json({
        success: true,
        message: 'Website generated successfully',
        siteId,
        subdomain
      });

    } catch (err) {
      console.error('GenerateController error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to generate website',
        error: err.message
      });
    }
  }

  // GET /generated-websites
  async getGeneratedWebsites(req, res) {
    try {
      const websites = await this.model.getGeneratedWebsites();

      res.status(200).json({
        success: true,
        message: 'Websites fetched successfully',
        data: websites,
        total: websites.length
      });

    } catch (err) {
      console.error('GetGeneratedWebsites error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch websites',
        error: err.message
      });
    }
  }

  // GET /generated-websites/:id
  async getWebsiteById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid website ID'
        });
      }

      const website = await this.model.getWebsiteById(parseInt(id));

      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Website fetched successfully',
        data: website
      });

    } catch (err) {
      console.error('GetWebsiteById error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch website',
        error: err.message
      });
    }
  }

  // GET /generated-websites/names
  async getTemplate(req, res) {
    try {
      const sites = await this.model.getTemplateModel(); // dapat may function sa model
      res.status(200).json({
        success: true,
        message: 'Site templates fetched successfully',
        data: sites
      });
    } catch (err) {
      console.error('GetTemplate error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch site templates',
        error: err.message
      });
    }
  }

}

export default new GenerateController();