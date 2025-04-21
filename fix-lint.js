const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Function to run lint fix
function runLintFix() {
  return new Promise((resolve, reject) => {
    console.log('Running ESLint fix...');
    exec('npm run lint:fix', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log(`Stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Run the fix
runLintFix()
  .then(() => {
    console.log('Lint fixes applied successfully');
  })
  .catch((error) => {
    console.error('Failed to run lint fix:', error);
    process.exit(1);
  });
