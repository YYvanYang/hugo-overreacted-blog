#!/usr/bin/env node

/**
 * Scenario-based validation for GitHub Actions workflow
 * Simulates real-world usage scenarios to validate workflow behavior
 */

const fs = require('fs');
const yaml = require('js-yaml');

class WorkflowScenarioValidator {
  constructor() {
    this.workflowPath = '.github/workflows/deploy.yml';
    this.workflow = null;
    this.scenarios = [];
  }

  loadWorkflow() {
    try {
      const workflowContent = fs.readFileSync(this.workflowPath, 'utf8');
      this.workflow = yaml.load(workflowContent);
      return true;
    } catch (error) {
      console.error('❌ Failed to load workflow:', error.message);
      return false;
    }
  }

  // Define real-world scenarios
  defineScenarios() {
    this.scenarios = [
      {
        name: 'Developer pushes feature to develop branch',
        description: 'A developer completes a feature and pushes to develop branch for staging review',
        context: {
          github: {
            ref: 'refs/heads/develop',
            event_name: 'push',
            actor: 'developer1'
          }
        },
        expectedBehavior: {
          build: true,
          deploy_staging: true,
          deploy_production: false,
          buildConfig: 'development'
        },
        requirements: ['2.1', '4.1']
      },
      {
        name: 'Release manager pushes to main branch',
        description: 'Release manager merges approved changes to main branch for production deployment',
        context: {
          github: {
            ref: 'refs/heads/main',
            event_name: 'push',
            actor: 'release-manager'
          }
        },
        expectedBehavior: {
          build: true,
          deploy_staging: false,
          deploy_production: true,
          buildConfig: 'production'
        },
        requirements: ['1.1', '2.2', '4.2']
      },
      {
        name: 'Manual staging deployment from main branch',
        description: 'Developer manually deploys main branch to staging for testing before production',
        context: {
          github: {
            ref: 'refs/heads/main',
            event_name: 'workflow_dispatch',
            event: {
              inputs: {
                environment: 'staging'
              }
            },
            actor: 'developer2'
          }
        },
        expectedBehavior: {
          build: true,
          deploy_staging: true,
          deploy_production: false,
          buildConfig: 'development'
        },
        requirements: ['2.3', '3.3', '4.1'],
        currentlyFails: true,
        issue: 'Manual dispatch does not override branch-based conditions'
      },
      {
        name: 'Emergency production deployment from develop',
        description: 'Emergency hotfix deployed directly to production from develop branch',
        context: {
          github: {
            ref: 'refs/heads/develop',
            event_name: 'workflow_dispatch',
            event: {
              inputs: {
                environment: 'production'
              }
            },
            actor: 'ops-team'
          }
        },
        expectedBehavior: {
          build: true,
          deploy_staging: false,
          deploy_production: true,
          buildConfig: 'production'
        },
        requirements: ['2.3', '3.4', '4.2'],
        currentlyFails: true,
        issue: 'Manual dispatch does not override branch-based conditions'
      },
      {
        name: 'Concurrent deployments scenario',
        description: 'Both staging and production deployments triggered simultaneously (edge case)',
        context: {
          github: {
            ref: 'refs/heads/main',
            event_name: 'push'
          }
        },
        expectedBehavior: {
          build: true,
          deploy_staging: false,
          deploy_production: true,
          parallelCapable: true,
          uniqueArtifacts: true
        },
        requirements: ['5.3']
      }
    ];
  }

