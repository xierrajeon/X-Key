import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paginate} from '../src/lib/pagination';
test('11 accounts expose the final item on page 2 without losing the filtered export list',()=>{
 const all=Array.from({length:11},(_,i)=>i+1);const first=paginate(all,1,10),second=paginate(all,2,10);
 assert.deepEqual(first.items,all.slice(0,10));assert.deepEqual(second.items,[11]);assert.equal(second.pageCount,2);assert.equal(second.from,11);assert.equal(second.to,11);assert.equal(all.length,11);
});
test('deleting the last page and shrinking filtered results clamps to a valid page',()=>{
 const remaining=paginate(Array.from({length:10},(_,i)=>i),2,10);assert.equal(remaining.page,1);assert.equal(remaining.items.length,10);
 const empty=paginate([],9,10);assert.equal(empty.page,1);assert.equal(empty.pageCount,1);assert.equal(empty.from,0);assert.equal(empty.to,0);assert.deepEqual(empty.items,[]);
});
test('page window stays valid at both ends and changing page size changes bounds',()=>{
 const all=Array.from({length:103},(_,i)=>i);
 assert.deepEqual(paginate(all,99,10).pages,[7,8,9,10,11]);assert.deepEqual(paginate(all,1,10).pages,[1,2,3,4,5]);assert.equal(paginate(all,2,50).to,100);assert.throws(()=>paginate(all,1,0));
});
