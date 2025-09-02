import { apiRequest } from './api';
import { 
  PrintOptionCategoryData, 
  PrintOptionData, 
  PrintOptionCategoriesResponse,
  PrintOptionsResponse,
  CreatePrintOptionRequest,
  UpdatePrintOptionRequest
} from '../types/printOptions';

export const PrintOptionsAPI = {
  // Category management
  async getAllCategories(): Promise<PrintOptionCategoriesResponse> {
    return await apiRequest('/print-options/categories');
  },

  async getCategoryById(categoryId: string): Promise<PrintOptionCategoryData> {
    return await apiRequest(`/print-options/categories/${categoryId}`);
  },

  // Option management
  async getOptionsByCategory(
    categoryId: string, 
    params: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<PrintOptionsResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/print-options/categories/${categoryId}/options${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(url);
  },

  async createOption(categoryId: string, optionData: CreatePrintOptionRequest): Promise<PrintOptionData> {
    return await apiRequest(`/print-options/categories/${categoryId}/options`, {
      method: 'POST',
      body: JSON.stringify(optionData)
    });
  },

  async updateOption(optionId: string, updateData: UpdatePrintOptionRequest): Promise<PrintOptionData> {
    return await apiRequest(`/print-options/options/${optionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },

  async deleteOption(optionId: string): Promise<void> {
    return await apiRequest(`/print-options/options/${optionId}`, {
      method: 'DELETE'
    });
  },

  async bulkDeleteOptions(optionIds: string[]): Promise<{ message: string; deletedCount: number }> {
    return await apiRequest('/print-options/options', {
      method: 'DELETE',
      body: JSON.stringify({ optionIds })
    });
  }
};