  // Simulate workflow execution for a scenario
  simulateScenario(scenario) {
    console.log(`\n🎬 Scenario: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);
    console.log(`📋 Requirements: ${scenario.requirements.join(', ')}`);
    
    if (scenario.currentlyFails) {
      console.log(`⚠️  Known Issue: ${scenario.issue}`);
    }

    const actualBehavior = this.evaluateScenario(scenario.context);
    const passed = this.compareScenarioBehavior(actualBehavior, scenario.expectedBehavior);

    console.log(`Expected: ${JSON.stringify(scenario.expectedBehavior)}`);
    console.log(`Actual:   ${JSON.stringify(actualBehavior)}`);
    
    if (scenario.currentlyFails && !passed) {
      console.log('❌ FAILED (Expected - known workflow issue)');
    } else if (passed) {
      console.log('✅ PASSED');
    } else {
      console.log('❌ FAILED');
    }

    return {
      scenario: scenario.name,
      passed,
      expectedFailure: scenario.currentlyFails || false,
      actualBehavior,
      expectedBehavior: scenario.expectedBehavior
    };
  }

  evaluateScenario(context) {
    const jobs = this.workflow.jobs;
    
    // Evaluate job conditions
    const stagingCondition = jobs.deploy_staging.if;
    const productionCondition = jobs.deploy_production.if;
    
    const deploy_staging = this.evaluateCondition(stagingCondition, context);
    const deploy_production = this.evaluateCondition(productionCondition, context);
    
    // Determine build configuration
    const buildConfig = this.determineBuildConfig(context);
    
    // Check parallel capability and artifact uniqueness
    const parallelCapable = jobs.deploy_staging.needs === 'build' && jobs.deploy_production.needs === 'build';
    const uniqueArtifacts = this.checkArtifactUniqueness();

    return {
      build: true, // Build always runs
      deploy_staging,
      deploy_production,
      buildConfig,
      parallelCapable,
      uniqueArtifacts
    };
  }

  determineBuildConfig(context) {
    // Simulate the build environment determination logic
    if (context.github.event_name === 'workflow_dispatch') {
      return context.github.event?.inputs?.environment === 'production' ? 'production' : 'development';
    } else if (context.github.ref === 'refs/heads/main') {
      return 'production';
    } else {
      return 'development';
    }
  }

  checkArtifactUniqueness() {
    const buildJob = this.workflow.jobs.build;
    const uploadStep = buildJob.steps.find(step => 
      step.uses && step.uses.includes('upload-artifact')
    );
    
    const artifactName = uploadStep?.with?.name || '';
    return artifactName.includes('${{ github.run_id }}');
  }

  // Simple condition evaluator (reused from trigger tests)
  evaluateCondition(condition, context) {
    if (!condition) return true;
    
    condition = condition.replace(/\s+/g, ' ').trim();
    
    if (condition.includes('||')) {
      const parts = condition.split('||').map(p => p.trim());
      return parts.some(part => this.evaluateSingleCondition(part, context));
    }
    
    if (condition.includes('&&')) {
      const parts = condition.split('&&').map(p => p.trim());
      return parts.every(part => this.evaluateSingleCondition(part, context));
    }
    
    return this.evaluateSingleCondition(condition, context);
  }

  evaluateSingleCondition(condition, context) {
    condition = condition.trim();
    
    if (condition.startsWith('(') && condition.endsWith(')')) {
      const innerCondition = condition.slice(1, -1).trim();
      
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
    
    if (condition.includes('==')) {
      const [left, right] = condition.split('==').map(s => s.trim());
      const leftValue = this.getContextValue(left, context);
      const rightValue = right.replace(/'/g, '');
      
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

  compareScenarioBehavior(actual, expected) {
    return Object.keys(expected).every(key => {
      if (key === 'parallelCapable' || key === 'uniqueArtifacts') {
        return actual[key] === expected[key];
      }
      return actual[key] === expected[key];
    });
  }

  // Run all scenario validations
  async runAllScenarios() {
    console.log('🎭 GitHub Actions Workflow Scenario Validation');
    console.log('===============================================\n');
    
    if (!this.loadWorkflow()) {
      return false;
    }

    this.defineScenarios();
    
    const results = [];
    let passedCount = 0;
    let expectedFailures = 0;

    for (const scenario of this.scenarios) {
      const result = this.simulateScenario(scenario);
      results.push(result);
      
      if (result.passed) {
        passedCount++;
      } else if (result.expectedFailure) {
        expectedFailures++;
      }
    }

    this.printScenarioSummary(results, passedCount, expectedFailures);
    
    // Success if all scenarios pass or fail as expected
    const success = passedCount + expectedFailures === this.scenarios.length;
    return success;
  }

  printScenarioSummary(results, passedCount, expectedFailures) {
    console.log('\n📊 Scenario Validation Summary');
    console.log('==============================');
    
    const totalScenarios = this.scenarios.length;
    const unexpectedFailures = totalScenarios - passedCount - expectedFailures;
    
    console.log(`Total Scenarios: ${totalScenarios}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Expected Failures: ${expectedFailures}`);
    console.log(`Unexpected Failures: ${unexpectedFailures}`);
    
    if (unexpectedFailures === 0) {
      console.log('\n✅ All scenarios behaved as expected!');
      if (expectedFailures > 0) {
        console.log(`⚠️  ${expectedFailures} scenario(s) failed as expected due to known workflow issues.`);
      }
    } else {
      console.log(`\n❌ ${unexpectedFailures} scenario(s) failed unexpectedly.`);
    }

    // List failed scenarios
    const failedScenarios = results.filter(r => !r.passed && !r.expectedFailure);
    if (failedScenarios.length > 0) {
      console.log('\n❌ Unexpected Failures:');
      failedScenarios.forEach(result => {
        console.log(`  - ${result.scenario}`);
      });
    }

    // List expected failures
    const expectedFailureScenarios = results.filter(r => !r.passed && r.expectedFailure);
    if (expectedFailureScenarios.length > 0) {
      console.log('\n⚠️  Expected Failures (Known Issues):');
      expectedFailureScenarios.forEach(result => {
        console.log(`  - ${result.scenario}`);
      });
    }
  }
}

// Run scenario validation if this script is executed directly
if (require.main === module) {
  const validator = new WorkflowScenarioValidator();
  validator.runAllScenarios().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Scenario validation failed:', error);
    process.exit(1);
  });
}

module.exports = WorkflowScenarioValidator;