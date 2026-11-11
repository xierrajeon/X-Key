import {test} from 'node:test';
import assert from 'node:assert/strict';
import {copyText} from '../src/lib/clipboard';
test('HTTPS uses Clipboard API; HTTP copies using a temporary selected field and cleans up',async()=>{
 const original = ['window','navigator','document','HTMLElement'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)] as const);
 let written='',removed=false,focused=false,selected=false,command='';
 class Element {focus(){focused=true;}}
 const field={value:'',readOnly:false,style:{},setAttribute(){},focus(){},select(){selected=true;},setSelectionRange(){},remove(){removed=true;}};
 const define=(key:string,value:unknown)=>Object.defineProperty(globalThis,key,{value,configurable:true});
 try {
  define('HTMLElement',Element);
  define('window',{isSecureContext:true,getSelection:()=>null});
  define('navigator',{clipboard:{writeText:async(value:string)=>{written=value;}}});
  define('document',{activeElement:new Element(),createElement:()=>field,body:{appendChild(){}},execCommand:(name:string)=>{command=name;return true;}});
  await copyText('https-value');assert.equal(written,'https-value');assert.equal(selected,false);
  define('window',{isSecureContext:false,getSelection:()=>null});
  define('navigator',{});
  await copyText('LAN-value');assert.equal(field.value,'LAN-value');assert.equal(command,'copy');assert.equal(selected,true);assert.equal(removed,true);assert.equal(focused,true);
  removed=false;
  define('document',{activeElement:null,createElement:()=>field,body:{appendChild(){}},execCommand:()=>false});
  await assert.rejects(copyText('blocked-value'));assert.equal(removed,true);
 }finally{for(const[key,descriptor]of original){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}}
});
