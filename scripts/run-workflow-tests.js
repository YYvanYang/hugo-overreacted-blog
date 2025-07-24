#!/usr/bin/env node

/**
 * Comprehensive test runner for GitHub Actions workflow changes
 * Runs all workflow-related tests and generates a detailed report
 */

const WorkflowTester = require('./test-workflow-triggers.js');
const DeploymentIndependenceTest = require('./test-deployment-independence.js');
const WorkflowScenarioValidator = require('./validate-workflow-scenarios.js');
const fs = require('fs');

class ComprehensiveWorkflowTestRunner {
  constructor() {
    this.allResults = [];
    this.startTime = new Date();
  }

  async runAllTests() {
    console.log('🚀 Comprehensive GitHub Actions Workflow Test Suite');
    console.log('===================================================\n');

    // Run trigger logic tests
    console.log('📋 Phase 1: Testing Workflow Trigger Logic');
    console.log('------------------------------------------');
    const triggerTester = new WorkflowTester();
    const triggerResults = await triggerTester.runAllTests();
    this.allResults.push({
      phase: 'Trigger Logic',
      passed: triggerResults,
      results: triggerTester.testResults
    });

    console.log('\n' + '='.repeat(60) + '\n');

    // Run deployment independence tests
    console.log('📋 Phase 2: Testing Deployment Independence');
    console.log('------------------------------------------');
    const independenceTester = new DeploymentIndependenceTest();
    const independenceResults = await independenceTester.runAllTests();
    this.allResults.push({
      phase: 'Deployment Independence',
      passed: independenceResults,
      results: independenceTester.testResults
    });

    console.log('\n' + '='.repeat(60) + '\n');

    // Run scenario validation tests
    console.log('📋 Phase 3: Testing Real-World Scenarios');
    console.log('----------------------------------------');
    const scenarioValidator = new WorkflowScenarioValidator();
    const scenarioResults = await scenarioValidator.runAllScenarios();
    this.allResults.push({
      phase: 'Scenario Validation',
      passed: scenarioResults,
      results: [] // Scenario validator doesn't expose individual test results in same format
    });

    console.log('\n' + '='.repeat(60) + '\n');

    // Generate comprehensive report
    this.generateComprehensiveReport();
    
    const overallSuccess = triggerResults && independenceResults && scenarioResults;
    return overallSuccess;
  }

  generateComprehensiveReport() {
    const endTime = new Date();
    const duration = endTime - this.startTime;

    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('============================\n');

    // Overall statistics
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let criticalIssues = [];

    this.allResults.forEach(phase => {
      const phaseTests = phase.results.length;
      const phasePassed = phase.results.filter(r => r.passed).length;
      const phaseFailed = phaseTests - phasePassed;

      totalTests += phaseTests;
      totalPassed += phasePassed;
      totalFailed += phaseFailed;

      console.log(`${phase.phase}:`);
      console.log(`  Tests: ${phaseTests} | Passed: ${phasePassed} | Failed: ${phaseFailed}`);
      
      // Identify critical issues
      phase.results.filter(r => !r.passed).forEach(result => {
        if (result.name.includes('Manual') && result.note) {
          criticalIssues.push({
            phase: phase.phase,
            issue: result.name,
            description: result.note
          });
        }
      });
    });

    console.log(`\nOVERALL SUMMARY:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${totalPassed}`);
    console.log(`  Failed: ${totalFailed}`);
    console.log(`  Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    console.log(`  Duration: ${duration}ms`);

    // Report critical issues
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES IDENTIFIED:');
      console.log('==============================');
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.issue}`);
        console.log(`   Phase: ${issue.phase}`);
        console.log(`   Issue: ${issue.description}`);
        console.log('');
      });

      console.log('🔧 RECOMMENDED ACTIONS:');
      console.log('=======================');
      console.log('1. Update workflow conditions to prioritize manual dispatch over branch conditions');
      console.log('2. Modify staging condition to: (github.event_name == \'workflow_dispatch\' && github.event.inputs.environment == \'staging\') || (github.event_name == \'push\' && github.ref == \'refs/heads/develop\')');
      console.log('3. Modify production condition to: (github.event_name == \'workflow_dispatch\' && github.event.inputs.environment == \'production\') || (github.event_name == \'push\' && github.ref == \'refs/heads/main\')');
      console.log('4. Test the updated conditions with the corrected logic validator');
    }

    // Generate test report file
    this.generateTestReportFile();

    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Workflow is ready for deployment.');
    } else {
      console.log(`\n⚠️  ${totalFailed} test(s) failed. Please address the issues before deployment.`);
    }
  }

  generateTestReportFile() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.allResults.reduce((sum, phase) => sum + phase.results.length, 0),
        totalPassed: this.allResults.reduce((sum, phase) => sum + phase.results.filter(r => r.passed).length, 0),
        phases: this.allResults.map(phase => ({
          name: phase.phase,
          passed: phase.passed,
          tests: phase.results.length,
          passedTests: phase.results.filter(r => r.passed).length
        }))
      },
      detailedResults: this.allResults,
      recommendations: [
        'Update workflow conditions to prioritize manual dispatch',
        'Test corrected logic with provided validator',
        'Verify deployment independence is maintained'
      ]
    };

    fs.writeFileSync('workflow-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed test report saved to: workflow-test-report.json');
  }
}

// Run comprehensive tests if this script is executed directly
if (require.main === module) {
  const runner = new ComprehensiveWorkflowTestRunner();
  runner.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveWorkflowTestRunner;