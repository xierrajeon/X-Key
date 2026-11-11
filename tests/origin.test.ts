import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isSameOrigin} from '../src/lib/origin';
test('LAN same-origin requests work even when Next.js uses localhost internally',()=>{
 assert.equal(isSameOrigin(new Headers({origin:'http://192.168.0.29:3000',host:'192.168.0.29:3000'}),'http:'),true);
 assert.equal(isSameOrigin(new Headers({origin:'http://localhost:3000',host:'localhost:3000'}),'http:'),true);
 assert.equal(isSameOrigin(new Headers({origin:'https://xkey.example.com',host:'xkey.example.com'}),'https:'),true);
});
test('foreign, missing, malformed, wrong port and wrong scheme origins remain blocked',()=>{
 for(const origin of ['https://evil.example','null','not-a-url','http://192.168.0.29:3001','https://192.168.0.29:3000']) {
  assert.equal(isSameOrigin(new Headers({origin,host:'192.168.0.29:3000'}),'http:'),false,origin);
 }
 assert.equal(isSameOrigin(new Headers({host:'localhost:3000'}),'http:'),false);
 assert.equal(isSameOrigin(new Headers({origin:'http://localhost:3000','x-forwarded-host':'localhost:3000',host:'evil.example'}),'http:'),false);
});
