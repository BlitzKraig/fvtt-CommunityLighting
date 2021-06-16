var fs = require('fs');
console.log(JSON.parse(fs.readFileSync('module-slugs.json', 'utf8')).downloadFiles);