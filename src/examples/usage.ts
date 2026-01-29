/**
 * ClickUp MCP Integration - Usage Examples
 * 
 * This file demonstrates how to use all the features of the ClickUp MCP integration
 */

import {
  createClickUpIntegration,
  OAuthTokens,
} from '../index';

// ============================================================================
// 1. INITIALIZATION & AUTHENTICATION
// ============================================================================

async function initializeClickUp() {
  // Create the integration instance
  const clickup = createClickUpIntegration({
    workspaceId: process.env.CLICKUP_WORKSPACE_ID!,
    spaceId: process.env.CLICKUP_SPACE_ID,
    clientId: process.env.CLICKUP_CLIENT_ID!,
    clientSecret: process.env.CLICKUP_CLIENT_SECRET!,
    redirectUri: process.env.CLICKUP_REDIRECT_URI!,
  });

  console.log('Step 1: Visit this URL to authorize:');
  console.log(clickup.oauth.authorizationUrl);
  console.log('\nAfter authorization, you will be redirected with a code parameter.');
  console.log('Use that code to complete the OAuth flow.\n');

  // In a real app, you would:
  // 1. Redirect user to authorizationUrl
  // 2. User authorizes the app
  // 3. ClickUp redirects back to your redirectUri with ?code=XXX
  // 4. Extract the code and complete the flow:
  
  // const authCode = 'CODE_FROM_REDIRECT_URL';
  // const tokens = await clickup.oauth.completeFlow(authCode);
  // console.log('Authenticated!', tokens);

  return clickup;
}

// ============================================================================
// 2. TASK MANAGEMENT EXAMPLES
// ============================================================================

async function taskExamples(clickup: any) {
  const { tasks } = clickup.services;
  const listId = 'your_list_id';
  const taskId = 'your_task_id';

  // List all tasks in a list
  console.log('\n=== Listing Tasks ===');
  const tasksResult = await tasks.listTasks(listId, {
    include_closed: false,
    order_by: 'created',
    statuses: ['in progress', 'open'],
  });
  
  if (tasksResult.success) {
    console.log(`Found ${tasksResult.data?.length} tasks`);
    tasksResult.data?.forEach((task: any) => {
      console.log(`- ${task.name} (${task.status.status})`);
    });
  }

  // Create a new task
  console.log('\n=== Creating Task ===');
  const newTaskResult = await tasks.createTask(listId, {
    name: 'Implement new feature',
    description: 'This is a detailed description of the task',
    priority: 1, // 1 = Urgent, 2 = High, 3 = Normal, 4 = Low
    status: 'open',
    due_date: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    tags: ['feature', 'backend'],
    assignees: [123456], // User IDs
  });

  if (newTaskResult.success && newTaskResult.data) {
    console.log('Task created:', newTaskResult.data.name);
    console.log('Task ID:', newTaskResult.data.id);
  }

  // Get task details
  console.log('\n=== Getting Task Details ===');
  const taskResult = await tasks.getTask(taskId);
  
  if (taskResult.success && taskResult.data) {
    const task = taskResult.data;
    console.log('Task:', task.name);
    console.log('Status:', task.status.status);
    console.log('Assignees:', task.assignees.map((a: any) => a.username).join(', '));
    console.log('Time Spent:', task.time_spent ? `${task.time_spent / 1000}s` : 'None');
  }

  // Update task
  console.log('\n=== Updating Task ===');
  const updateResult = await tasks.updateTask(taskId, {
    name: 'Updated task name',
    status: 'in progress',
    priority: 2,
  });

  if (updateResult.success) {
    console.log('Task updated successfully');
  }

  // Update task status only
  console.log('\n=== Updating Task Status ===');
  await tasks.updateTaskStatus(taskId, 'complete');

  // Assign users to task
  console.log('\n=== Assigning Users ===');
  await tasks.assignUsersToTask(taskId, [123456, 789012]);

  // Add comment to task
  console.log('\n=== Adding Comment ===');
  const commentResult = await tasks.addTaskComment(
    taskId,
    'Great work on this task! 🎉'
  );

  if (commentResult.success) {
    console.log('Comment added successfully');
  }

  // Search tasks
  console.log('\n=== Searching Tasks ===');
  const searchResult = await tasks.searchTasks(
    process.env.CLICKUP_WORKSPACE_ID!,
    'bug fix'
  );

  if (searchResult.success && searchResult.data) {
    console.log(`Found ${searchResult.data.length} tasks matching "bug fix"`);
  }
}

// ============================================================================
// 3. SPACE & LIST MANAGEMENT EXAMPLES
// ============================================================================

