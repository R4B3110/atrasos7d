/**
 * MCP (Model Context Protocol) Client for ClickUp
 * 
 * This client connects to the ClickUp MCP server and provides
 * an interface to interact with ClickUp through the MCP protocol
 */

import axios, { AxiosInstance } from 'axios';
import { OAuthTokenManager } from './utils/oauth';
import { logger } from './utils/logger';
import { MCPServerConfig, ClickUpAPIError } from './types/clickup';

const CLICKUP_API_BASE_URL = 'https://api.clickup.com/api/v2';

export class ClickUpMCPClient {
  private axiosInstance: AxiosInstance;
  private tokenManager: OAuthTokenManager | null = null;
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig, tokenManager?: OAuthTokenManager) {
    this.config = config;
    this.tokenManager = tokenManager || null;

    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: CLICKUP_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Add request interceptor to inject access token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          // Try to get token from token manager
          if (this.tokenManager) {
            const token = await this.tokenManager.getAccessToken();
            config.headers.Authorization = token;
          } else if (this.config.accessToken) {
            // Fallback to static token if provided
            config.headers.Authorization = this.config.accessToken;
          }
        } catch (error) {
          logger.error('Failed to get access token', error);
          throw error;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const apiError: ClickUpAPIError = error.response.data;
          logger.error('ClickUp API Error', {
            status: error.response.status,
            error: apiError.err,
            code: apiError.ECODE,
          });
        } else {
          logger.error('Network or unknown error', error);
        }
        return Promise.reject(error);
      }
    );

    logger.info('ClickUp MCP Client initialized', {
      workspaceId: config.workspaceId,
      hasTokenManager: !!tokenManager,
    });
  }

  /**
   * Set OAuth token manager
   */
  setTokenManager(tokenManager: OAuthTokenManager): void {
    this.tokenManager = tokenManager;
    logger.info('Token manager set');
  }

  /**
   * Get the configured axios instance for making API calls
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Get workspace ID
   */
  getWorkspaceId(): string {
    return this.config.workspaceId;
  }

  /**
   * Get space ID if configured
   */
  getSpaceId(): string | undefined {
    return this.config.spaceId;
  }

  /**
   * Make a GET request to ClickUp API
   */
  async get<T = any>(endpoint: string, params?: any): Promise<T> {
    logger.debug(`GET ${endpoint}`, params);
    const response = await this.axiosInstance.get<T>(endpoint, { params });
    return response.data;
  }

  /**
   * Make a POST request to ClickUp API
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    logger.debug(`POST ${endpoint}`, data);
    const response = await this.axiosInstance.post<T>(endpoint, data);
    return response.data;
  }

  /**
   * Make a PUT request to ClickUp API
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    logger.debug(`PUT ${endpoint}`, data);
    const response = await this.axiosInstance.put<T>(endpoint, data);
    return response.data;
  }

  /**
   * Make a DELETE request to ClickUp API
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    logger.debug(`DELETE ${endpoint}`);
    const response = await this.axiosInstance.delete<T>(endpoint);
    return response.data;
  }

  /**
   * Health check - verify connection to ClickUp API
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to get the authenticated user
      await this.get('/user');
      logger.info('Health check passed');
      return true;
    } catch (error) {
      logger.error('Health check failed', error);
      return false;
    }
  }

  /**
   * Get authenticated user information
   */
  async getAuthenticatedUser(): Promise<any> {
    return this.get('/user');
  }

  /**
   * Get workspace teams
   */
  async getWorkspaceTeams(): Promise<any> {
    return this.get('/team');
  }
}

/**
 * Create a ClickUp MCP Client instance
 */
export function createClickUpMCPClient(
  config: MCPServerConfig,
  tokenManager?: OAuthTokenManager
): ClickUpMCPClient {
  return new ClickUpMCPClient(config, tokenManager);
}
