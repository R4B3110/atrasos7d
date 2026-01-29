/**
 * Time Tracking Service - Manage time tracking in ClickUp
 * 
 * Provides methods to track time, manage timers, and log time entries
 */

import { ClickUpMCPClient } from '../mcp-client';
import { TimeEntry, Timer, ServiceResponse } from '../types/clickup';
import { logger } from '../utils/logger';

export class TimeTrackingService {
  constructor(private client: ClickUpMCPClient) {}

  /**
   * Get time entries for a task
   */
  async getTaskTimeEntries(taskId: string): Promise<ServiceResponse<TimeEntry[]>> {
    try {
      logger.info('Getting time entries for task', { taskId });

      const response = await this.client.get<{ data: TimeEntry[] }>(
        `/task/${taskId}/time`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      logger.error('Failed to get time entries', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Create/log a time entry for a task
   */
  async logTime(
    taskId: string,
    duration: number,
    description?: string,
    start?: number
  ): Promise<ServiceResponse<TimeEntry>> {
    try {
      logger.info('Logging time for task', { taskId, duration, description });

      const timeEntry = await this.client.post<TimeEntry>(
        `/task/${taskId}/time`,
        {
          duration, // duration in milliseconds
          description: description || '',
          start: start || Date.now(),
        }
      );

      logger.info('Time logged successfully', { 
        taskId, 
        duration: `${duration / 1000}s` 
      });

      return {
        success: true,
        data: timeEntry,
      };
    } catch (error: any) {
      logger.error('Failed to log time', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Update a time entry
   */
  async updateTimeEntry(
    taskId: string,
    intervalId: string,
    updates: {
      duration?: number;
      description?: string;
      start?: number;
      billable?: boolean;
    }
  ): Promise<ServiceResponse<TimeEntry>> {
    try {
      logger.info('Updating time entry', { taskId, intervalId, updates });

      const timeEntry = await this.client.put<TimeEntry>(
        `/task/${taskId}/time/${intervalId}`,
        updates
      );

      logger.info('Time entry updated successfully');

      return {
        success: true,
        data: timeEntry,
      };
    } catch (error: any) {
      logger.error('Failed to update time entry', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Delete a time entry
   */
  async deleteTimeEntry(
    taskId: string,
    intervalId: string
  ): Promise<ServiceResponse<void>> {
    try {
      logger.info('Deleting time entry', { taskId, intervalId });

      await this.client.delete(`/task/${taskId}/time/${intervalId}`);

      logger.info('Time entry deleted successfully');

      return {
        success: true,
      };
    } catch (error: any) {
      logger.error('Failed to delete time entry', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get running timer for the current user
   */
  async getRunningTimer(teamId: string): Promise<ServiceResponse<Timer | null>> {
    try {
      logger.info('Getting running timer', { teamId });

      const response = await this.client.get<{ data: Timer | null }>(
        `/team/${teamId}/time_entries/current`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      // 404 means no timer is running
      if (error.response?.status === 404) {
        return {
          success: true,
          data: null,
        };
      }

      logger.error('Failed to get running timer', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Start a timer for a task
   */
  async startTimer(
    taskId: string,
    description?: string
  ): Promise<ServiceResponse<Timer>> {
    try {
      logger.info('Starting timer for task', { taskId, description });

      const timer = await this.client.post<Timer>(
        `/task/${taskId}/time`,
        {
          description: description || '',
          // Don't provide duration - this starts a running timer
        }
      );

      logger.info('Timer started successfully', { taskId });

      return {
        success: true,
        data: timer,
      };
    } catch (error: any) {
      logger.error('Failed to start timer', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Stop the currently running timer
   */
  async stopTimer(teamId: string): Promise<ServiceResponse<void>> {
    try {
      logger.info('Stopping timer', { teamId });

      await this.client.delete(`/team/${teamId}/time_entries/current`);

      logger.info('Timer stopped successfully');

      return {
        success: true,
      };
    } catch (error: any) {
      logger.error('Failed to stop timer', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Get all time entries in a team within a date range
   */
  async getTeamTimeEntries(
    teamId: string,
    startDate?: number,
    endDate?: number
  ): Promise<ServiceResponse<TimeEntry[]>> {
    try {
      logger.info('Getting team time entries', { teamId, startDate, endDate });

      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await this.client.get<{ data: TimeEntry[] }>(
        `/team/${teamId}/time_entries`,
        params
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      logger.error('Failed to get team time entries', error);
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Helper: Log time in hours
   */
  async logTimeInHours(
    taskId: string,
    hours: number,
    description?: string
  ): Promise<ServiceResponse<TimeEntry>> {
    const duration = hours * 60 * 60 * 1000; // Convert hours to milliseconds
    return this.logTime(taskId, duration, description);
  }

  /**
   * Helper: Log time in minutes
   */
  async logTimeInMinutes(
    taskId: string,
    minutes: number,
    description?: string
  ): Promise<ServiceResponse<TimeEntry>> {
    const duration = minutes * 60 * 1000; // Convert minutes to milliseconds
    return this.logTime(taskId, duration, description);
  }

  /**
   * Helper: Get total time tracked on a task
   */
  async getTotalTimeTracked(taskId: string): Promise<ServiceResponse<number>> {
    try {
      const result = await this.getTaskTimeEntries(taskId);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to get time entries',
          statusCode: result.statusCode,
        };
      }

      const totalMs = result.data.reduce((sum, entry) => {
        return sum + parseInt(entry.duration);
      }, 0);

      return {
        success: true,
        data: totalMs,
      };
    } catch (error: any) {
      logger.error('Failed to calculate total time', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
