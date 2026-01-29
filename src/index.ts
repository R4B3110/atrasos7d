/**
 * ClickUp MCP Integration - Main Entry Point
 * 
 * This module exports all the services and utilities for integrating
 * with ClickUp using the Model Context Protocol (MCP)
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Export client
export { ClickUpMCPClient, createClickUpMCPClient } from './mcp-client';

// Export services
export { TaskService } from './services/task-service';
export { SpaceService } from './services/space-service';
export { ListService } from './services/list-service';
export { TimeTrackingService } from './services/time-tracking';

// Export utilities
export {
  generatePKCEPair,
  buildAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  OAuthTokenManager,
  initiateOAuthFlow,
} from './utils/oauth';

export { logger, LogLevel } from './utils/logger';

// Export types
export * from './types/clickup';

// Import necessary classes and functions
import { OAuthTokenManager, initiateOAuthFlow } from './utils/oauth';
import { ClickUpMCPClient, createClickUpMCPClient } from './mcp-client';
import { TaskService } from './services/task-service';
import { SpaceService } from './services/space-service';
import { ListService } from './services/list-service';
import { TimeTrackingService } from './services/time-tracking';

/**
 * Create a complete ClickUp integration instance
 */
export function createClickUpIntegration(config: {
  workspaceId: string;
  spaceId?: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const { workspaceId, spaceId, clientId, clientSecret, redirectUri } = config;

  // Create OAuth token manager
  const tokenManager = new OAuthTokenManager({
    clientId,
    clientSecret,
    redirectUri,
  });

  // Create MCP client
  const client = createClickUpMCPClient(
    {
      workspaceId,
      spaceId,
    },
    tokenManager
  );

  // Create services
  const taskService = new TaskService(client);
  const spaceService = new SpaceService(client);
  const listService = new ListService(client);
  const timeTrackingService = new TimeTrackingService(client);

  // Initiate OAuth flow
  const oauthFlow = initiateOAuthFlow({
    clientId,
    clientSecret,
    redirectUri,
  });

  return {
    client,
    tokenManager,
    services: {
      tasks: taskService,
      spaces: spaceService,
      lists: listService,
      timeTracking: timeTrackingService,
    },
    oauth: {
      authorizationUrl: oauthFlow.authorizationUrl,
      completeFlow: async (code: string) => {
        const tokens = await oauthFlow.completeFlow(code);
        tokenManager.setTokens(tokens);
        return tokens;
      },
    },
  };
}
