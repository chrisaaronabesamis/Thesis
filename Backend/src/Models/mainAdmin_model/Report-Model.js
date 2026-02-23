import { connect } from '../../core/database.js';

class ReportModel {
  constructor() {
    this.connect();
  }

  async connect() {
    this.db = await connect();
  }

  /**
   * Get available report types
   * @returns {Promise<Array>} List of report types
   */
  async getReportTypes() {
    try {
      const query = `
        SELECT id, name, description, 
               parameters, created_at, updated_at
        FROM report_types
        WHERE is_active = 1
        ORDER BY name
      `;
      
      const [reportTypes] = await this.db.query(query);
      return reportTypes || [];
      
    } catch (error) {
      console.error('Error in getReportTypes:', error);
      throw new Error(`Failed to fetch report types: ${error.message}`);
    }
  }

  /**
   * Generate a new report
   * @param {Object} reportData - Report generation parameters
   * @param {number} userId - ID of the user generating the report
   * @returns {Promise<Object>} Generated report details
   */
  async generateReport(reportData, userId) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      const { 
        report_type_id, 
        parameters = {},
        report_name,
        format = 'json'
      } = reportData;

      // Validate required fields
      if (!report_type_id) {
        throw new Error('Report type ID is required');
      }

      // Get report type details
      const [reportType] = await connection.query(
        'SELECT id, name, query_template FROM report_types WHERE id = ? AND is_active = 1',
        [report_type_id]
      );

      if (!reportType || reportType.length === 0) {
        throw new Error('Invalid report type or report type not found');
      }

      // In a real application, you would:
      // 1. Parse the query template with the provided parameters
      // 2. Execute the dynamic query
      // 3. Store the report results
      // 4. Generate the report in the requested format

      // For this example, we'll simulate report generation
      const reportId = Date.now();
      const reportName = report_name || `${reportType[0].name}_${new Date().toISOString().split('T')[0]}`;
      
      // Simulate report data (replace with actual query execution)
      const reportResults = await this.simulateReportGeneration(reportType[0].id, parameters);

      // Store report metadata
      const [result] = await connection.query(
        `INSERT INTO reports 
         (report_type_id, user_id, name, parameters, status, 
          format, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'completed', ?, NOW(), NOW())`,
        [
          report_type_id,
          userId,
          reportName,
          JSON.stringify(parameters),
          format
        ]
      );

      if (!result.insertId) {
        throw new Error('Failed to save report');
      }

      // Store report data (in a real app, this might be in a separate table or file storage)
      await connection.query(
        'UPDATE reports SET data = ? WHERE id = ?',
        [JSON.stringify(reportResults), result.insertId]
      );

      const [report] = await connection.query(
        'SELECT * FROM reports WHERE id = ?',
        [result.insertId]
      );

      await connection.commit();
      return report[0];
      
    } catch (error) {
      await connection.rollback();
      console.error('Error in generateReport:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  /**
   * Get report by ID
   * @param {number} reportId - ID of the report
   * @param {number} userId - ID of the user requesting the report
   * @returns {Promise<Object>} Report details
   */
  async getReportById(reportId, userId) {
    try {
      if (!reportId) {
        throw new Error('Report ID is required');
      }

      const [report] = await this.db.query(
        `SELECT r.*, rt.name as report_type_name, 
                u.email as requested_by_email
         FROM reports r
         LEFT JOIN report_types rt ON r.report_type_id = rt.id
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.id = ? AND (r.user_id = ? OR ? IN (SELECT id FROM users WHERE role = 'admin'))`,
        [reportId, userId, userId]
      );

      if (!report || report.length === 0) {
        throw new Error('Report not found or access denied');
      }

      return report[0];
      
    } catch (error) {
      console.error(`Error in getReportById for report ${reportId}:`, error);
      throw new Error(`Failed to get report: ${error.message}`);
    }
  }

  /**
   * Get list of generated reports with pagination
   * @param {Object} filters - Filter criteria
   * @param {number} userId - ID of the user
   * @returns {Promise<Object>} Paginated list of reports
   */
  async getReports(filters = {}, userId) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        report_type_id, 
        status,
        date_from,
        date_to
      } = filters;

      const offset = (page - 1) * limit;
      const params = [];
      let whereClause = 'WHERE 1=1';

      // Regular users can only see their own reports
      whereClause += ' AND (r.user_id = ? OR ? IN (SELECT id FROM users WHERE role = \'admin\'))';
      params.push(userId, userId);

      if (report_type_id) {
        whereClause += ' AND r.report_type_id = ?';
        params.push(report_type_id);
      }

      if (status) {
        whereClause += ' AND r.status = ?';
        params.push(status);
      }

      if (date_from) {
        whereClause += ' AND r.created_at >= ?';
        params.push(date_from);
      }

      if (date_to) {
        whereClause += ' AND r.created_at <= ?';
        params.push(date_to);
      }

      // Get total count for pagination
      const [countResult] = await this.db.query(
        `SELECT COUNT(*) as total 
         FROM reports r
         ${whereClause}`,
        params
      );

      // Get paginated results
      const [reports] = await this.db.query(
        `SELECT r.*, rt.name as report_type_name, 
                u.email as requested_by_email
         FROM reports r
         LEFT JOIN report_types rt ON r.report_type_id = rt.id
         LEFT JOIN users u ON r.user_id = u.id
         ${whereClause}
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(offset)]
      );

      return {
        data: reports || [],
        pagination: {
          total: countResult[0]?.total || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil((countResult[0]?.total || 0) / limit)
        }
      };
      
    } catch (error) {
      console.error('Error in getReports:', error);
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }
  }

  /**
   * Simulate report generation (for demonstration)
   * In a real application, this would execute actual SQL queries
   */
  async simulateReportGeneration(reportTypeId, parameters) {
    // This is a simulation - in a real app, you would execute actual SQL queries
    // based on the report type and parameters
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return sample data based on report type
    const sampleData = {
      1: [
        { month: 'Jan', revenue: 1000, users: 50 },
        { month: 'Feb', revenue: 1500, users: 75 },
        // ... more sample data
      ],
      2: [
        { product: 'Product A', sales: 500, revenue: 2500 },
        { product: 'Product B', sales: 300, revenue: 1500 },
        // ... more sample data
      ]
    };
    
    return sampleData[reportTypeId] || [];
  }
}

export default ReportModel;
