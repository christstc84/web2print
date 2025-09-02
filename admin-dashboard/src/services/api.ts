// Frontend API service for communicating with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic API request handler
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Font API endpoints
export const FontAPI = {
  // Get all fonts
  async getAllFonts(): Promise<any[]> {
    return apiRequest<any[]>('/fonts');
  },

  // Get font by ID
  async getFontById(id: number): Promise<any> {
    return apiRequest<any>(`/fonts/${id}`);
  },

  // Create new font
  async createFont(fontData: {
    name: string;
    display_name: string;
    file_name: string;
    file_path: string;
    file_size: number;
    font_format: string;
    font_family: string;
  }): Promise<{ id: number }> {
    return apiRequest<{ id: number }>('/fonts', {
      method: 'POST',
      body: JSON.stringify(fontData),
    });
  },

  // Delete font
  async deleteFont(id: number): Promise<void> {
    return apiRequest<void>(`/fonts/${id}`, {
      method: 'DELETE',
    });
  },

  // Upload font file
  async uploadFontFile(file: File): Promise<{ success: boolean; filePath?: string; error?: string }> {
    const formData = new FormData();
    formData.append('font', file);

    try {
      const response = await fetch(`${API_BASE_URL}/fonts/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  },
};

// Items API endpoints
export const ItemsAPI = {
  async getAllItems(): Promise<any[]> {
    return apiRequest<any[]>('/items');
  },

  async getItemById(id: number): Promise<any> {
    return apiRequest<any>(`/items/${id}`);
  },

  async createItem(itemData: any): Promise<{ id: number }> {
    return apiRequest<{ id: number }>('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  async updateItem(id: number, itemData: any): Promise<void> {
    return apiRequest<void>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  },

  async deleteItem(id: number): Promise<void> {
    return apiRequest<void>(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};

// Color API endpoints
export const ColorAPI = {
  // Get all colors
  async getAllColors(): Promise<any[]> {
    return apiRequest('/colors');
  },

  // Get color by ID
  async getColorById(id: number): Promise<any> {
    return apiRequest(`/colors/${id}`);
  },

  // Create new color
  async createColor(colorData: {
    name: string;
    display_name: string;
    rgb_r: number;
    rgb_g: number;
    rgb_b: number;
    cmyk_c: number;
    cmyk_m: number;
    cmyk_y: number;
    cmyk_k: number;
    spot_color?: string;
  }): Promise<{ id: number }> {
    return apiRequest('/colors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(colorData),
    });
  },

  // Update color
  async updateColor(id: number, colorData: {
    name: string;
    display_name: string;
    rgb_r: number;
    rgb_g: number;
    rgb_b: number;
    cmyk_c: number;
    cmyk_m: number;
    cmyk_y: number;
    cmyk_k: number;
    spot_color?: string;
  }): Promise<void> {
    await apiRequest(`/colors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(colorData),
    });
  },

  // Delete color
  async deleteColor(id: number): Promise<void> {
    await apiRequest(`/colors/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API endpoints
export const DashboardAPI = {
  async getStats(): Promise<{
    totalRevenue: number;
    totalUsers: number;
    totalOrders: number;
    totalItems: number;
  }> {
    return apiRequest<any>('/dashboard/stats');
  },
};

// Orders API endpoints
export const OrdersAPI = {
  async getAllOrders(): Promise<any[]> {
    return apiRequest<any[]>('/orders');
  },

  async getOrderById(id: number): Promise<any> {
    return apiRequest<any>(`/orders/${id}`);
  },

  async createOrder(orderData: any): Promise<{ id: number }> {
    return apiRequest<{ id: number }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async updateOrder(id: number, orderData: any): Promise<void> {
    return apiRequest<void>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  },

  async deleteOrder(id: number): Promise<void> {
    return apiRequest<void>(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    await apiRequest('/health');
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};
