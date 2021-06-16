var fs = require('fs');
console.log(JSON.parse(fs.readFileSync('module-versions.json', 'utf8')).version);