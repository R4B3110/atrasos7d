/**
 * Space Service - Manage ClickUp spaces
 * 
 * Provides methods to interact with spaces (projects)
 */

import { ClickUpMCPClient } from '../mcp-client';
import { Space, ServiceResponse } from '../types/clickup';
import { logger } from '../utils/logger';

export class SpaceService {
  constructor(private client: ClickUpMCPClient) {}

  /**
   * Get all spaces in a workspace
   */
  async listSpaces(teamId: string): Promise<ServiceResponse<Space[]>> {
    try {
      logger.info('Listing spaces', { teamId });

      const response = await this.client.get<{ spaces: Space[] }>(
        `/team/${teamId}/space`,
        { archived: false }
      );

      return {
        success: true,
        data: response.spaces,
      };
    } catch (error: any) {
      logger.error('Failed to list spaces', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get a specific space by ID
   */
  async getSpace(spaceId: string): Promise<ServiceResponse<Space>> {
    try {
      logger.info('Getting space', { spaceId });

      const space = await this.client.get<Space>(`/space/${spaceId}`);

      return {
        success: true,
        data: space,
      };
    } catch (error: any) {
      logger.error('Failed to get space', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Create a new space
   */
  async createSpace(
    teamId: string,
    name: string,
    options?: {
      multiple_assignees?: boolean;
      features?: any;
    }
  ): Promise<ServiceResponse<Space>> {
    try {
      logger.info('Creating space', { teamId, name });

      const space = await this.client.post<Space>(`/team/${teamId}/space`, {
        name,
        ...options,
      });

      logger.info('Space created successfully', { spaceId: space.id });

      return {
        success: true,
        data: space,
      };
    } catch (error: any) {
      logger.error('Failed to create space', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Update a space
   */
  async updateSpace(
    spaceId: string,
    updates: {
      name?: string;
      color?: string;
      private?: boolean;
      features?: any;
    }
  ): Promise<ServiceResponse<Space>> {
    try {
      logger.info('Updating space', { spaceId, updates });

      const space = await this.client.put<Space>(
        `/space/${spaceId}`,
        updates
      );

      logger.info('Space updated successfully', { spaceId });

      return {
        success: true,
        data: space,
      };
    } catch (error: any) {
      logger.error('Failed to update space', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get folders in a space
   */
  async listFolders(spaceId: string): Promise<ServiceResponse<any[]>> {
    try {
      logger.info('Listing folders', { spaceId });

      const response = await this.client.get<{ folders: any[] }>(
        `/space/${spaceId}/folder`,
        { archived: false }
      );

      return {
        success: true,
        data: response.folders,
      };
    } catch (error: any) {
      logger.error('Failed to list folders', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Create a folder in a space
   */
  async createFolder(
    spaceId: string,
    name: string
  ): Promise<ServiceResponse<any>> {
    try {
      logger.info('Creating folder', { spaceId, name });

      const folder = await this.client.post(`/space/${spaceId}/folder`, {
        name,
      });

      logger.info('Folder created successfully', { folderId: folder.id });

      return {
        success: true,
        data: folder,
      };
    } catch (error: any) {
      logger.error('Failed to create folder', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }
}
