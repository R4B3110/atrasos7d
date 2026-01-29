/**
 * Task Service - Manage ClickUp tasks
 * 
 * Provides methods to create, read, update, and delete tasks
 */

import { ClickUpMCPClient } from '../mcp-client';
import {
  Task,
  CreateTaskParams,
  UpdateTaskParams,
  ListTasksParams,
  ServiceResponse,
} from '../types/clickup';
import { logger } from '../utils/logger';

export class TaskService {
  constructor(private client: ClickUpMCPClient) {}

  /**
   * List tasks in a list with optional filters
   */
  async listTasks(
    listId: string,
    params?: ListTasksParams
  ): Promise<ServiceResponse<Task[]>> {
    try {
      logger.info('Listing tasks', { listId, params });

      const response = await this.client.get<{ tasks: Task[] }>(
        `/list/${listId}/task`,
        params
      );

      return {
        success: true,
        data: response.tasks,
      };
    } catch (error: any) {
      logger.error('Failed to list tasks', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get tasks from a space
   */
  async getTasksFromSpace(
    spaceId: string,
    params?: ListTasksParams
  ): Promise<ServiceResponse<Task[]>> {
    try {
      logger.info('Getting tasks from space', { spaceId, params });

      const response = await this.client.get<{ tasks: Task[] }>(
        `/space/${spaceId}/task`,
        params
      );

      return {
        success: true,
        data: response.tasks,
      };
    } catch (error: any) {
      logger.error('Failed to get tasks from space', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(taskId: string): Promise<ServiceResponse<Task>> {
    try {
      logger.info('Getting task', { taskId });

      const task = await this.client.get<Task>(`/task/${taskId}`);

      return {
        success: true,
        data: task,
      };
    } catch (error: any) {
      logger.error('Failed to get task', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Create a new task
   */
  async createTask(
    listId: string,
    taskData: CreateTaskParams
  ): Promise<ServiceResponse<Task>> {
    try {
      logger.info('Creating task', { listId, taskData });

      const task = await this.client.post<Task>(
        `/list/${listId}/task`,
        taskData
      );

      logger.info('Task created successfully', { taskId: task.id });

      return {
        success: true,
        data: task,
      };
    } catch (error: any) {
      logger.error('Failed to create task', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(
    taskId: string,
    updates: UpdateTaskParams
  ): Promise<ServiceResponse<Task>> {
    try {
      logger.info('Updating task', { taskId, updates });

      const task = await this.client.put<Task>(`/task/${taskId}`, updates);

      logger.info('Task updated successfully', { taskId });

      return {
        success: true,
        data: task,
      };
    } catch (error: any) {
      logger.error('Failed to update task', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: string,
    status: string
  ): Promise<ServiceResponse<Task>> {
    return this.updateTask(taskId, { status });
  }

  /**
   * Update task priority
   */
  async updateTaskPriority(
    taskId: string,
    priority: number
  ): Promise<ServiceResponse<Task>> {
    return this.updateTask(taskId, { priority });
  }

  /**
   * Assign users to a task
   */
  async assignUsersToTask(
    taskId: string,
    userIds: number[]
  ): Promise<ServiceResponse<Task>> {
    return this.updateTask(taskId, {
      assignees: {
        add: userIds,
      },
    });
  }

  /**
   * Remove users from a task
   */
  async removeUsersFromTask(
    taskId: string,
    userIds: number[]
  ): Promise<ServiceResponse<Task>> {
    return this.updateTask(taskId, {
      assignees: {
        rem: userIds,
      },
    });
  }

  /**
   * Set task due date
   */
  async setTaskDueDate(
    taskId: string,
    dueDate: number | null
  ): Promise<ServiceResponse<Task>> {
    return this.updateTask(taskId, { due_date: dueDate });
  }

  /**
   * Archive a task
   */
  async archiveTask(taskId: string): Promise<ServiceResponse<Task>> {
    return this.updateTask(taskId, { archived: true });
  }

  /**
   * Unarchive a task
   */
  async unarchiveTask(taskId: string): Promise<ServiceResponse<Task>> {
    return this.updateTask(taskId, { archived: false });
  }

  /**
   * Delete a task (Note: ClickUp MCP doesn't support deletion for safety)
   * This method archives instead
   */
  async deleteTask(taskId: string): Promise<ServiceResponse<Task>> {
    logger.warn(
      'Delete operation not supported by MCP, archiving task instead',
      { taskId }
    );
    return this.archiveTask(taskId);
  }

  /**
   * Search tasks by text
   */
  async searchTasks(
    teamId: string,
    query: string
  ): Promise<ServiceResponse<Task[]>> {
    try {
      logger.info('Searching tasks', { teamId, query });

      const response = await this.client.get<{ tasks: Task[] }>(
        `/team/${teamId}/task`,
        { search: query }
      );

      return {
        success: true,
        data: response.tasks,
      };
    } catch (error: any) {
      logger.error('Failed to search tasks', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get task comments
   */
  async getTaskComments(taskId: string): Promise<ServiceResponse<any[]>> {
    try {
      logger.info('Getting task comments', { taskId });

      const response = await this.client.get<{ comments: any[] }>(
        `/task/${taskId}/comment`
      );

      return {
        success: true,
        data: response.comments,
      };
    } catch (error: any) {
      logger.error('Failed to get task comments', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Add comment to task
   */
  async addTaskComment(
    taskId: string,
    commentText: string
  ): Promise<ServiceResponse<any>> {
    try {
      logger.info('Adding task comment', { taskId });

      const comment = await this.client.post(`/task/${taskId}/comment`, {
        comment_text: commentText,
      });

      return {
        success: true,
        data: comment,
      };
    } catch (error: any) {
      logger.error('Failed to add task comment', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }
}
