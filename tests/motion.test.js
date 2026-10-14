import test from 'node:test';import assert from 'node:assert/strict';
import {countState,noticeDuration} from '../scripts/notifications.js';
test('crédito começa no saldo existente, sobe monotonicamente e termina em 2,28s',()=>{const r={before:1000,after:2500,amount:1500};let last=1000;for(let ms=0;ms<=2400;ms+=10){const state=countState(r,ms);assert(state.total>=last&&state.total<=2500);last=state.total;}assert.equal(countState(r,2280).total,2500);});
test('débito desce até zero sem valor negativo e frame muito atrasado usa valor final',()=>{const r={before:900,after:0,amount:900};let last=900;for(let ms=0;ms<=2400;ms+=10){const state=countState(r,ms);assert(state.total<=last&&state.total>=0);last=state.total;}assert.deepEqual(countState(r,100000),{progress:1,total:0,amount:900});});
test('contagem mantém inteiros exatos até o limite de mana',()=>{const r={before:1,after:999999999999,amount:999999999998};for(let ms=0;ms<2000;ms+=13)assert(Number.isSafeInteger(countState(r,ms).total));assert.equal(countState(r,2400).total,r.after);});
test('aviso padrão tem 4s e perfil imersivo nunca passa de 4,6s',()=>{assert.equal(noticeDuration({}),4000);assert.equal(noticeDuration({profile:'tactical'}),4000);assert.equal(noticeDuration({profile:'cinematic'}),4600);});

import {counterFrames} from '../scripts/counter.js';
test('contador oferece 121 quadros inteiros contínuos de zero a 2000 sem valores fora do intervalo',()=>{const frames=counterFrames(2000);assert.equal(frames.length,121);assert.equal(new Set(frames).size,121);assert.equal(frames[0],0);assert.equal(frames.at(-1),2000);for(let i=1;i<frames.length;i++)assert(frames[i]>=frames[i-1]&&frames[i]-frames[i-1]<=17);});
test('contador preserva valores pequenos e o limite sem frações ou overflow',()=>{for(const n of [0,1,2,9,10,999999999999]){const frames=counterFrames(n);assert.equal(frames.at(-1),n);assert(frames.every(v=>Number.isSafeInteger(v)&&v>=0&&v<=n));}});