async function spaceAndListExamples(clickup: any) {
  const { spaces, lists } = clickup.services;
  const workspaceId = process.env.CLICKUP_WORKSPACE_ID!;
  const spaceId = process.env.CLICKUP_SPACE_ID!;

  // List all spaces
  console.log('\n=== Listing Spaces ===');
  const spacesResult = await spaces.listSpaces(workspaceId);
  
  if (spacesResult.success && spacesResult.data) {
    console.log(`Found ${spacesResult.data.length} spaces`);
    spacesResult.data.forEach((space: any) => {
      console.log(`- ${space.name} (ID: ${space.id})`);
    });
  }

  // Get space details
  console.log('\n=== Getting Space Details ===');
  const spaceResult = await spaces.getSpace(spaceId);
  
  if (spaceResult.success && spaceResult.data) {
    const space = spaceResult.data;
    console.log('Space:', space.name);
    console.log('Features:', {
      timeTracking: space.features.time_tracking.enabled,
      customFields: space.features.custom_fields.enabled,
      dueDates: space.features.due_dates.enabled,
    });
  }

  // Create a new space
  console.log('\n=== Creating Space ===');
  const newSpaceResult = await spaces.createSpace(
    workspaceId,
    'New Project Space',
    {
      multiple_assignees: true,
    }
  );

  if (newSpaceResult.success && newSpaceResult.data) {
    console.log('Space created:', newSpaceResult.data.name);
  }

  // List folders in space
  console.log('\n=== Listing Folders ===');
  const foldersResult = await spaces.listFolders(spaceId);
  
  if (foldersResult.success && foldersResult.data) {
    console.log(`Found ${foldersResult.data.length} folders`);
  }

  // List folderless lists in space
  console.log('\n=== Listing Lists in Space ===');
  const listsResult = await lists.getListsInSpace(spaceId);
  
  if (listsResult.success && listsResult.data) {
    console.log(`Found ${listsResult.data.length} lists`);
    listsResult.data.forEach((list: any) => {
      console.log(`- ${list.name} (${list.task_count} tasks)`);
    });
  }

  // Create a new list
  console.log('\n=== Creating List ===');
  const newListResult = await lists.createListInSpace(spaceId, {
    name: 'Sprint 1 Tasks',
    content: 'Tasks for the first sprint',
  });

  if (newListResult.success && newListResult.data) {
    console.log('List created:', newListResult.data.name);
    console.log('List ID:', newListResult.data.id);
  }

  // Update list
  console.log('\n=== Updating List ===');
  const listId = 'your_list_id';
  await lists.updateList(listId, {
    name: 'Updated List Name',
  });
}

// ============================================================================
// 4. TIME TRACKING EXAMPLES
// ============================================================================

async function timeTrackingExamples(clickup: any) {
  const { timeTracking } = clickup.services;
  const taskId = 'your_task_id';
  const workspaceId = process.env.CLICKUP_WORKSPACE_ID!;

  // Start a timer
  console.log('\n=== Starting Timer ===');
  const startResult = await timeTracking.startTimer(
    taskId,
    'Working on feature implementation'
  );

  if (startResult.success && startResult.data) {
    console.log('Timer started for task:', startResult.data.task.name);
    console.log('Started at:', new Date(startResult.data.start));
  }

  // Get running timer
  console.log('\n=== Getting Running Timer ===');
  const runningTimer = await timeTracking.getRunningTimer(workspaceId);
  
  if (runningTimer.success && runningTimer.data) {
    console.log('Currently tracking:', runningTimer.data.task.name);
    const elapsed = Date.now() - parseInt(runningTimer.data.start);
    console.log(`Elapsed: ${Math.floor(elapsed / 1000 / 60)} minutes`);
  } else if (runningTimer.success && !runningTimer.data) {
    console.log('No timer currently running');
  }

  // Stop the timer
  console.log('\n=== Stopping Timer ===');
  const stopResult = await timeTracking.stopTimer(workspaceId);
  
  if (stopResult.success) {
    console.log('Timer stopped successfully');
  }

  // Log time manually (2 hours)
  console.log('\n=== Logging Time ===');
  const logResult = await timeTracking.logTimeInHours(
    taskId,
    2,
    'Completed feature development'
  );

  if (logResult.success && logResult.data) {
    console.log('Time logged:', logResult.data.duration);
  }

  // Get time entries for a task
  console.log('\n=== Getting Time Entries ===');
  const entriesResult = await timeTracking.getTaskTimeEntries(taskId);
  
  if (entriesResult.success && entriesResult.data) {
    console.log(`Found ${entriesResult.data.length} time entries`);
    entriesResult.data.forEach((entry: any) => {
      const durationHours = parseInt(entry.duration) / 1000 / 60 / 60;
      console.log(`- ${durationHours.toFixed(2)}h by ${entry.user.username}`);
      if (entry.description) {
        console.log(`  Description: ${entry.description}`);
      }
    });
  }

  // Get total time tracked
  console.log('\n=== Getting Total Time Tracked ===');
  const totalResult = await timeTracking.getTotalTimeTracked(taskId);
  
  if (totalResult.success && totalResult.data) {
    const totalHours = totalResult.data / 1000 / 60 / 60;
    console.log(`Total time tracked: ${totalHours.toFixed(2)} hours`);
  }

  // Update a time entry
  console.log('\n=== Updating Time Entry ===');
  const intervalId = 'time_entry_id';
  await timeTracking.updateTimeEntry(taskId, intervalId, {
    duration: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
    description: 'Updated description',
    billable: true,
  });

  // Get team time entries for date range
  console.log('\n=== Getting Team Time Entries ===');
  const startDate = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
  const endDate = Date.now();
  
  const teamEntriesResult = await timeTracking.getTeamTimeEntries(
    workspaceId,
    startDate,
    endDate
  );

  if (teamEntriesResult.success && teamEntriesResult.data) {
    console.log(`Team logged ${teamEntriesResult.data.length} time entries this week`);
  }
}

