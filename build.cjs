const esbuild = require('esbuild');
esbuild.buildSync({absWorkingDir:__dirname,tsconfigRaw:{},entryPoints:['./vendor-entry.js'],bundle:true,minify:true,outfile:'assets/vendor.js',format:'iife',target:['es2020'],legalComments:'eof'});
console.log('Built local Three.js and Lucide assets.');
