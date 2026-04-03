const https = require('https');
const fs = require('fs');
const options = {
  hostname: 'upload.wikimedia.org',
  path: '/wikipedia/commons/e/ea/Sejong_University_Emblem.png',
  headers: { 'User-Agent': 'Mozilla/5.0' }
};
https.get(options, (res) => {
  if (res.statusCode !== 200) { console.error('Status:', res.statusCode); return; }
  const file = fs.createWriteStream('./public/sejong_logo.png');
  res.pipe(file);
  file.on('finish', () => { file.close(); console.log('Downloaded'); });
});
