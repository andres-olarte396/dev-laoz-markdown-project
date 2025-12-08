const fs = require('fs');
const path = require('path');

const targetDir = 'public/content/teach-laoz-communication/modulos';
console.log(`Checking directory: ${targetDir}`);

if (fs.existsSync(targetDir)) {
    console.log('Directory exists.');
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    console.log(`Total entries: ${entries.length}`);
    
    entries.forEach(entry => {
        console.log(` - Name: ${entry.name}, IsDirectory: ${entry.isDirectory()}`);
        if (entry.isDirectory() && entry.name.startsWith('modulo')) {
            console.log('   -> MATCHES FILTER');
        } else {
            console.log('   -> NO MATCH');
        }
    });

} else {
    console.log('Directory DOES NOT EXIST.');
}
