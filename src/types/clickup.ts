/**
 * ClickUp TypeScript Type Definitions
 * Based on ClickUp API v2 and MCP Server specifications
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture: string | null;
  initials: string;
  role: number;
  custom_role: number | null;
  last_active: string;
  date_joined: string;
  date_invited: string;
}

// ============================================================================
// Workspace Types
// ============================================================================

export interface Workspace {
  id: string;
  name: string;
  color: string;
  avatar: string | null;
  members: User[];
}

// ============================================================================
// Space Types
// ============================================================================

export interface Space {
  id: string;
  name: string;
  color: string | null;
  private: boolean;
  statuses: Status[];
  multiple_assignees: boolean;
  features: SpaceFeatures;
  archived: boolean;
}

export interface SpaceFeatures {
  due_dates: {
    enabled: boolean;
    start_date: boolean;
    remap_due_dates: boolean;
    remap_closed_due_date: boolean;
  };
  time_tracking: {
    enabled: boolean;
  };
  tags: {
    enabled: boolean;
  };
  time_estimates: {
    enabled: boolean;
  };
  checklists: {
    enabled: boolean;
  };
  custom_fields: {
    enabled: boolean;
  };
  remap_dependencies: {
    enabled: boolean;
  };
  dependency_warning: {
    enabled: boolean;
  };
  portfolios: {
    enabled: boolean;
  };
}

// ============================================================================
// List Types
// ============================================================================

export interface List {
  id: string;
  name: string;
  orderindex: number;
  content: string;
  status: Status | null;
  priority: Priority | null;
  assignee: User | null;
  task_count: number;
  due_date: string | null;
  start_date: string | null;
  folder: Folder;
  space: Space;
  archived: boolean;
  override_statuses: boolean;
  statuses: Status[];
  permission_level: string;
}

export interface Folder {
  id: string;
  name: string;
  hidden: boolean;
  access: boolean;
}

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
  id: string;
  custom_id: string | null;
  name: string;
  text_content: string;
  description: string;
  status: Status;
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed: string | null;
  date_done: string | null;
  archived: boolean;
  creator: User;
  assignees: User[];
  watchers: User[];
  checklists: Checklist[];
  tags: Tag[];
  parent: string | null;
  priority: Priority | null;
  due_date: string | null;
  start_date: string | null;
  points: number | null;
  time_estimate: number | null;
  time_spent: number | null;
  custom_fields: CustomField[];
  dependencies: string[];
  linked_tasks: string[];
  team_id: string;
  url: string;
  permission_level: string;
  list: List;
  project: Folder;
  folder: Folder;
  space: Space;
}

export interface Status {
  id: string;
  status: string;
  color: string;
  orderindex: number;
  type: 'open' | 'closed' | 'custom';
}

export interface Priority {
  id: string;
  priority: string;
  color: string;
  orderindex: string;
}

export interface Tag {
  name: string;
  tag_fg: string;
  tag_bg: string;
  creator: number;
}

export interface Checklist {
  id: string;
  task_id: string;
  name: string;
  orderindex: number;
  resolved: number;
  unresolved: number;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  orderindex: number;
  assignee: User | null;
  resolved: boolean;
  parent: string | null;
  date_created: string;
  children: string[];
}

export interface CustomField {
  id: string;
  name: string;
  type: string;
  type_config: Record<string, any>;
  date_created: string;
  hide_from_guests: boolean;
  value: any;
  required: boolean;
}

// ============================================================================
// Time Tracking Types
// ============================================================================

export interface TimeEntry {
  id: string;
  task: {
    id: string;
    name: string;
    status: Status;
  };
  wid: string;
  user: User;
  billable: boolean;
  start: string;
  end: string | null;
  duration: string;
  description: string;
  source: string;
  at: string;
}

export interface Timer {
  id: string;
  task: {
    id: string;
    name: string;
  };
  user: User;
  start: string;
  description: string;
}

// ============================================================================
// Comment Types
// ============================================================================

export interface Comment {
  id: string;
  comment_text: string;
  comment: CommentContent[];
  user: User;
  resolved: boolean;
  assignee: User | null;
  assigned_by: User | null;
  reactions: Reaction[];
  date: string;
}

export interface CommentContent {
  text: string;
}

export interface Reaction {
  reaction: string;
  user: User;
  date: string;
}

// ============================================================================
// OAuth Types
// ============================================================================

export interface OAuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface PKCEVerifier {
  codeVerifier: string;
  codeChallenge: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ClickUpAPIError {
  err: string;
  ECODE: string;
}

export interface ListTasksParams {
  archived?: boolean;
  page?: number;
  order_by?: 'id' | 'created' | 'updated' | 'due_date';
  reverse?: boolean;
  subtasks?: boolean;
  statuses?: string[];
  include_closed?: boolean;
  assignees?: string[];
  tags?: string[];
  due_date_gt?: number;
  due_date_lt?: number;
  date_created_gt?: number;
  date_created_lt?: number;
  date_updated_gt?: number;
  date_updated_lt?: number;
  custom_fields?: Record<string, any>[];
}

export interface CreateTaskParams {
  name: string;
  description?: string;
  assignees?: number[];
  tags?: string[];
  status?: string;
  priority?: number;
  due_date?: number;
  due_date_time?: boolean;
  time_estimate?: number;
  start_date?: number;
  start_date_time?: boolean;
  notify_all?: boolean;
  parent?: string;
  links_to?: string;
  check_required_custom_fields?: boolean;
  custom_fields?: CustomFieldValue[];
}

export interface UpdateTaskParams {
  name?: string;
  description?: string;
  status?: string;
  priority?: number;
  due_date?: number | null;
  due_date_time?: boolean;
  parent?: string | null;
  time_estimate?: number | null;
  start_date?: number | null;
  start_date_time?: boolean;
  assignees?: {
    add?: number[];
    rem?: number[];
  };
  archived?: boolean;
}

export interface CustomFieldValue {
  id: string;
  value: any;
}

export interface CreateListParams {
  name: string;
  content?: string;
  due_date?: number;
  due_date_time?: boolean;
  priority?: number;
  assignee?: number;
  status?: string;
}

// ============================================================================
// MCP Server Types
// ============================================================================

export interface MCPServerConfig {
  workspaceId: string;
  spaceId?: string;
  accessToken?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

// ============================================================================
// Service Response Types
// ============================================================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}
