#!/usr/bin/env node

/**
 * This script analyzes your codebase for potential TypeScript type mismatches
 * between nullable and non-nullable fields, particularly with Prisma models.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BASE_DIR = path.resolve(__dirname, '..');
const PRISMA_SCHEMA_PATH = path.join(BASE_DIR, 'prisma', 'schema.prisma');
const TSC_BIN = path.join(BASE_DIR, 'node_modules', '.bin', 'tsc');

// Colors for console output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
};

function logHeader(text) {
  console.log(`\n${COLORS.BLUE}=== ${text} ===${COLORS.RESET}\n`);
}

function logWarning(text) {
  console.log(`${COLORS.YELLOW}⚠️  WARNING: ${text}${COLORS.RESET}`);
}

function logError(text) {
  console.log(`${COLORS.RED}❌ ERROR: ${text}${COLORS.RESET}`);
}

function logSuccess(text) {
  console.log(`${COLORS.GREEN}✅ ${text}${COLORS.RESET}`);
}

// Extract Prisma schema information
function extractPrismaModels() {
  try {
    const schemaContent = fs.readFileSync(PRISMA_SCHEMA_PATH, 'utf8');
    const models = {};
    
    // Extract model definitions
    const modelRegex = /model\s+(\w+)\s+{([^}]*)}/gs;
    let modelMatch;
    
    while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
      const modelName = modelMatch[1];
      const modelBody = modelMatch[2];
      
      // Extract field definitions
      const fields = {};
      const fieldRegex = /\s*(\w+)\s+(\w+(?:\?)?)\s*(?:@[^(\n]*(?:\([^)]*\))?)?(?:\s*\/\/\s*(.*))?/g;
      let fieldMatch;
      
      while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        
        fields[fieldName] = {
          type: fieldType,
          isNullable: fieldType.endsWith('?'),
          isDateTime: fieldType.startsWith('DateTime'),
        };
      }
      
      models[modelName] = { fields };
    }
    
    return models;
  } catch (error) {
    logError(`Failed to parse Prisma schema: ${error.message}`);
    return {};
  }
}

// Find potentially problematic assignments
function findPotentialTypeIssues(models) {
  const issues = [];
  
  // For each model with DateTime fields
  Object.entries(models).forEach(([modelName, model]) => {
    Object.entries(model.fields).forEach(([fieldName, field]) => {
      if (field.isDateTime && !field.isNullable) {
        // This is a non-nullable DateTime field that might cause issues
        try {
          // Search for assignments of null or undefined to this field
          const grepCommand = `grep -r "${fieldName}:\\s*\\(null\\|undefined\\)" ${BASE_DIR} --include="*.ts" --include="*.tsx"`;
          const result = execSync(grepCommand, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
          
          if (result.trim()) {
            result.split('\n').filter(Boolean).forEach(line => {
              issues.push({
                model: modelName,
                field: fieldName,
                fieldType: field.type,
                location: line.split(':')[0],
                line: line.trim(),
                type: 'nullAssignment'
              });
            });
          }
        } catch (error) {
          // grep returns non-zero exit code when no matches are found - this is expected
          if (error.status !== 1) {
            logError(`Error running grep: ${error.message}`);
          }
        }
      }
    });
  });
  
  return issues;
}

// Run TypeScript compiler in noEmit mode to find errors
function findTscErrors() {
  try {
    logHeader('Running TypeScript compiler to find errors');
    
    // Run tsc in noEmit mode and capture output
    execSync(`${TSC_BIN} --noEmit`, { stdio: 'inherit' });
    
    logSuccess('No TypeScript errors found!');
    return [];
  } catch (error) {
    // tsc will exit with non-zero status if there are errors
    console.log(error.stdout?.toString() || '');
    
    // Parse the errors
    const errorLines = (error.stdout?.toString() || '').split('\n').filter(Boolean);
    
    // Extract DateTime related errors
    const dateTimeErrors = errorLines
      .filter(line => line.includes('Date') && line.includes('null'))
      .map(line => ({ line, type: 'typeError' }));
    
    return dateTimeErrors;
  }
}

// Main function
function main() {
  logHeader('Analyzing project for potential TypeScript errors');
  
  // Extract Prisma models
  const models = extractPrismaModels();
  logSuccess(`Found ${Object.keys(models).length} Prisma models`);
  
  // Find potential issues
  const issues = findPotentialTypeIssues(models);
  
  if (issues.length > 0) {
    logHeader('Potential type issues found');
    
    issues.forEach(issue => {
      logWarning(`Model: ${issue.model}, Field: ${issue.field} (${issue.fieldType})`);
      console.log(`  Location: ${issue.location}`);
      console.log(`  Code: ${issue.line}`);
      console.log();
    });
    
    console.log(`Found ${issues.length} potential issues that might cause type errors during build.`);
    console.log('These are non-nullable fields being assigned null or undefined values.');
  } else {
    logSuccess('No potential Prisma model type issues found');
  }
  
  // Run TypeScript to find errors
  const tscErrors = findTscErrors();
  
  if (tscErrors.length > 0) {
    logHeader('TypeScript errors related to DateTime and null');
    tscErrors.forEach(error => {
      console.log(error.line);
    });
  }
  
  // Summary
  logHeader('Summary');
  if (issues.length === 0 && tscErrors.length === 0) {
    logSuccess('No potential type issues found! Your project should build without type errors.');
  } else {
    logWarning(`Found ${issues.length} potential Prisma model issues and ${tscErrors.length} TypeScript errors.`);
    console.log('Review and fix these issues to ensure smooth builds.');
  }
}

// Run the script
main();
