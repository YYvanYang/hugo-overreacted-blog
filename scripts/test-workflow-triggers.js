#!/usr/bin/env node

/**
 * Test script for GitHub Actions workflow trigger scenarios
 * Tests the deployment workflow changes to ensure proper trigger conditions
 * and independent deployment paths for staging and production.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class WorkflowTester {
  constructor() {
    this.workflowPath = '.github/workflows/deploy.yml';
    this.workflow = null;
    this.testResults = [];
  }

  loadWorkflow() {
    try {
      const workflowContent = fs.readFileSync(this.workflowPath, 'utf8');
      this.workflow = yaml.load(workflowContent);
      console.log('✅ Workflow loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to load workflow:', error.message);
      return false;
    }
  }

  // Test Case 1: Develop branch push should trigger only staging deployment
  testDevelopBranchPush() {
    console.log('\n🧪 Test Case 1: Develop branch push triggers only staging deployment');
    
    const context = {
      github: {
        ref: 'refs/heads/develop',
        event_name: 'push'
      }
    };

    const results = this.evaluateJobConditions(context);
    
    const expected = {
      build: true,
      deploy_staging: true,
      deploy_production: false
    };

    const passed = this.compareResults(results, expected);
    this.testResults.push({
      name: 'Develop branch push',
      passed,
      expected,
      actual: results
    });

    console.log(passed ? '✅ PASSED' : '❌ FAILED');
    if (!passed) {
      console.log('Expected:', expected);
      console.log('Actual:', results);
    }

    return passed;
  }

  // Test Case 2: Main branch push should trigger only production deployment
  testMainBranchPush() {
    console.log('\n🧪 Test Case 2: Main branch push triggers only production deployment');
    
    const context = {
      github: {
        ref: 'refs/heads/main',
        event_name: 'push'
      }
    };

    const results = this.evaluateJobConditions(context);
    
    const expected = {
      build: true,
      deploy_staging: false,
      deploy_production: true
    };

    const passed = this.compareResults(results, expected);
    this.testResults.push({
      name: 'Main branch push',
      passed,
      expected,
      actual: results
    });

    console.log(passed ? '✅ PASSED' : '❌ FAILED');
    if (!passed) {
      console.log('Expected:', expected);
      console.log('Actual:', results);
    }

    return passed;
  }

  // Test Case 3: Manual dispatch to staging should trigger only staging deployment
  testManualStagingDispatch() {
    console.log('\n🧪 Test Case 3: Manual dispatch to staging triggers only staging deployment');
    
    const context = {
      github: {
        ref: 'refs/heads/main', // Testing from main branch to verify manual override
        event_name: 'workflow_dispatch',
        event: {
          inputs: {
            environment: 'staging'
          }
        }
      }
    };

    const results = this.evaluateJobConditions(context);
    
    const expected = {
      build: true,
      deploy_staging: true,
      deploy_production: false
    };

    const passed = this.compareResults(results, expected);
    
    // Note: This test is expected to fail with current workflow logic
    // because manual dispatch doesn't override branch-based conditions
    this.testResults.push({
      name: 'Manual staging dispatch',
      passed,
      expected,
      actual: results,
      note: 'This test reveals a workflow logic issue - manual dispatch should override branch conditions'
    });

    console.log(passed ? '✅ PASSED' : '❌ FAILED (Expected - reveals workflow issue)');
    if (!passed) {
      console.log('Expected:', expected);
      console.log('Actual:', results);
      console.log('⚠️  Issue: Manual staging dispatch from main branch also triggers production deployment');
      console.log('⚠️  This violates requirement 3.3: manual dispatch should run ONLY selected environment');
    }

    return passed;
  }

  // Test Case 4: Manual dispatch to production should trigger only production deployment
  testManualProductionDispatch() {
    console.log('\n🧪 Test Case 4: Manual dispatch to production triggers only production deployment');
    
    const context = {
      github: {
        ref: 'refs/heads/develop', // Testing from develop branch to verify manual override
        event_name: 'workflow_dispatch',
        event: {
          inputs: {
            environment: 'production'
          }
        }
      }
    };

    const results = this.evaluateJobConditions(context);
    
    const expected = {
      build: true,
      deploy_staging: false,
      deploy_production: true
    };

    const passed = this.compareResults(results, expected);
    
    // Note: This test is expected to fail with current workflow logic
    this.testResults.push({
      name: 'Manual production dispatch',
      passed,
      expected,
      actual: results,
      note: 'This test reveals a workflow logic issue - manual dispatch should override branch conditions'
    });

    console.log(passed ? '✅ PASSED' : '❌ FAILED (Expected - reveals workflow issue)');
    if (!passed) {
      console.log('Expected:', expected);
      console.log('Actual:', results);
      console.log('⚠️  Issue: Manual production dispatch from develop branch also triggers staging deployment');
      console.log('⚠️  This violates requirement 3.4: manual dispatch should run ONLY selected environment');
    }

    return passed;
  }

  // Test Case 5: Verify job dependencies are correct
  testJobDependencies() {
    console.log('\n🧪 Test Case 5: Verify job dependencies are independent');
    
    const jobs = this.workflow.jobs;
    
    // Check that build job has no dependencies
    const buildDeps = jobs.build.needs || [];
    const buildIndependent = buildDeps.length === 0;
    
    // Check that deploy_staging only depends on build
    const stagingDeps = jobs.deploy_staging.needs;
    const stagingCorrect = stagingDeps === 'build';
    
    // Check that deploy_production only depends on build (not staging)
    const productionDeps = jobs.deploy_production.needs;
    const productionCorrect = productionDeps === 'build';
    
    const passed = buildIndependent && stagingCorrect && productionCorrect;
    
    this.testResults.push({
      name: 'Job dependencies',
      passed,
      details: {
        buildIndependent,
        stagingCorrect,
        productionCorrect,
        buildDeps,
        stagingDeps,
        productionDeps
      }
    });

    console.log(passed ? '✅ PASSED' : '❌ FAILED');
    if (!passed) {
      console.log('Build dependencies:', buildDeps);
      console.log('Staging dependencies:', stagingDeps);
      console.log('Production dependencies:', productionDeps);
    }

    return passed;
  }

  // Test Case 6: Verify build environment determination logic
  testBuildEnvironmentLogic() {
    console.log('\n🧪 Test Case 6: Verify build environment determination logic');
    
    const testCases = [
      {
        name: 'Main branch push → production config',
        context: { ref: 'refs/heads/main', event_name: 'push' },
        expected: { environment: 'production', config: 'production' }
      },
      {
        name: 'Develop branch push → development config',
        context: { ref: 'refs/heads/develop', event_name: 'push' },
        expected: { environment: 'staging', config: 'development' }
      },
      {
        name: 'Manual production dispatch → production config',
        context: { 
          ref: 'refs/heads/develop', 
          event_name: 'workflow_dispatch',
          event: { inputs: { environment: 'production' } }
        },
        expected: { environment: 'production', config: 'production' }
      },
      {
        name: 'Manual staging dispatch → development config',
        context: { 
          ref: 'refs/heads/main', 
          event_name: 'workflow_dispatch',
          event: { inputs: { environment: 'staging' } }
        },
        expected: { environment: 'staging', config: 'development' }
      }
    ];

    let allPassed = true;
    
    testCases.forEach(testCase => {
      const result = this.simulateBuildEnvironmentLogic(testCase.context);
      const passed = result.environment === testCase.expected.environment && 
                    result.config === testCase.expected.config;
      
      if (!passed) {
        console.log(`❌ ${testCase.name}`);
        console.log('  Expected:', testCase.expected);
        console.log('  Actual:', result);
        allPassed = false;
      } else {
        console.log(`✅ ${testCase.name}`);
      }
    });

    this.testResults.push({
      name: 'Build environment logic',
      passed: allPassed
    });

    return allPassed;
  }

  // Simulate the build environment determination logic from the workflow
  simulateBuildEnvironmentLogic(context) {
    if (context.event_name === 'workflow_dispatch') {
      if (context.event?.inputs?.environment === 'production') {
        return { environment: 'production', config: 'production' };
      } else {
        return { environment: 'staging', config: 'development' };
      }
    } else if (context.ref === 'refs/heads/main') {
      return { environment: 'production', config: 'production' };
    } else {
      return { environment: 'staging', config: 'development' };
    }
  }

  // Evaluate job conditions based on context
  evaluateJobConditions(context) {
    const jobs = this.workflow.jobs;
    
    const stagingCondition = jobs.deploy_staging.if;
    const productionCondition = jobs.deploy_production.if;
    
    const stagingResult = this.evaluateCondition(stagingCondition, context);
    const productionResult = this.evaluateCondition(productionCondition, context);
    
    return {
      build: true, // Build job always runs
      deploy_staging: stagingResult,
      deploy_production: productionResult
    };
  }

  // Simple condition evaluator for GitHub Actions conditions
  evaluateCondition(condition, context) {
    if (!condition) return true;
    
    // Clean up the condition string and handle multiline
    condition = condition.replace(/\s+/g, ' ').trim();
    
    // Handle OR conditions first (split by ||)
    if (condition.includes('||')) {
      const parts = condition.split('||').map(p => p.trim());
      return parts.some(part => this.evaluateSingleCondition(part, context));
    }
    
    // Handle AND conditions
    if (condition.includes('&&')) {
      const parts = condition.split('&&').map(p => p.trim());
      return parts.every(part => this.evaluateSingleCondition(part, context));
    }
    
    return this.evaluateSingleCondition(condition, context);
  }

  evaluateSingleCondition(condition, context) {
    condition = condition.trim();
    
    // Handle parenthesized AND conditions
    if (condition.startsWith('(') && condition.endsWith(')')) {
      const innerCondition = condition.slice(1, -1).trim();
      
      // Handle AND conditions within parentheses
      if (innerCondition.includes('&&')) {
        const parts = innerCondition.split('&&').map(p => p.trim());
        return parts.every(part => this.evaluateAtomicCondition(part, context));
      }
      
      return this.evaluateAtomicCondition(innerCondition, context);
    }
    
    return this.evaluateAtomicCondition(condition, context);
  }
  
  evaluateAtomicCondition(condition, context) {
    condition = condition.trim();
    
    // Handle equality checks
    if (condition.includes('==')) {
      const [left, right] = condition.split('==').map(s => s.trim());
      const leftValue = this.getContextValue(left, context);
      const rightValue = right.replace(/'/g, ''); // Remove quotes
      
      return leftValue === rightValue;
    }
    
    return false;
  }
  
  getContextValue(path, context) {
    path = path.trim();
    
    switch (path) {
      case 'github.ref':
        return context.github.ref;
      case 'github.event_name':
        return context.github.event_name;
      case 'github.event.inputs.environment':
        return context.github.event?.inputs?.environment || null;
      default:
        return null;
    }
  }

  compareResults(actual, expected) {
    return Object.keys(expected).every(key => actual[key] === expected[key]);
  }

  // Test Case 7: Test corrected workflow logic (what it should be)
  testCorrectedWorkflowLogic() {
    console.log('\n🧪 Test Case 7: Test corrected workflow logic (proposed fix)');
    
    const testCases = [
      {
        name: 'Manual staging from main branch',
        context: {
          github: {
            ref: 'refs/heads/main',
            event_name: 'workflow_dispatch',
            event: { inputs: { environment: 'staging' } }
          }
        },
        expected: { build: true, deploy_staging: true, deploy_production: false }
      },
      {
        name: 'Manual production from develop branch',
        context: {
          github: {
            ref: 'refs/heads/develop',
            event_name: 'workflow_dispatch',
            event: { inputs: { environment: 'production' } }
          }
        },
        expected: { build: true, deploy_staging: false, deploy_production: true }
      }
    ];

    let allPassed = true;
    
    testCases.forEach(testCase => {
      console.log(`  Testing: ${testCase.name}`);
      const results = this.evaluateCorrectedJobConditions(testCase.context);
      const passed = this.compareResults(results, testCase.expected);
      
      if (!passed) {
        console.log(`    ❌ FAILED`);
        console.log(`    Expected:`, testCase.expected);
        console.log(`    Actual:`, results);
        allPassed = false;
      } else {
        console.log(`    ✅ PASSED`);
      }
    });

    this.testResults.push({
      name: 'Corrected workflow logic',
      passed: allPassed,
      note: 'Tests the proposed fix for manual dispatch conditions'
    });

    console.log(allPassed ? '✅ PASSED - Corrected logic works' : '❌ FAILED - Corrected logic needs adjustment');
    return allPassed;
  }

  // Evaluate job conditions with corrected logic (manual dispatch takes precedence)
  evaluateCorrectedJobConditions(context) {
    // Corrected conditions that prioritize manual dispatch
    const correctedStagingCondition = 
      "(github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'staging') || " +
      "(github.event_name == 'push' && github.ref == 'refs/heads/develop')";
    
    const correctedProductionCondition = 
      "(github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'production') || " +
      "(github.event_name == 'push' && github.ref == 'refs/heads/main')";

    return {
      build: true,
      deploy_staging: this.evaluateCondition(correctedStagingCondition, context),
      deploy_production: this.evaluateCondition(correctedProductionCondition, context)
    };
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting GitHub Actions Workflow Trigger Tests\n');
    
    if (!this.loadWorkflow()) {
      return false;
    }

    const tests = [
      () => this.testDevelopBranchPush(),
      () => this.testMainBranchPush(),
      () => this.testManualStagingDispatch(),
      () => this.testManualProductionDispatch(),
      () => this.testJobDependencies(),
      () => this.testBuildEnvironmentLogic(),
      () => this.testCorrectedWorkflowLogic()
    ];

    let allPassed = true;
    for (const test of tests) {
      const passed = test();
      if (!passed) allPassed = false;
    }

    this.printSummary();
    return allPassed;
  }

  printSummary() {
    console.log('\n📊 Test Summary');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! Workflow trigger logic is working correctly.');
    } else {
      console.log('\n❌ Some tests failed. Please review the workflow configuration.');
      
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`\n❌ Failed: ${result.name}`);
        if (result.expected && result.actual) {
          console.log('  Expected:', result.expected);
          console.log('  Actual:', result.actual);
        }
        if (result.details) {
          console.log('  Details:', result.details);
        }
      });
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new WorkflowTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = WorkflowTester;