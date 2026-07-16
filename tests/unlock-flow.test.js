const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const jsQR=require('../assets/vendor/jsQR.js');
const qrcode=require('../assets/vendor/qrcode-generator.js');

function element(){return {innerHTML:'',textContent:'',value:'',hidden:false,classList:{add(){},remove(){},toggle(){}},focus(){}}}
const modalElement=element(),toastElement=element(),viewElement=element(),avatarElement=element(),adminElement=element();
const storage=new Map();
const context={
 console,
 URL,
 Date,
 Math,
 setTimeout,
 clearTimeout,
 requestAnimationFrame:()=>1,
 cancelAnimationFrame(){},
 location:{href:'https://thepack.test/',origin:'https://thepack.test',pathname:'/'},
 history:{replaceState(){}},
 localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
 navigator:{},
 scrollTo(){},
 document:{
  body:{classList:{toggle(){}}},
  head:{appendChild(){}},
  querySelector(selector){return {'#modal':modalElement,'#toast':toastElement,'#view':viewElement,'#avatarBtn':avatarElement,'#adminBtn':adminElement}[selector]||null},
  querySelectorAll(){return []},
  createElement(){return element()}
 }
};
context.globalThis=context;
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('app.js','utf8'),context,{filename:'app.js'});

function run(code){return vm.runInContext(code,context)}
function seed(method,code='PACK-TEST',id='reward-test'){
 run(`data.stickers=[{id:${JSON.stringify(id)},name:'Test Reward',section:'beer',image:'test.png',unlockMethod:${JSON.stringify(method)},unlockCode:${JSON.stringify(code)},enabled:true,visibility:'active',unlockCount:0}];data.unlockedStickerIds=[];data.userStickerPlacements={};`);
}

run('openUnlockSticker()');
assert.match(modalElement.innerHTML,/Unlock a Sticker/);
assert.match(modalElement.innerHTML,/Scan QR Code/);
assert.match(modalElement.innerHTML,/Enter Staff Code/);

run('openStaffCodeEntry()');
assert.match(modalElement.innerHTML,/Back to unlock methods/);
assert.match(modalElement.innerHTML,/Sticker code/);
run('openUnlockSticker()');
assert.match(modalElement.innerHTML,/Choose how you want to unlock/);

run('openQrScanner()');
assert.match(modalElement.innerHTML,/Scan QR Code/);
assert.match(modalElement.innerHTML,/Cancel/);

assert.equal(run(`parseQrPayload('not a URL').status`),'invalid');
assert.equal(run(`parseQrPayload('https://thepack.test/?reward=PACK-TEST&expires=1').status`),'expired');

const qrPayload='https://thepack.test/?reward=PACK-TEST&rewardId=reward-test';
const qr=qrcode(0,'M');qr.addData(qrPayload);qr.make();
const modules=qr.getModuleCount(),margin=4,scale=6,size=(modules+margin*2)*scale,pixels=new Uint8ClampedArray(size*size*4);pixels.fill(255);
for(let row=0;row<modules;row++)for(let column=0;column<modules;column++)if(qr.isDark(row,column))for(let y=0;y<scale;y++)for(let x=0;x<scale;x++){const offset=(((row+margin)*scale+y)*size+(column+margin)*scale+x)*4;pixels[offset]=pixels[offset+1]=pixels[offset+2]=0}
const decoded=jsQR(pixels,size,size,{inversionAttempts:'attemptBoth'});
assert.equal(decoded?.data,qrPayload);
assert.equal(run(`parseQrPayload(${JSON.stringify(decoded.data)}).status`),'valid');

seed('qr_code');
assert.equal(run(`redeemRewardToken('PACK-TEST',{source:'qr_code',expectedRewardId:'reward-test'})`),'unlocked');
assert.equal(run(`JSON.stringify(data.unlockedStickerIds)`),'["reward-test"]');
assert.equal(run(`redeemRewardToken('PACK-TEST',{source:'qr_code',expectedRewardId:'reward-test'})`),'already_collected');

seed('staff_code','STAFF-123');
assert.equal(run(`redeemRewardToken('STAFF-123',{source:'staff_code'})`),'unlocked');
assert.equal(run(`redeemRewardToken('WRONG',{source:'staff_code'})`),'invalid');
assert.equal(run(`redeemRewardToken('STAFF-123',{source:'qr_code'})`),'invalid');

run(`data.stickers=[{id:'legacy',name:'Legacy',section:'beer',image:'test.png',unlockCode:'OLD-CODE'}];data.unlockedStickerIds=[];migrateRewardData()`);
assert.equal(run(`data.stickers[0].unlockMethod`),'staff_code');

console.log('Unlock flow tests passed (method chooser, QR/staff routing, invalid/expired tokens, duplicate prevention, and legacy defaults).');
