import api from './api';

const BASE_URL = '/forms';

export const formBuilderAPI = {
  /**
   * Create a new form template
   */
  createForm: async (formData: {
    name: string;
    description?: string;
    tenantId?: string;
  }) => {
    try {
      const response = await api.post(`${BASE_URL}`, formData);
      return response.data;
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  },

  /**
   * Get all form templates
   */
  getAllForms: async (page = 1, limit = 10, status?: string) => {
    try {
      const response = await api.get(`${BASE_URL}`, {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  },

  /**
   * Get a specific form with all fields
   */
  getFormById: async (formId: string) => {
    try {
      const response = await api.get(`${BASE_URL}/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw error;
    }
  },

  /**
   * Update form template
   */
  updateForm: async (
    formId: string,
    formData: {
      name?: string;
      description?: string;
      status?: string;
    }
  ) => {
    try {
      const response = await api.put(`${BASE_URL}/${formId}`, formData);
      return response.data;
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  },

  /**
   * Delete (archive) form template
   */
  deleteForm: async (formId: string) => {
    try {
      const response = await api.delete(`${BASE_URL}/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  },

  /**
   * Add field to form
   */
  addField: async (formId: string, fieldData: any) => {
    try {
      const response = await api.post(`${BASE_URL}/${formId}/fields`, fieldData);
      return response.data;
    } catch (error) {
      console.error('Error adding field:', error);
      throw error;
    }
  },

  /**
   * Update field definition
   */
  updateField: async (formId: string, fieldId: string, fieldData: any) => {
    try {
      const response = await api.put(
        `${BASE_URL}/${formId}/fields/${fieldId}`,
        fieldData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating field:', error);
      throw error;
    }
  },

  /**
   * Delete field from form
   */
  deleteField: async (formId: string, fieldId: string) => {
    try {
      const response = await api.delete(`${BASE_URL}/${formId}/fields/${fieldId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting field:', error);
      throw error;
    }
  }
};
