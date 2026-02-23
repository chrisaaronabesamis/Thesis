class ReportController {
  constructor() {
    this.reportModel = new (require('../Models/Report-Model.js'))();
  }

  /**
   * Get available report types
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReportTypes(req, res) {
    try {
      const reportTypes = await this.reportModel.getReportTypes();
      
      return res.status(200).json({
        success: true,
        data: reportTypes,
        count: reportTypes.length
      });
      
    } catch (error) {
      console.error('Error in getReportTypes:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch report types',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get list of generated reports
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReports(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { 
        page = 1, 
        limit = 10, 
        report_type_id, 
        status,
        date_from,
        date_to
      } = req.query;

      const reports = await this.reportModel.getReports({
        page: parseInt(page),
        limit: parseInt(limit),
        report_type_id,
        status,
        date_from,
        date_to
      }, userId);

      return res.status(200).json({
        success: true,
        data: reports.data,
        pagination: reports.pagination
      });
      
    } catch (error) {
      console.error('Error in getReports:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch reports',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Generate a new report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateReport(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const reportData = req.body;

      // Basic validation
      if (!reportData.report_type_id) {
        return res.status(400).json({
          success: false,
          error: 'Report type ID is required'
        });
      }

      // Generate report (this would be an async process in production)
      const report = await this.reportModel.generateReport(reportData, userId);

      // In a real app, you might want to trigger an async report generation process
      // and return a status URL for checking progress
      
      return res.status(202).json({
        success: true,
        message: 'Report generation started',
        data: {
          report_id: report.id,
          status_url: `/api/reports/${report.id}`
        }
      });
      
    } catch (error) {
      console.error('Error in generateReport:', error);
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to generate report',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get report by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReportById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const report = await this.reportModel.getReportById(id, userId);
      
      return res.status(200).json({
        success: true,
        data: report
      });
      
    } catch (error) {
      console.error('Error in getReportById:', error);
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to fetch report',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Export report in different formats
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async exportReport(req, res) {
    try {
      const { id } = req.params;
      const { format = 'csv' } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Get the report
      const report = await this.reportModel.getReportById(id, userId);
      
      // In a real app, you would format the report data based on the requested format
      // This is a simplified example that just returns JSON
      // For CSV, Excel, PDF, etc., you would use appropriate libraries
      
      let exportData;
      const contentType = this.getContentType(format);
      
      switch (format.toLowerCase()) {
        case 'csv':
          // Convert JSON to CSV (simplified)
          exportData = this.convertToCSV(JSON.parse(report.data || '[]'));
          break;
          
        case 'xlsx':
        case 'excel':
          // In a real app, use a library like exceljs
          exportData = JSON.stringify(report.data, null, 2);
          break;
          
        case 'pdf':
          // In a real app, use a library like pdfkit or puppeteer
          exportData = JSON.stringify(report.data, null, 2);
          break;
          
        case 'json':
        default:
          exportData = JSON.stringify(report.data, null, 2);
          break;
      }
      
      // Set appropriate headers for download
      const filename = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}`;
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      return res.send(exportData);
      
    } catch (error) {
      console.error('Error in exportReport:', error);
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to export report',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  
  /**
   * Get content type based on file format
   * @private
   */
  getContentType(format) {
    const types = {
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'excel': 'application/vnd.ms-excel',
      'pdf': 'application/pdf',
      'json': 'application/json',
      'default': 'application/octet-stream'
    };
    
    return types[format.toLowerCase()] || types['default'];
  }
  
  /**
   * Convert JSON to CSV (simplified)
   * @private
   */
  convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Create CSV rows
    const rows = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => 
          `"${String(row[header] || '').replace(/"/g, '""')}"`
        ).join(',')
      )
    ];
    
    return rows.join('\n');
  }
}

export default ReportController;