// ============================================================================
// 5. COMPLETE WORKFLOW EXAMPLE
// ============================================================================

async function completeWorkflowExample(clickup: any) {
  console.log('\n=== COMPLETE WORKFLOW EXAMPLE ===\n');

  const workspaceId = process.env.CLICKUP_WORKSPACE_ID!;
  const spaceId = process.env.CLICKUP_SPACE_ID!;

  // 1. Create a new list for the sprint
  console.log('1. Creating sprint list...');
  const listResult = await clickup.services.lists.createListInSpace(spaceId, {
    name: 'Sprint 5 - January 2026',
    content: 'Tasks for Sprint 5',
  });

  if (!listResult.success || !listResult.data) {
    console.error('Failed to create list');
    return;
  }

  const listId = listResult.data.id;
  console.log(`✓ List created: ${listId}`);

  // 2. Create a task
  console.log('\n2. Creating task...');
  const taskResult = await clickup.services.tasks.createTask(listId, {
    name: 'Implement user authentication',
    description: 'Add OAuth 2.0 authentication to the application',
    priority: 1,
    tags: ['feature', 'security'],
    time_estimate: 8 * 60 * 60 * 1000, // 8 hours estimate
  });

  if (!taskResult.success || !taskResult.data) {
    console.error('Failed to create task');
    return;
  }

  const taskId = taskResult.data.id;
  console.log(`✓ Task created: ${taskId}`);

  // 3. Start working - start timer
  console.log('\n3. Starting timer...');
  await clickup.services.timeTracking.startTimer(
    taskId,
    'Beginning authentication implementation'
  );
  console.log('✓ Timer started');

  // 4. Update task to in progress
  console.log('\n4. Updating task status...');
  await clickup.services.tasks.updateTaskStatus(taskId, 'in progress');
  console.log('✓ Task status updated to "in progress"');

  // 5. Add a comment
  console.log('\n5. Adding progress comment...');
  await clickup.services.tasks.addTaskComment(
    taskId,
    'Started working on OAuth implementation'
  );
  console.log('✓ Comment added');

  // Simulate work...
  console.log('\n[... working on task ...]');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 6. Stop timer
  console.log('\n6. Stopping timer...');
  await clickup.services.timeTracking.stopTimer(workspaceId);
  console.log('✓ Timer stopped');

  // 7. Mark as complete
  console.log('\n7. Completing task...');
  await clickup.services.tasks.updateTaskStatus(taskId, 'complete');
  console.log('✓ Task marked as complete');

  // 8. Add final comment
  console.log('\n8. Adding completion comment...');
  await clickup.services.tasks.addTaskComment(
    taskId,
    'OAuth authentication implemented and tested successfully!'
  );
  console.log('✓ Final comment added');

  console.log('\n=== WORKFLOW COMPLETE ===');
  console.log(`Task ${taskId} completed successfully!\n`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    console.log('=== ClickUp MCP Integration Examples ===\n');

    // Initialize
    const clickup = await initializeClickUp();

    // Note: You need to complete OAuth before running the examples
    // Uncomment the examples you want to run:

    // await taskExamples(clickup);
    // await spaceAndListExamples(clickup);
    // await timeTrackingExamples(clickup);
    // await completeWorkflowExample(clickup);

    console.log('\n✓ All examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for use in other modules
export {
  initializeClickUp,
  taskExamples,
  spaceAndListExamples,
  timeTrackingExamples,
  completeWorkflowExample,
};
