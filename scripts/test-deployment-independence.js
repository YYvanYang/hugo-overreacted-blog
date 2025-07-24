#!/usr/bin/env node

/**
 * Test script to verify deployment independence
 * Tests that staging and production deployments can run independently
 * without cross-dependencies as per requirements 5.1, 5.2, 5.3
 */

const fs = require('fs');
const yaml = require('js-yaml');

class DeploymentIndependenceTest {
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

  // Test that staging and production jobs only depend on build, not each other
  testJobDependencyIndependence() {
    console.log('\n🧪 Testing Job Dependency Independence');
    
    const jobs = this.workflow.jobs;
    const buildJob = jobs.build;
    const stagingJob = jobs.deploy_staging;
    const productionJob = jobs.deploy_production;

    // Check build job has no dependencies
    const buildDeps = buildJob.needs || [];
    const buildIndependent = Array.isArray(buildDeps) ? buildDeps.length === 0 : !buildDeps;

    // Check staging only depends on build
    const stagingDeps = stagingJob.needs;
    const stagingCorrect = stagingDeps === 'build';

    // Check production only depends on build (not staging)
    const productionDeps = productionJob.needs;
    const productionCorrect = productionDeps === 'build';

    // Verify no circular dependencies
    const noCircularDeps = stagingCorrect && productionCorrect && buildIndependent;

    const results = {
      buildIndependent,
      stagingCorrect,
      productionCorrect,
      noCircularDeps
    };

    const passed = Object.values(results).every(r => r);

    this.testResults.push({
      name: 'Job Dependency Independence',
      passed,
      details: results
    });

    console.log(passed ? '✅ PASSED' : '❌ FAILED');
    if (!passed) {
      console.log('  Build dependencies:', buildDeps);
      console.log('  Staging dependencies:', stagingDeps);
      console.log('  Production dependencies:', productionDeps);
    }

    return passed;
  }

  // Test that deployments can run in parallel
  testParallelDeploymentCapability() {
    console.log('\n🧪 Testing Parallel Deployment Capability');
    
    const jobs = this.workflow.jobs;
    
    // Both staging and production should depend only on build
    // This allows them to run in parallel when both are triggered
    const stagingDeps = jobs.deploy_staging.needs;
    const productionDeps = jobs.deploy_production.needs;
    
    const canRunInParallel = stagingDeps === 'build' && productionDeps === 'build';
    
    this.testResults.push({
      name: 'Parallel Deployment Capability',
      passed: canRunInParallel,
      details: {
        stagingDeps,
        productionDeps,
        explanation: 'Both jobs depend only on build, allowing parallel execution'
      }
    });

    console.log(canRunInParallel ? '✅ PASSED' : '❌ FAILED');
    if (!canRunInParallel) {
      console.log('  Staging dependencies:', stagingDeps);
      console.log('  Production dependencies:', productionDeps);
      console.log('  ⚠️  Jobs cannot run in parallel due to sequential dependencies');
    }

    return canRunInParallel;
  }

  // Test artifact naming for concurrent deployments
  testArtifactUniqueness() {
    console.log('\n🧪 Testing Artifact Uniqueness for Concurrent Deployments');
    
    const jobs = this.workflow.jobs;
    const buildJob = jobs.build;
    const stagingJob = jobs.deploy_staging;
    const productionJob = jobs.deploy_production;

    // Check build job uses unique artifact naming
    const uploadStep = buildJob.steps.find(step => 
      step.uses && step.uses.includes('upload-artifact')
    );
    
    const artifactName = uploadStep?.with?.name || '';
    const usesRunId = artifactName.includes('${{ github.run_id }}');

    // Check deployment jobs use the same unique artifact name
    const stagingArtifact = stagingJob.with?.artifact_name || '';
    const productionArtifact = productionJob.with?.artifact_name || '';
    
    const stagingUsesRunId = stagingArtifact.includes('${{ github.run_id }}');
    const productionUsesRunId = productionArtifact.includes('${{ github.run_id }}');
    
    const artifactNamesMatch = stagingArtifact === productionArtifact;

    const results = {
      buildUsesRunId: usesRunId,
      stagingUsesRunId,
      productionUsesRunId,
      artifactNamesMatch,
      buildArtifactName: artifactName,
      stagingArtifactName: stagingArtifact,
      productionArtifactName: productionArtifact
    };

    const passed = usesRunId && stagingUsesRunId && productionUsesRunId && artifactNamesMatch;

    this.testResults.push({
      name: 'Artifact Uniqueness',
      passed,
      details: results
    });

    console.log(passed ? '✅ PASSED' : '❌ FAILED');
    if (!passed) {
      console.log('  Build artifact name:', artifactName);
      console.log('  Staging artifact name:', stagingArtifact);
      console.log('  Production artifact name:', productionArtifact);
    }

    return passed;
  }

  // Test environment isolation
  testEnvironmentIsolation() {
    console.log('\n🧪 Testing Environment Isolation');
    
    const jobs = this.workflow.jobs;
    const stagingJob = jobs.deploy_staging;
    const productionJob = jobs.deploy_production;

    // Check that staging and production use different environment names
    const stagingEnv = stagingJob.with?.environment_name;
    const productionEnv = productionJob.with?.environment_name;
    
    const differentEnvironments = stagingEnv !== productionEnv;
    const stagingCorrect = stagingEnv === 'staging';
    const productionCorrect = productionEnv === 'production';

    // Check that they use different environment URLs
    const stagingUrl = stagingJob.with?.environment_url;
    const productionUrl = productionJob.with?.environment_url;
    
    const differentUrls = stagingUrl !== productionUrl;
    const stagingUrlCorrect = stagingUrl && stagingUrl.includes('STAGING_URL');
    const productionUrlCorrect = productionUrl && productionUrl.includes('PRODUCTION_URL');

    const results = {
      differentEnvironments,
      stagingCorrect,
      productionCorrect,
      differentUrls,
      stagingUrlCorrect,
      productionUrlCorrect,
      stagingEnv,
      productionEnv,
      stagingUrl,
      productionUrl
    };

    const passed = differentEnvironments && stagingCorrect && productionCorrect && 
                   differentUrls && stagingUrlCorrect && productionUrlCorrect;

    this.testResults.push({
      name: 'Environment Isolation',
      passed,
      details: results
    });

    console.log(passed ? '✅ PASSED' : '❌ FAILED');
    if (!passed) {
      console.log('  Staging environment:', stagingEnv);
      console.log('  Production environment:', productionEnv);
      console.log('  Staging URL:', stagingUrl);
      console.log('  Production URL:', productionUrl);
    }

    return passed;
  }

  // Run all independence tests
  async runAllTests() {
    console.log('🚀 Starting Deployment Independence Tests\n');
    
    if (!this.loadWorkflow()) {
      return false;
    }

    const tests = [
      () => this.testJobDependencyIndependence(),
      () => this.testParallelDeploymentCapability(),
      () => this.testArtifactUniqueness(),
      () => this.testEnvironmentIsolation()
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
    console.log('\n📊 Deployment Independence Test Summary');
    console.log('=========================================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    
    if (passed === total) {
      console.log('\n🎉 All independence tests passed! Deployments are properly isolated.');
    } else {
      console.log('\n❌ Some independence tests failed. Review deployment configuration.');
      
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`\n❌ Failed: ${result.name}`);
        if (result.details) {
          console.log('  Details:', JSON.stringify(result.details, null, 2));
        }
      });
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new DeploymentIndependenceTest();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DeploymentIndependenceTest;