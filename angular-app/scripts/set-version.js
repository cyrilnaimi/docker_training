const fs = require('fs');
const { gitDescribe, gitDescribeSync } = require('git-describe');
const { version } = require('../package.json');

const gitInfo = gitDescribeSync();

const versionInfo = {
  version,
  hash: gitInfo.hash,
  full: gitInfo.raw,
  dirty: gitInfo.dirty,
  date: new Date().toISOString(),
};

const content = `export const versionInfo = ${JSON.stringify(versionInfo, null, 2)};
`;

fs.writeFileSync('src/environments/version.ts', content, { encoding: 'utf8' });

console.log('Version info generated:', versionInfo);
