#!/usr/bin/env node

/**
 * Script tự động cập nhật version.json
 *
 * Cách dùng:
 * node update-version.js <version> <versionCode> <downloadUrl> [changelog...]
 *
 * Ví dụ:
 * node update-version.js 2.1.0 3 "https://example.com/app.apk" "Feature 1" "Feature 2"
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('❌ Thiếu tham số!');
  console.log('\nCách dùng:');
  console.log('  node update-version.js <version> <versionCode> <downloadUrl> [changelog...]');
  console.log('\nVí dụ:');
  console.log('  node update-version.js 2.1.0 3 "https://example.com/app.apk" "Tính năng 1" "Tính năng 2"');
  process.exit(1);
}

const [version, versionCodeStr, downloadUrl, ...changelogItems] = args;
const versionCode = parseInt(versionCodeStr);

if (isNaN(versionCode)) {
  console.error('❌ versionCode phải là số!');
  process.exit(1);
}

if (!downloadUrl.startsWith('http')) {
  console.error('❌ downloadUrl phải là URL hợp lệ (bắt đầu bằng http/https)!');
  process.exit(1);
}

if (changelogItems.length === 0) {
  console.error('⚠️  Cảnh báo: Không có changelog nào!');
}

const versionData = {
  version,
  versionCode,
  releaseDate: new Date().toISOString().split('T')[0],
  downloadUrl,
  changelog: changelogItems.length > 0 ? changelogItems : ['Cập nhật và cải thiện hiệu suất'],
  minVersion: '1.0.0',
  forceUpdate: false
};

const versionPath = path.join(__dirname, 'version.json');

try {
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2), 'utf8');

  console.log('✅ Đã cập nhật version.json thành công!');
  console.log('\n📦 Thông tin phiên bản:');
  console.log(`   Version: ${version}`);
  console.log(`   Version Code: ${versionCode}`);
  console.log(`   Release Date: ${versionData.releaseDate}`);
  console.log(`   Download URL: ${downloadUrl}`);
  console.log('\n📝 Changelog:');
  versionData.changelog.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item}`);
  });

  console.log('\n🚀 Tiếp theo:');
  console.log('   1. git add version.json');
  console.log(`   2. git commit -m "Update to v${version}"`);
  console.log('   3. git push');
  console.log('   4. Đợi Railway deploy xong');

} catch (error) {
  console.error('❌ Lỗi khi ghi file:', error.message);
  process.exit(1);
}
