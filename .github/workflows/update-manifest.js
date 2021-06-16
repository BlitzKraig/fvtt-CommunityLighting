var fs = require('fs');
var slugs = JSON.parse(fs.readFileSync('module-slugs.json', 'utf8'));
var newValues = JSON.parse(fs.readFileSync('module-versions.json', 'utf8'));
newValues.url = slugs.repoUrl;
newValues.manifest = `${slugs.repoUrl}/releases/download/${process.argv[2]||newValues.version}/module.json`;
newValues.download = `${slugs.repoUrl}/releases/download/${process.argv[2]||newValues.version}/${slugs.downloadName}`;
var originalManifest = JSON.parse(fs.readFileSync('module.json', 'utf8'));

const output = Object.assign({}, originalManifest, newValues);

fs.writeFileSync('module.json', JSON.stringify(output, {}, 2));

var changelog = fs.readFileSync('latest-changes.md', 'utf8');
if(!process.argv[2]){
    changelog += `
------

Buy me a coffee: https://ko-fi.com/blitzkraig

Join the Discord for updates and support: https://discord.gg/T8UvC56v

Archived Manifest Link: ${newValues.manifest}`;
} else if(process.argv[2] == 'dev') {
    changelog = `# Dev Release: Unstable!

[Stable Release](${slugs.repoUrl}/releases/tag/live)`;
} else {
    changelog += `
    
Manifest Link: ${newValues.manifest}`;
}

fs.writeFileSync('latest-changes.md', changelog);