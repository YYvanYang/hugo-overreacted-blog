# Design Document

## Overview

This design addresses the critical dependency and trigger logic issues in the GitHub Actions deployment workflow. The main problem is the circular dependency where `deploy_production` depends on `deploy_staging`, preventing direct production deployments. The solution involves restructuring the job dependencies and trigger conditions to create independent deployment paths for staging and production environments.

## Architecture

### Current Problematic Flow
```
build → deploy_staging → deploy_production (BLOCKED)
```

### New Independent Flow
```
build → deploy_staging (when develop branch or manual staging)
build → deploy_production (when main branch or manual production)
```

### Trigger Logic Matrix

| Trigger | Branch/Input | Build Config | Deploy Staging | Deploy Production |
|---------|-------------|--------------|----------------|-------------------|
| Push | develop | development | ✅ | ❌ |
| Push | main | production | ❌ | ✅ |
| Manual | staging | development | ✅ | ❌ |
| Manual | production | production | ❌ | ✅ |

## Components and Interfaces

### 1. Build Job
**Purpose**: Single build job that adapts configuration based on target environment

**Inputs**:
- `github.ref`: Branch reference
- `github.event_name`: Event type (push/workflow_dispatch)
- `github.event.inputs.environment`: Manual environment selection

**Logic**:
```yaml
# Determine if this is a production build
production_build = (github.ref == 'refs/heads/main') OR 
                  (workflow_dispatch AND inputs.environment == 'production')

# Set build configuration accordingly
if production_build:
  HUGO_ENV=production npm run build:production
else:
  HUGO_ENV=development npm run build:development
```

**Outputs**:
- Build artifacts with unique naming: `hugo-build-${{ github.run_id }}`

### 2. Staging Deployment Job
**Purpose**: Deploy to staging environment independently

**Dependencies**: 
- `needs: build` (only)

**Trigger Conditions**:
```yaml
if: |
  github.ref == 'refs/heads/develop' || 
  (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'staging')
```

**Configuration**:
- Environment: staging
- URL: `${{ vars.STAGING_URL }}`
- Build type: development

### 3. Production Deployment Job
**Purpose**: Deploy to production environment independently

**Dependencies**: 
- `needs: build` (only, NOT staging)

**Trigger Conditions**:
```yaml
if: |
  github.ref == 'refs/heads/main' || 
  (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'production')
```

**Configuration**:
- Environment: production  
- URL: `${{ vars.PRODUCTION_URL }}`
- Build type: production

## Data Models

### Workflow Context Data
```yaml
github:
  ref: string                    # Branch reference
  event_name: string            # push | workflow_dispatch
  event:
    inputs:
      environment: string       # staging | production (manual only)
  run_id: string               # Unique run identifier

vars:
  STAGING_URL: string          # Staging environment URL
  PRODUCTION_URL: string       # Production environment URL

secrets:
  CLOUDFLARE_API_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
```

### Build Configuration Matrix
```yaml
environments:
  staging:
    hugo_env: "development"
    node_env: "development" 
    build_script: "build:development"
    triggers:
      - branch: "develop"
      - manual: "staging"
  
  production:
    hugo_env: "production"
    node_env: "production"
    build_script: "build:production"
    environment_vars:
      - PRODUCTION_URL: "${{ vars.PRODUCTION_URL }}"
    triggers:
      - branch: "main"
      - manual: "production"
```

## Error Handling

### 1. Build Failures
- **Scenario**: Build job fails
- **Impact**: Both staging and production deployments are skipped
- **Handling**: Fail fast with clear error messages, validate build output

### 2. Staging Deployment Failures
- **Scenario**: Staging deployment fails
- **Impact**: Production deployment continues independently (if triggered)
- **Handling**: Isolated failure, no cross-environment impact

### 3. Production Deployment Failures  
- **Scenario**: Production deployment fails
- **Impact**: Staging deployment continues independently (if triggered)
- **Handling**: Isolated failure, no cross-environment impact

### 4. Concurrent Deployments
- **Scenario**: Multiple deployments triggered simultaneously
- **Impact**: Potential artifact conflicts
- **Handling**: Unique artifact naming with `github.run_id`

### 5. Missing Environment Variables
- **Scenario**: Required vars/secrets not configured
- **Impact**: Deployment failure
- **Handling**: Early validation in deployment jobs

## Testing Strategy

### 1. Unit Testing (Workflow Logic)
- Test trigger conditions for each scenario
- Validate build configuration selection logic
- Verify job dependency structure

### 2. Integration Testing (End-to-End)
- Test develop branch push → staging deployment
- Test main branch push → production deployment  
- Test manual staging deployment
- Test manual production deployment
- Test concurrent deployment scenarios

### 3. Validation Testing
- Verify deployment independence (staging failure doesn't block production)
- Confirm correct environment URLs and configurations
- Test artifact handling and uniqueness

### 4. Regression Testing
- Ensure existing reusable-deploy.yml continues to work
- Verify Cloudflare Workers deployment functionality
- Test deployment validation scripts

## Implementation Considerations

### 1. Backward Compatibility
- Maintain existing reusable-deploy.yml interface
- Keep existing environment configurations
- Preserve artifact structure and naming

### 2. Performance Optimization
- Parallel deployment execution when both environments triggered
- Efficient artifact sharing between jobs
- Minimal workflow execution time

### 3. Security
- Maintain secret isolation between environments
- Validate environment-specific configurations
- Secure artifact handling

### 4. Monitoring and Observability
- Clear job naming for easy identification
- Comprehensive logging for troubleshooting
- Environment-specific success/failure reporting