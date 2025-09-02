import { executeQuery, testConnection } from '../config/database';

// Generic database service class
export class DatabaseService {
  // Test connection
  static async testConnection(): Promise<boolean> {
    return await testConnection();
  }

  // Generic query execution
  static async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    return await executeQuery<T>(sql, params);
  }

  // Get single record
  static async findOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const results = await executeQuery<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  // Insert record
  static async insert(table: string, data: Record<string, any>): Promise<number> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result = await executeQuery(sql, values);
    return (result as any).insertId;
  }

  // Update record
  static async update(
    table: string, 
    data: Record<string, any>, 
    where: string, 
    whereParams?: any[]
  ): Promise<number> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), ...(whereParams || [])];
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
    const result = await executeQuery(sql, values);
    return (result as any).affectedRows;
  }

  // Delete record
  static async delete(table: string, where: string, whereParams?: any[]): Promise<number> {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const result = await executeQuery(sql, whereParams);
    return (result as any).affectedRows;
  }
}

// Print-specific database services
export class PrintService extends DatabaseService {
  // Get all items
  static async getAllItems(): Promise<any[]> {
    return await this.query(`
      SELECT id, name, category, price, stock, created_at, updated_at 
      FROM items 
      ORDER BY name ASC
    `);
  }

  // Get item by ID
  static async getItemById(id: number): Promise<any | null> {
    return await this.findOne(`
      SELECT id, name, category, price, stock, description, created_at, updated_at 
      FROM items 
      WHERE id = ?
    `, [id]);
  }

  // Create new item
  static async createItem(itemData: {
    name: string;
    category: string;
    price: number;
    stock: number;
    description?: string;
  }): Promise<number> {
    return await this.insert('items', {
      ...itemData,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Update item
  static async updateItem(id: number, itemData: Partial<{
    name: string;
    category: string;
    price: number;
    stock: number;
    description: string;
  }>): Promise<number> {
    return await this.update('items', {
      ...itemData,
      updated_at: new Date()
    }, 'id = ?', [id]);
  }

  // Delete item
  static async deleteItem(id: number): Promise<number> {
    return await this.delete('items', 'id = ?', [id]);
  }

  // Get all orders
  static async getAllOrders(): Promise<any[]> {
    return await this.query(`
      SELECT o.id, o.customer_name, o.status, o.total_amount, o.created_at,
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
  }

  // Get dashboard stats
  static async getDashboardStats(): Promise<{
    totalRevenue: number;
    totalUsers: number;
    totalOrders: number;
    totalItems: number;
  }> {
    const [revenueResult] = await this.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue 
      FROM orders 
      WHERE status = 'completed'
    `);

    const [usersResult] = await this.query(`
      SELECT COUNT(*) as total_users FROM users
    `);

    const [ordersResult] = await this.query(`
      SELECT COUNT(*) as total_orders FROM orders
    `);

    const [itemsResult] = await this.query(`
      SELECT COUNT(*) as total_items FROM items
    `);

    return {
      totalRevenue: revenueResult?.total_revenue || 0,
      totalUsers: usersResult?.total_users || 0,
      totalOrders: ordersResult?.total_orders || 0,
      totalItems: itemsResult?.total_items || 0,
    };
  }

  // Font management methods
  static async getAllFonts(): Promise<any[]> {
    return await this.query(`
      SELECT id, name, display_name, file_name, file_path, file_size, 
             font_format, font_family, is_active, created_at 
      FROM fonts 
      WHERE is_active = TRUE
      ORDER BY display_name ASC
    `);
  }

  static async getFontById(id: number): Promise<any | null> {
    return await this.findOne(`
      SELECT id, name, display_name, file_name, file_path, file_size, 
             font_format, font_family, is_active, uploaded_by, created_at 
      FROM fonts 
      WHERE id = ?
    `, [id]);
  }

  static async createFont(fontData: {
    name: string;
    display_name: string;
    file_name: string;
    file_path: string;
    file_size: number;
    font_format: string;
    font_family: string;
    uploaded_by?: number;
  }): Promise<number> {
    return await this.insert('fonts', {
      ...fontData,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  static async deleteFont(id: number): Promise<number> {
    return await this.update('fonts', { is_active: false, updated_at: new Date() }, 'id = ?', [id]);
  }
}
