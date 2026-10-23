import type {Product} from './catalog';
const illustration=(file:string)=>'https://foodpanda.dhmedia.io/image/darkstores/nv-global-catalog/bd/'+file+'?width=240';
export const departments=[
 {id:'fruits',name:'ফল',en:'Fruits',icon:'apple',image:illustration('bc3ca8d9-e383-47dc-b755-714daaa141e4.jpg')},
 {id:'vegetables',name:'সবজি',en:'Vegetables',icon:'apple',image:illustration('d0c7c74f-a95d-4a87-be19-a2e9c2b0ee64.jpg')},
 {id:'meat',name:'মাংস',en:'Meat',icon:'basket',image:illustration('1aab43d0-3de2-42a1-be44-90b0bc8a41c7.jpg')},
 {id:'dairy',name:'দুধ, ডিম ও দুগ্ধজাত',en:'Dairy, chilled & eggs',icon:'milk',image:illustration('59b63e33-4262-4ae4-a3ea-73c410f00b4d.jpg')},
 {id:'frozen',name:'ফ্রোজেন ও তৈরি খাবার',en:'Frozen & ready meals',icon:'icecream',image:illustration('38ce3ac6-5104-4306-aef8-99f85fac221c.jpg')},
 {id:'deli',name:'সসেজ ও ডেলি মাংস',en:'Deli meat',icon:'basket',image:illustration('93742f2b-57ef-419c-b339-6b54b112a8c5.jpg')},
 {id:'icecream',name:'আইসক্রিম ও মিষ্টি',en:'Ice cream & sweets',icon:'icecream',image:illustration('d945fb59-da2d-4477-8fd8-3263e446d9c7.jpg')},
 {id:'snacks',name:'স্ন্যাকস',en:'Snacks',icon:'cookie',image:illustration('f50a6a46-5e81-4346-bae3-3dd3872aa127.jpg')},
 {id:'drinks',name:'পানীয়',en:'Beverages',icon:'coffee',image:illustration('b4928967-3c97-4a14-be5f-c22d9e06d6d1.jpg')},
 {id:'chocolate',name:'চকোলেট ও ক্যান্ডি',en:'Chocolates & candy',icon:'cookie',image:illustration('8b53be42-8b87-407a-aacf-093f1db29305.jpg')},
 {id:'bakery',name:'বেকারি ও নাশতা',en:'Bakery & breakfast',icon:'wheat',image:illustration('fe60671b-663b-46b4-a63f-0c9c0b2d1ab1.jpg')},
 {id:'pantry',name:'প্রতিদিনের রান্না',en:'Daily cooking',icon:'wheat',image:illustration('0e9e1cfb-bd8a-43f0-8387-d5d4e834d7af.png')},
 {id:'spices',name:'মসলা',en:'Spice & herb',icon:'wheat',image:illustration('5a1be5f4-aa99-4c87-b21e-31116874741b.jpg')},
 {id:'baking',name:'বেকিং',en:'Baking',icon:'wheat',image:illustration('266c2e4f-845b-4cb5-814d-6c165e09383c.jpg')},
 {id:'tea',name:'চা ও কফি',en:'Coffee & tea',icon:'coffee',image:illustration('446494e6-144d-4074-8f84-1c33e8eeb5e9.jpg')},
 {id:'cleaning',name:'পরিষ্কার ও লন্ড্রি',en:'Cleaning & laundry',icon:'spray',image:illustration('0e1b097a-df3a-4e4e-88b4-d731f4efdd98.jpg')},
 {id:'personal',name:'সৌন্দর্য ও ব্যক্তিগত যত্ন',en:'Beauty & personal care',icon:'heart',image:illustration('57398b77-7b30-4995-a7fb-090b1a5bddbf.jpg')},
 {id:'baby',name:'মা ও শিশু',en:'Mother & baby',icon:'heart',image:illustration('6cf86e68-99e7-4617-8405-44bc10d4a8c2.png')},
 {id:'household',name:'ঘরের প্রয়োজনীয়',en:'Household essentials',icon:'basket',image:illustration('fd8ce003-5b78-404c-9109-498c980e37d8.jpg')},
 {id:'fish',name:'মাছ',en:'Fish',icon:'basket',image:illustration('f8e9741b-bf25-4d18-80ba-5ee42617be5e.jpg')},
];
// Legacy products retain their saved category; more specific departments also
// accept new products assigned directly through the admin product form.
export function inDepartment(p:Product,id:string){
 const name=p.name+' '+p.bn;
 if(id==='fruits')return p.category==='fruits'||(p.category==='fresh'&&!/corn|onion|potato|vegetable|ভুট্টা|আলু|পেঁয়াজ/i.test(name));
 if(id==='vegetables')return p.category==='vegetables'||(p.category==='fresh'&&/corn|onion|potato|vegetable|ভুট্টা|আলু|পেঁয়াজ/i.test(name));
 if(id==='icecream')return p.category==='icecream'||(p.category==='frozen'&&/ice cream|icecream|cone|fudge|আইসক্রিম|স্যাভয়/i.test(name));
 if(id==='frozen')return p.category==='frozen'&&!/ice cream|icecream|cone|fudge|আইসক্রিম|স্যাভয়/i.test(name);
 if(id==='tea')return p.category==='tea'||(p.category==='drinks'&&/coffee|tea|কফি|চা|cappuccino/i.test(name));
 if(id==='drinks')return p.category==='drinks'&&!/coffee|tea|কফি|চা|cappuccino/i.test(name);
 return p.category===id;
}
