/**
 * List Service - Manage ClickUp lists
 * 
 * Provides methods to interact with lists
 */

import { ClickUpMCPClient } from '../mcp-client';
import { List, CreateListParams, ServiceResponse } from '../types/clickup';
import { logger } from '../utils/logger';

export class ListService {
  constructor(private client: ClickUpMCPClient) {}

  /**
   * Get lists in a folder
   */
  async getListsInFolder(folderId: string): Promise<ServiceResponse<List[]>> {
    try {
      logger.info('Getting lists in folder', { folderId });

      const response = await this.client.get<{ lists: List[] }>(
        `/folder/${folderId}/list`,
        { archived: false }
      );

      return {
        success: true,
        data: response.lists,
      };
    } catch (error: any) {
      logger.error('Failed to get lists in folder', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get lists in a space (folderless lists)
   */
  async getListsInSpace(spaceId: string): Promise<ServiceResponse<List[]>> {
    try {
      logger.info('Getting lists in space', { spaceId });

      const response = await this.client.get<{ lists: List[] }>(
        `/space/${spaceId}/list`,
        { archived: false }
      );

      return {
        success: true,
        data: response.lists,
      };
    } catch (error: any) {
      logger.error('Failed to get lists in space', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get a specific list by ID
   */
  async getList(listId: string): Promise<ServiceResponse<List>> {
    try {
      logger.info('Getting list', { listId });

      const list = await this.client.get<List>(`/list/${listId}`);

      return {
        success: true,
        data: list,
      };
    } catch (error: any) {
      logger.error('Failed to get list', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Create a list in a folder
   */
  async createListInFolder(
    folderId: string,
    listData: CreateListParams
  ): Promise<ServiceResponse<List>> {
    try {
      logger.info('Creating list in folder', { folderId, listData });

      const list = await this.client.post<List>(
        `/folder/${folderId}/list`,
        listData
      );

      logger.info('List created successfully', { listId: list.id });

      return {
        success: true,
        data: list,
      };
    } catch (error: any) {
      logger.error('Failed to create list in folder', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Create a folderless list in a space
   */
  async createListInSpace(
    spaceId: string,
    listData: CreateListParams
  ): Promise<ServiceResponse<List>> {
    try {
      logger.info('Creating list in space', { spaceId, listData });

      const list = await this.client.post<List>(
        `/space/${spaceId}/list`,
        listData
      );

      logger.info('List created successfully', { listId: list.id });

      return {
        success: true,
        data: list,
      };
    } catch (error: any) {
      logger.error('Failed to create list in space', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Update a list
   */
  async updateList(
    listId: string,
    updates: {
      name?: string;
      content?: string;
      due_date?: number;
      priority?: number;
      assignee?: number;
    }
  ): Promise<ServiceResponse<List>> {
    try {
      logger.info('Updating list', { listId, updates });

      const list = await this.client.put<List>(`/list/${listId}`, updates);

      logger.info('List updated successfully', { listId });

      return {
        success: true,
        data: list,
      };
    } catch (error: any) {
      logger.error('Failed to update list', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Add a custom field to a list
   */
  async addCustomField(
    listId: string,
    customFieldData: {
      name: string;
      type: string;
      type_config?: any;
    }
  ): Promise<ServiceResponse<any>> {
    try {
      logger.info('Adding custom field to list', { listId, customFieldData });

      const customField = await this.client.post(
        `/list/${listId}/field`,
        customFieldData
      );

      logger.info('Custom field added successfully');

      return {
        success: true,
        data: customField,
      };
    } catch (error: any) {
      logger.error('Failed to add custom field', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get custom fields for a list
   */
  async getCustomFields(listId: string): Promise<ServiceResponse<any[]>> {
    try {
      logger.info('Getting custom fields for list', { listId });

      const response = await this.client.get<{ fields: any[] }>(
        `/list/${listId}/field`
      );

      return {
        success: true,
        data: response.fields,
      };
    } catch (error: any) {
      logger.error('Failed to get custom fields', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }
}
