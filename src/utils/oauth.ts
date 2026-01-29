/**
 * OAuth 2.1 with PKCE (Proof Key for Code Exchange) implementation for ClickUp
 * 
 * ClickUp requires OAuth 2.1 with PKCE - API keys are not supported by the MCP server
 */

import * as crypto from 'crypto';
import axios from 'axios';
import { OAuthTokens, OAuthConfig, PKCEVerifier } from '../types/clickup';
import { logger } from './logger';

// ClickUp OAuth endpoints
const CLICKUP_AUTH_URL = 'https://app.clickup.com/api';
const CLICKUP_TOKEN_URL = 'https://api.clickup.com/api/v2/oauth/token';

/**
 * Generates a cryptographically random string for PKCE code verifier
 */
function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(32));
}

/**
 * Generates code challenge from code verifier using SHA256
 */
function generateCodeChallenge(verifier: string): string {
  return base64URLEncode(
    crypto.createHash('sha256').update(verifier).digest()
  );
}

/**
 * Base64 URL encoding (without padding)
 */
function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE verifier and challenge pair
 */
export function generatePKCEPair(): PKCEVerifier {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  logger.debug('Generated PKCE pair', { 
    verifierLength: codeVerifier.length,
    challengeLength: codeChallenge.length 
  });
  
  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Build authorization URL for OAuth flow
 */
export function buildAuthorizationUrl(
  config: OAuthConfig,
  codeChallenge: string,
  state?: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  if (state) {
    params.append('state', state);
  }

  const url = `${CLICKUP_AUTH_URL}?${params.toString()}`;
  logger.info('Built authorization URL');
  
  return url;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  config: OAuthConfig,
  code: string,
  codeVerifier: string
): Promise<OAuthTokens> {
  logger.info('Exchanging authorization code for access token');

  try {
    const response = await axios.post<OAuthTokens>(
      CLICKUP_TOKEN_URL,
      {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('Successfully obtained access token');
    return response.data;
  } catch (error: any) {
    logger.error('Failed to exchange code for token', error);
    throw new Error(
      `OAuth token exchange failed: ${error.response?.data?.err || error.message}`
    );
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  config: OAuthConfig,
  refreshToken: string
): Promise<OAuthTokens> {
  logger.info('Refreshing access token');

  try {
    const response = await axios.post<OAuthTokens>(
      CLICKUP_TOKEN_URL,
      {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('Successfully refreshed access token');
    return response.data;
  } catch (error: any) {
    logger.error('Failed to refresh token', error);
    throw new Error(
      `Token refresh failed: ${error.response?.data?.err || error.message}`
    );
  }
}

/**
 * OAuth Token Manager - handles token storage and refresh
 */
export class OAuthTokenManager {
  private tokens: OAuthTokens | null = null;
  private config: OAuthConfig;
  private tokenExpiryTime: number | null = null;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Set tokens manually (e.g., after initial authorization)
   */
  setTokens(tokens: OAuthTokens): void {
    this.tokens = tokens;
    this.tokenExpiryTime = Date.now() + tokens.expires_in * 1000;
    logger.info('Tokens set, expires in', { expiresIn: tokens.expires_in });
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error('No tokens available. Please authenticate first.');
    }

    // Check if token is expired or will expire in next 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    if (
      this.tokenExpiryTime &&
      Date.now() > this.tokenExpiryTime - fiveMinutes
    ) {
      logger.info('Token expired or expiring soon, refreshing...');
      
      if (!this.tokens.refresh_token) {
        throw new Error('No refresh token available');
      }

      this.tokens = await refreshAccessToken(
        this.config,
        this.tokens.refresh_token
      );
      this.tokenExpiryTime = Date.now() + this.tokens.expires_in * 1000;
    }

    return this.tokens.access_token;
  }

  /**
   * Check if tokens are available
   */
  hasTokens(): boolean {
    return this.tokens !== null;
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    this.tokens = null;
    this.tokenExpiryTime = null;
    logger.info('Tokens cleared');
  }
}

/**
 * Complete OAuth flow helper
 * Returns authorization URL and a function to complete the flow
 */
export function initiateOAuthFlow(config: OAuthConfig): {
  authorizationUrl: string;
  pkceVerifier: PKCEVerifier;
  completeFlow: (code: string) => Promise<OAuthTokens>;
} {
  const pkceVerifier = generatePKCEPair();
  const state = crypto.randomBytes(16).toString('hex');
  const authorizationUrl = buildAuthorizationUrl(
    config,
    pkceVerifier.codeChallenge,
    state
  );

  return {
    authorizationUrl,
    pkceVerifier,
    completeFlow: async (code: string) => {
      return exchangeCodeForToken(config, code, pkceVerifier.codeVerifier);
    },
  };
}
