# Cursor MCP Configuration

This directory contains configuration for Model Context Protocol (MCP) integration with Cursor IDE.

## Setup Instructions

### Option 1: Using Official ClickUp MCP Server (Recommended)

The `mcp.json` file is configured to use ClickUp's official MCP server. Follow these steps:

1. **Get Your ClickUp IDs**:
   - **Workspace ID**: Your team/workspace ID from ClickUp
   - **Space ID** (optional): The specific space you want to work in

2. **Update mcp.json**:
   ```bash
   # Edit the .cursor/mcp.json file
   # Replace YOUR_WORKSPACE_ID_HERE and YOUR_SPACE_ID_HERE with your actual IDs
   ```

3. **Authenticate with ClickUp**:
   - The MCP server uses OAuth 2.1 with PKCE
   - When you first use the MCP features, you'll be prompted to authenticate
   - Follow the OAuth flow to grant access

4. **Restart Cursor**:
   - Close and reopen Cursor IDE
   - The ClickUp MCP server should now be available

### Option 2: Using the TypeScript Integration

If you prefer to use the TypeScript integration directly instead of the official MCP server:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Update mcp.json** to point to your local build:
   ```json
   {
     "mcpServers": {
       "clickup-local": {
         "command": "node",
         "args": ["dist/index.js"],
         "env": {
           "CLICKUP_CLIENT_ID": "your_client_id",
           "CLICKUP_CLIENT_SECRET": "your_client_secret",
           "CLICKUP_WORKSPACE_ID": "your_workspace_id",
           "CLICKUP_SPACE_ID": "your_space_id"
         }
       }
     }
   }
   ```

## Available MCP Features

Once configured, you can use natural language commands in Cursor to interact with ClickUp:

### Task Management
- "List all tasks in my current space"
- "Create a new task called 'Fix login bug' with high priority"
- "Update task XYZ to in progress status"
- "Show me all tasks assigned to me"
- "Add a comment to task ABC: 'Working on this now'"

### Space & List Management
- "Show me all spaces in my workspace"
- "List all lists in the current space"
- "Create a new list called 'Sprint 5 Tasks'"
- "What folders exist in this space?"

### Time Tracking
- "Start timer for task XYZ"
- "Stop my current timer"
- "Log 2 hours to task ABC"
- "Show me time entries for task XYZ"
- "How much time has been tracked on this task?"

### Search & Queries
- "Search for tasks containing 'authentication'"
- "Find all high priority tasks"
- "Show me closed tasks from last week"
- "What's the status of project XYZ?"

## Troubleshooting

### MCP Server Not Loading
- Check that the `mcp.json` file is valid JSON
- Verify your workspace and space IDs are correct
- Restart Cursor IDE
- Check Cursor's developer console for errors

### Authentication Issues
- Make sure you've completed the OAuth flow
- Check that your ClickUp account has access to the workspace
- Verify redirect URIs match in your ClickUp app settings

### Rate Limiting
- The MCP server respects ClickUp's API rate limits
- If you hit rate limits, wait a few minutes before retrying
- Consider caching frequently accessed data

## Security Notes

- **Never commit OAuth tokens** to version control
- Store sensitive credentials in environment variables
- Use different credentials for development/production
- Regularly rotate your OAuth credentials

## Additional Resources

- [ClickUp MCP Documentation](https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server)
- [MCP Specification](https://modelcontextprotocol.io/)
- [ClickUp API Reference](https://developer.clickup.com/reference)

## Getting Help

If you encounter issues:

1. Check the [ClickUp API Status](https://status.clickup.com/)
2. Review the [ClickUp MCP feedback page](https://feedback.clickup.com/public-api/p/clickup-mcp-server-first-party-and-official)
3. Check Cursor's documentation for MCP integration
4. Review logs in Cursor's developer console
