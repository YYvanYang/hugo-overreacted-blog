# Requirements Document

## Introduction

The current GitHub Actions deployment workflow has critical dependency and trigger logic issues that prevent proper deployment flows. The main problem is that `deploy_production` has `needs: deploy_staging`, creating a circular dependency where production deployments are blocked by staging requirements. Additionally, the trigger conditions don't properly handle different deployment scenarios, causing the workflow to skip deployments or run unnecessary jobs.

## Requirements

### Requirement 1

**User Story:** As a developer, I want production deployments to be independent of staging deployments, so that main branch pushes and manual production deployments work correctly.

#### Acceptance Criteria

1. WHEN a push is made to the main branch THEN the system SHALL trigger production deployment without requiring staging deployment
2. WHEN a manual workflow dispatch selects production environment THEN the system SHALL deploy directly to production without staging dependency
3. WHEN production deployment is triggered THEN the system SHALL only depend on the build job, not staging deployment

### Requirement 2

**User Story:** As a developer, I want staging deployments to run only when appropriate, so that staging resources aren't wasted on main branch pushes.

#### Acceptance Criteria

1. WHEN a push is made to the develop branch THEN the system SHALL trigger only staging deployment
2. WHEN a push is made to the main branch THEN the system SHALL not trigger staging deployment
3. WHEN manual workflow dispatch selects staging environment THEN the system SHALL deploy only to staging

### Requirement 3

**User Story:** As a developer, I want the workflow trigger conditions to be mutually exclusive, so that each push or manual trigger runs only the intended deployment jobs.

#### Acceptance Criteria

1. WHEN develop branch is pushed THEN the system SHALL run build and deploy_staging jobs only
2. WHEN main branch is pushed THEN the system SHALL run build and deploy_production jobs only
3. WHEN manual dispatch selects staging THEN the system SHALL run build and deploy_staging jobs only
4. WHEN manual dispatch selects production THEN the system SHALL run build and deploy_production jobs only

### Requirement 4

**User Story:** As a developer, I want the build job to use correct environment configuration based on the target deployment, so that staging and production builds have appropriate settings.

#### Acceptance Criteria

1. WHEN building for staging deployment THEN the system SHALL use development build configuration
2. WHEN building for production deployment THEN the system SHALL use production build configuration with PRODUCTION_URL
3. WHEN determining build type THEN the system SHALL check both branch and manual dispatch input to select correct configuration

### Requirement 5

**User Story:** As a developer, I want clear separation between staging and production deployment paths, so that each environment can be deployed independently without cross-dependencies.

#### Acceptance Criteria

1. WHEN staging deployment fails THEN the system SHALL not affect production deployment capability
2. WHEN production deployment fails THEN the system SHALL not affect staging deployment capability
3. WHEN both deployments are needed THEN the system SHALL run them in parallel, not sequentially