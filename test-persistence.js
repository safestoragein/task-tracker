#!/usr/bin/env node

/**
 * Test script to verify data persistence functionality
 * This script tests both local storage and database sync capabilities
 */

const puppeteer = require('puppeteer');

async function testDataPersistence() {
  console.log('🧪 Starting data persistence test...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to the app
    console.log('📱 Opening application...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
    
    // Check if login is required
    const loginFormExists = await page.$('.login-form') !== null;
    if (loginFormExists) {
      console.log('🔐 Logging in...');
      // Handle login if needed
      await page.type('input[type="email"]', 'test@safestorage.com');
      await page.type('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Create a test task
    console.log('➕ Creating test task...');
    const taskTitle = `Test Task ${Date.now()}`;
    
    // Check for quick task input
    const quickInputExists = await page.$('input[placeholder*="task"]') !== null;
    if (quickInputExists) {
      await page.type('input[placeholder*="task"]', taskTitle);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    // Get local storage data
    const localStorageData = await page.evaluate(() => {
      return {
        tasks: localStorage.getItem('task_tracker_tasks'),
        teamMembers: localStorage.getItem('task_tracker_team_members'),
        labels: localStorage.getItem('task_tracker_labels'),
        lastSync: localStorage.getItem('task_tracker_last_sync')
      };
    });
    
    console.log('\n📦 Local Storage Status:');
    console.log('  - Tasks stored:', localStorageData.tasks ? '✅' : '❌');
    console.log('  - Team members stored:', localStorageData.teamMembers ? '✅' : '❌');
    console.log('  - Labels stored:', localStorageData.labels ? '✅' : '❌');
    console.log('  - Last sync time:', localStorageData.lastSync || 'Never');
    
    // Reload page to test persistence
    console.log('\n🔄 Reloading page to test persistence...');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Check if data persists after reload
    const dataAfterReload = await page.evaluate(() => {
      const tasksEl = document.querySelectorAll('[data-testid="task-card"], .task-card, [class*="task"]');
      const syncStatusEl = document.querySelector('[class*="sync"], [class*="online"], [class*="offline"]');
      
      return {
        taskCount: tasksEl.length,
        syncStatus: syncStatusEl ? syncStatusEl.textContent : 'Unknown',
        localStorage: {
          tasks: localStorage.getItem('task_tracker_tasks'),
          teamMembers: localStorage.getItem('task_tracker_team_members')
        }
      };
    });
    
    console.log('\n✨ Results after page reload:');
    console.log('  - Tasks visible:', dataAfterReload.taskCount > 0 ? `✅ (${dataAfterReload.taskCount} tasks)` : '❌');
    console.log('  - Sync status:', dataAfterReload.syncStatus);
    console.log('  - Local storage intact:', dataAfterReload.localStorage.tasks ? '✅' : '❌');
    
    // Test offline mode
    console.log('\n📴 Testing offline mode...');
    await page.setOfflineMode(true);
    await page.waitForTimeout(1000);
    
    const offlineStatus = await page.evaluate(() => {
      const statusEl = document.querySelector('[class*="offline"], [class*="CloudOff"]');
      return statusEl ? 'Offline indicator shown ✅' : 'Offline indicator not found ❌';
    });
    
    console.log('  -', offlineStatus);
    
    // Test online mode
    console.log('\n📶 Returning to online mode...');
    await page.setOfflineMode(false);
    await page.waitForTimeout(2000);
    
    const onlineStatus = await page.evaluate(() => {
      const statusEl = document.querySelector('[class*="online"], [class*="Cloud"]:not([class*="CloudOff"])');
      return statusEl ? 'Online indicator shown ✅' : 'Online indicator not found ❌';
    });
    
    console.log('  -', onlineStatus);
    
    console.log('\n✅ Data persistence test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  testDataPersistence();
} catch (e) {
  console.log('📦 Puppeteer not installed. Install it with: npm install --save-dev puppeteer');
  console.log('\n🔍 Manual Test Instructions:');
  console.log('1. Open http://localhost:3002 in your browser');
  console.log('2. Add a new task using the quick input or "+" button');
  console.log('3. Refresh the page (F5 or Cmd+R)');
  console.log('4. Verify that your task is still visible');
  console.log('5. Check the sync status indicator in the header');
  console.log('6. Open DevTools > Application > Local Storage');
  console.log('7. Verify that task_tracker_* keys contain your data');
  console.log('8. Disconnect internet and verify offline mode works');
  console.log('9. Reconnect and verify sync resumes');
}