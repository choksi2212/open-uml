const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO = 'choksi2212/open-uml';
const VERSION = 'v1.0.0';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  console.error('Please set it with: $env:GITHUB_TOKEN="your_token"');
  process.exit(1);
}

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let changelog = '✨ Initial release of Open UML\n\nA completely offline, smooth, modern PlantUML editor with bundled rendering engine.';

if (fs.existsSync(changelogPath)) {
  const content = fs.readFileSync(changelogPath, 'utf-8');
  const match = content.match(/## \[1\.0\.0\][\s\S]*?(?=## \[|$)/);
  if (match) {
    changelog = match[0]
      .replace(/## \[1\.0\.0\] - .*?\n\n/, '')
      .trim();
  }
}

const releaseData = {
  tag_name: VERSION,
  name: `Open UML ${VERSION}`,
  body: `${changelog}\n\n## 📦 Downloads\n\n- 🪟 **Windows**: Download \`OpenUML-Setup-${VERSION}.exe\` below\n- 🍎 **macOS**: Coming soon (build in progress)\n\n## 🚀 Installation\n\n### Windows\n1. Download and run the \`.exe\` installer\n2. Follow the setup wizard\n3. Launch Open UML from the desktop shortcut`,
  draft: false,
  prerelease: false
};

const options = {
  hostname: 'api.github.com',
  path: `/repos/${REPO}/releases`,
  method: 'POST',
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'Open-UML-Release-Script',
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201) {
      const release = JSON.parse(data);
      console.log(`✅ Release created successfully!`);
      console.log(`🔗 URL: ${release.html_url}`);
      console.log(`\n📤 Now uploading Windows installer...`);
      
      // Upload Windows installer
      const exePath = path.join(__dirname, '..', 'build', `OpenUML-Setup-${VERSION}.exe`);
      if (fs.existsSync(exePath)) {
        uploadAsset(release.upload_url, exePath, `OpenUML-Setup-${VERSION}.exe`, 'application/octet-stream');
      } else {
        console.log(`⚠️  Windows installer not found at: ${exePath}`);
        console.log(`   Please build it first with: npm run electron:build`);
      }
    } else {
      console.error(`❌ Failed to create release: ${res.statusCode}`);
      console.error(data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error(`❌ Error creating release:`, error);
  process.exit(1);
});

req.write(JSON.stringify(releaseData));
req.end();

function uploadAsset(uploadUrl, filePath, fileName, contentType) {
  const fileContent = fs.readFileSync(filePath);
  const fileSize = fileContent.length;
  
  // Extract the base URL and add query params
  const url = new URL(uploadUrl.split('{')[0]);
  url.searchParams.set('name', fileName);
  
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'Open-UML-Release-Script',
      'Content-Type': contentType,
      'Content-Length': fileSize
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 201) {
        console.log(`✅ ${fileName} uploaded successfully!`);
        console.log(`\n🎉 Release is complete!`);
        console.log(`🔗 View it at: https://github.com/${REPO}/releases/tag/${VERSION}`);
      } else {
        console.error(`❌ Failed to upload ${fileName}: ${res.statusCode}`);
        console.error(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Error uploading ${fileName}:`, error);
  });

  req.write(fileContent);
  req.end();
}

