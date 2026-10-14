import {execFileSync} from 'node:child_process';import {readdirSync,readFileSync,existsSync} from 'node:fs';
for(const dir of ['scripts','tests','docs'])for(const file of readdirSync(dir))if(/\.(mjs|js)$/.test(file))execFileSync(process.execPath,['--check',`${dir}/${file}`]);
const m=JSON.parse(readFileSync('module.json'));for(const file of [...m.esmodules,...m.styles])if(!existsSync(file))throw Error(file);
if(m.compatibility.minimum!=='13'||m.compatibility.maximum!=='13')throw Error('Foundry version');
console.log('Sintaxe, pontos de entrada e manifesto: OK');
