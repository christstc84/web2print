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
    uploaded_by?: number | null;
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

  // Color management methods
  static async getAllColors(): Promise<any[]> {
    return await this.query(`
      SELECT id, name, display_name, rgb_r, rgb_g, rgb_b, 
             cmyk_c, cmyk_m, cmyk_y, cmyk_k, spot_color, 
             is_active, created_at 
      FROM colors 
      WHERE is_active = TRUE
      ORDER BY display_name ASC
    `);
  }

  static async getColorById(id: number): Promise<any | null> {
    return await this.findOne(`
      SELECT id, name, display_name, rgb_r, rgb_g, rgb_b, 
             cmyk_c, cmyk_m, cmyk_y, cmyk_k, spot_color, 
             is_active, created_at 
      FROM colors 
      WHERE id = ?
    `, [id]);
  }

  static async createColor(colorData: {
    name: string;
    display_name: string;
    rgb_r: number;
    rgb_g: number;
    rgb_b: number;
    cmyk_c: number;
    cmyk_m: number;
    cmyk_y: number;
    cmyk_k: number;
    spot_color?: string | null;
  }): Promise<number> {
    return await this.insert('colors', {
      ...colorData,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  static async updateColor(id: number, colorData: {
    name: string;
    display_name: string;
    rgb_r: number;
    rgb_g: number;
    rgb_b: number;
    cmyk_c: number;
    cmyk_m: number;
    cmyk_y: number;
    cmyk_k: number;
    spot_color?: string | null;
  }): Promise<number> {
    return await this.update('colors', {
      ...colorData,
      updated_at: new Date()
    }, 'id = ?', [id]);
  }

  static async deleteColor(id: number): Promise<number> {
    return await this.update('colors', { is_active: false, updated_at: new Date() }, 'id = ?', [id]);
  }

  // Print Options management methods
  static async getAllPrintOptionCategories(): Promise<any[]> {
    return await this.query(`
      SELECT id, name, type, description, icon, is_active, sort_order, created_at 
      FROM print_option_categories 
      WHERE is_active = TRUE
      ORDER BY sort_order ASC
    `);
  }

  static async getPrintOptionCategoryById(id: string): Promise<any | null> {
    return await this.findOne(`
      SELECT id, name, type, description, icon, is_active, sort_order, created_at 
      FROM print_option_categories 
      WHERE id = ? AND is_active = TRUE
    `, [id]);
  }

  static async getPrintOptionsByCategory(categoryId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<any[]> {
    const { page = 1, limit = 12, search = '' } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE category_id = ? AND is_active = TRUE';
    const params: any[] = [categoryId];
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR display_name LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    const sql = `
      SELECT id, category_id, name, display_name, description, 
             specifications, pricing, is_active, sort_order, created_at 
      FROM print_options 
      ${whereClause}
      ORDER BY sort_order ASC, display_name ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    console.log('SQL Query:', sql);
    console.log('Parameters:', params);
    
    return await this.query(sql, params);
  }

  static async getPrintOptionCountByCategory(categoryId: string, search?: string): Promise<number> {
    let whereClause = 'WHERE category_id = ? AND is_active = TRUE';
    const params: any[] = [categoryId];
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR display_name LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    const result = await this.query(`
      SELECT COUNT(*) as count 
      FROM print_options 
      ${whereClause}
    `, params);
    
    return result[0]?.count || 0;
  }

  static async createPrintOption(optionData: {
    categoryId: string;
    name: string;
    displayName: string;
    description?: string;
    specifications: any;
    pricing: any;
    sortOrder?: number;
  }): Promise<string> {
    const id = `${optionData.categoryId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.query(`
      INSERT INTO print_options (id, category_id, name, display_name, description, specifications, pricing, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      id,
      optionData.categoryId,
      optionData.name,
      optionData.displayName,
      optionData.description || null,
      JSON.stringify(optionData.specifications),
      JSON.stringify(optionData.pricing),
      optionData.sortOrder || 0
    ]);
    
    return id;
  }

  static async updatePrintOption(id: string, updateData: any): Promise<boolean> {
    const fields = [];
    const params = [];
    
    if (updateData.name) {
      fields.push('name = ?');
      params.push(updateData.name);
    }
    if (updateData.displayName) {
      fields.push('display_name = ?');
      params.push(updateData.displayName);
    }
    if (updateData.description !== undefined) {
      fields.push('description = ?');
      params.push(updateData.description);
    }
    if (updateData.specifications) {
      fields.push('specifications = ?');
      params.push(JSON.stringify(updateData.specifications));
    }
    if (updateData.pricing) {
      fields.push('pricing = ?');
      params.push(JSON.stringify(updateData.pricing));
    }
    if (updateData.isActive !== undefined) {
      fields.push('is_active = ?');
      params.push(updateData.isActive);
    }
    if (updateData.sortOrder !== undefined) {
      fields.push('sort_order = ?');
      params.push(updateData.sortOrder);
    }
    
    if (fields.length === 0) return false;
    
    fields.push('updated_at = NOW()');
    params.push(id);
    
    const result = await this.query(`
      UPDATE print_options 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `, params);
    
    return result.affectedRows > 0;
  }

  static async deletePrintOption(id: string): Promise<boolean> {
    const result = await this.query('DELETE FROM print_options WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async bulkDeletePrintOptions(optionIds: string[]): Promise<number> {
    if (optionIds.length === 0) return 0;
    
    const placeholders = optionIds.map(() => '?').join(',');
    const result = await this.query(`
      DELETE FROM print_options 
      WHERE id IN (${placeholders})
    `, optionIds);
    
    return result.affectedRows || 0;
  }
}
