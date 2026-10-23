import {departments} from './departments';
export type Product={id:string;name:string;bn:string;category:string;unit:string;price:number;originalPrice:number;stock:number;image:string;popular?:boolean;active?:boolean;lowStockThreshold?:number};
const cdn='https://foodpanda.dhmedia.io/image/';
const photo=(id:string)=>cdn+'darkstores/nv-global-catalog/bd/'+id+'?height=320&dpi=1';
const pim=(id:string)=>cdn+'product-information-management/'+id+'?height=320&dpi=1';
export const categories=[
 {id:'all',name:'সব পণ্য',en:'All products',icon:'grid'},{id:'deals',name:'সেরা অফার',en:'Offers',icon:'tag'},{id:'monthly',name:'মাসের বাজার',en:'Monthly essentials',icon:'basket'},
 {id:'fresh',name:'ফল ও সবজি',en:'Fruits & vegetables',icon:'apple'},{id:'dairy',name:'দুধ, ডিম ও দুগ্ধজাত',en:'Dairy & eggs',icon:'milk'},{id:'pantry',name:'চাল, ডাল ও রান্না',en:'Cooking essentials',icon:'wheat'},
 {id:'snacks',name:'স্ন্যাকস ও নুডলস',en:'Snacks & noodles',icon:'cookie'},{id:'drinks',name:'পানীয়, চা ও কফি',en:'Drinks & coffee',icon:'coffee'},{id:'frozen',name:'আইসক্রিম ও ফ্রোজেন',en:'Ice cream',icon:'icecream'},
 {id:'cleaning',name:'ঘর ও পরিষ্কার',en:'Home & cleaning',icon:'spray'},{id:'personal',name:'ব্যক্তিগত যত্ন',en:'Personal care',icon:'heart'},
 ...departments.filter(d=>!['dairy','pantry','snacks','drinks','frozen','cleaning','personal'].includes(d.id)),
];
export const catalog:Product[]=[
 {id:'eggs',name:'Brown Eggs',bn:'বাদামি ডিম',category:'dairy',unit:'১২ পিস',price:137,originalPrice:152,stock:40,popular:true,image:photo('09d26082-55b0-4755-a9a3-3889c0bf0e46.jpg')},
 {id:'milk',name:'Farm Fresh UHT Whole Milk',bn:'ফার্ম ফ্রেশ দুধ',category:'dairy',unit:'১ লিটার',price:115,originalPrice:125,stock:40,popular:true,image:pim('67207696e335ce28b00363ae.jpg')},
 {id:'yoghurt',name:'Aarong Sour Yoghurt',bn:'আড়ং টক দই',category:'dairy',unit:'৫০০ গ্রাম',price:110,originalPrice:120,stock:30,popular:true,image:photo('7a8d04c8-af16-4558-8f59-be6376c61742.jpg')},
 {id:'salt',name:'Fresh Super Premium Salt',bn:'ফ্রেশ লবণ',category:'pantry',unit:'১ কেজি',price:37,originalPrice:42,stock:80,popular:true,image:photo('53b6459b-7dac-4174-990b-3962499ef58e.jpg')},
 {id:'atta',name:'Sunshine Brown Atta',bn:'সানশাইন লাল আটা',category:'pantry',unit:'১ কেজি',price:62,originalPrice:72,stock:40,popular:true,image:photo('f5b1c794-2574-426f-9180-3f85a3fb1cea.jpg')},
 {id:'guava',name:'Premium Guava',bn:'তাজা পেয়ারা',category:'fresh',unit:'১ কেজি (±৫০ গ্রাম)',price:145,originalPrice:166,stock:25,popular:true,image:photo('f4f18d13-2cb5-41d2-8a1b-0653e4b89dfd.png')},
 {id:'pineapple',name:'Fresh Pineapple',bn:'তাজা আনারস',category:'fresh',unit:'৩০০ গ্রাম',price:48,originalPrice:60,stock:20,image:photo('af67e84a-5bdc-4d93-b426-c9b4ef42ec49.jpg')},
 {id:'corn',name:'Sweet Corn',bn:'মিষ্টি ভুট্টা',category:'fresh',unit:'৩০০ গ্রাম',price:54,originalPrice:60,stock:25,image:photo('0ddc5adc-2cf3-42b9-8c73-20562024cfd2.jpg')},
 {id:'sugar',name:'Fresh Super Sugar',bn:'ফ্রেশ চিনি',category:'pantry',unit:'১ কেজি',price:110,originalPrice:110,stock:60,popular:true,image:photo('0a27ba75-20a0-4f0d-b30c-2a1f8328722e.jpg')},
 {id:'oil',name:'Fresh Soybean Oil',bn:'ফ্রেশ সয়াবিন তেল',category:'pantry',unit:'৫ লিটার',price:975,originalPrice:1000,stock:25,popular:true,image:pim('640db3f3d5795c467cf53c03.jpg')},
 {id:'milkpowder',name:'Marks Full Cream Milk Powder',bn:'মার্কস গুঁড়া দুধ',category:'dairy',unit:'৫০০ গ্রাম',price:480,originalPrice:480,stock:30,popular:true,image:photo('703d833e-de64-4bc3-89fa-87ccd10257de.jpg')},
 {id:'condensed',name:'Starship Condensed Milk',bn:'স্টারশিপ কনডেন্সড মিল্ক',category:'dairy',unit:'৪০০ গ্রাম',price:105,originalPrice:105,stock:30,image:photo('79fd6dc5-cefc-45f7-9243-59ef1a6933c8.jpg')},
 {id:'ramen',name:'Doodles Korean Ramen',bn:'ডুডলস কোরিয়ান রামেন',category:'snacks',unit:'৮ পিস',price:200,originalPrice:220,stock:35,popular:true,image:photo('031dd04b-5e9a-4714-90c2-e302bc863027.jpg')},
 {id:'noodles',name:'Sedaap Supreme Instant Noodles',bn:'সেডাপ ইনস্ট্যান্ট নুডলস',category:'snacks',unit:'৯০ গ্রাম',price:25,originalPrice:30,stock:50,image:pim('696cb6af1b6cea5c18e30916.jpg')},
 {id:'soup',name:'Knorr Thai Soup',bn:'নর থাই স্যুপ',category:'snacks',unit:'২৮ গ্রাম',price:47,originalPrice:55,stock:30,image:pim('6a4a4f4a61efd05972a9e704.jpg')},
 {id:'coke',name:'Coca-Cola',bn:'কোকা-কোলা',category:'drinks',unit:'১ লিটার',price:85,originalPrice:85,stock:40,popular:true,image:photo('4fc266f1-cb65-4be3-bc93-0aa401914854.jpg')},
 {id:'mojo',name:'Mojo Zero',bn:'মোজো জিরো',category:'drinks',unit:'২৫০ মিলি',price:46,originalPrice:50,stock:40,image:photo('cdbe9c47-abba-463f-8b3a-79de7e17823c.jpg')},
 {id:'coffee',name:'Tora Bika Cappuccino',bn:'টোরা বিকা ক্যাপুচিনো',category:'drinks',unit:'২৫ গ্রাম',price:68,originalPrice:75,stock:40,image:photo('b8032728-8b38-4aed-b204-ec28fb35f418.jpg')},
 {id:'horlicks',name:'Horlicks Nutrition Drink',bn:'হরলিক্স',category:'drinks',unit:'৫০০ গ্রাম',price:423,originalPrice:450,stock:20,image:photo('1c06c57e-34b0-4536-964e-e7ba2e03dfee.jpeg')},
 {id:'icecream',name:'Savoy Coffee Chocolate Cone',bn:'স্যাভয় কফি চকোলেট কোন',category:'frozen',unit:'১১০ মিলি',price:100,originalPrice:100,stock:25,popular:true,image:pim('683bf69fa0ee56e124d5231f.jpg')},
 {id:'choco-cup',name:'Savoy Chocolate Fudge',bn:'স্যাভয় চকোলেট ফাজ',category:'frozen',unit:'১২০ মিলি',price:85,originalPrice:85,stock:25,image:photo('248fdfcc-5732-4f44-b4cf-7461c5b92b77.jpg')},
 {id:'wheel',name:'Wheel Washing Powder',bn:'হুইল ওয়াশিং পাউডার',category:'cleaning',unit:'১ কেজি',price:157,originalPrice:165,stock:40,image:photo('760ac356-48ca-4b12-a1e5-2bb764ac307f.jpg')},
 {id:'vim',name:'Vim Dishwashing Bar',bn:'ভিম ডিশওয়াশিং বার',category:'cleaning',unit:'১১৫ গ্রাম',price:14,originalPrice:15,stock:50,image:photo('3ac50151-cb31-4ac0-8136-ef86527e6f6c.jpg')},
 {id:'harpic',name:'Harpic Toilet Cleaner',bn:'হারপিক টয়লেট ক্লিনার',category:'cleaning',unit:'২৫০ মিলি',price:59,originalPrice:70,stock:35,image:photo('d2d4ecd7-28b5-4fcb-857b-63a60f7e7bc8.jpg')},
 {id:'trix',name:'Trix Dishwashing Liquid',bn:'ট্রিক্স ডিশওয়াশিং লিকুইড',category:'cleaning',unit:'২৫০ মিলি',price:65,originalPrice:70,stock:35,image:photo('eda18dd5-8e3e-4426-af3e-e6f768cc3a57.jpg')},
 {id:'tissue',name:'Fresh Hand Towel',bn:'ফ্রেশ হ্যান্ড টাওয়েল',category:'cleaning',unit:'২৫০ পিস',price:90,originalPrice:100,stock:40,image:photo('8721eff0-399c-403d-ac24-c22a913135d3.jpg')},
 {id:'soap',name:'Dettol Skincare Soap',bn:'ডেটল স্কিনকেয়ার সাবান',category:'personal',unit:'৩ প্যাক · ৭০ গ্রাম',price:165,originalPrice:195,stock:40,image:photo('437dee70-12f9-45e7-9ba3-d01d156ba2ce.jpg')},
 {id:'bodywash',name:'Dettol Cool Bodywash',bn:'ডেটল কুল বডিওয়াশ',category:'personal',unit:'২৫০ মিলি',price:199,originalPrice:225,stock:20,image:photo('98da9a14-9c9f-4b4b-98aa-988f720af1b9.jpg')},
 {id:'freedom',name:'Freedom Heavy Flow Wings',bn:'ফ্রিডম স্যানিটারি ন্যাপকিন',category:'personal',unit:'১৬ পিস',price:168,originalPrice:200,stock:35,image:photo('65194cbb-4740-4412-a59d-48471ac2f30a.jpg')},
];
export const areas=['সাহেব বাজার','রানী বাজার','লক্ষ্মীপুর','উপশহর','বোয়ালিয়া','ঘোড়ামারা','হেতেম খাঁ','সপুরা','তালাইমারি','বিনোদপুর'];
export function totals(items:{price:number;quantity:number}[],coupon='') {const subtotal=items.reduce((n,p)=>n+p.price*p.quantity,0);const discount=coupon.toUpperCase()==='BAZAR10'&&subtotal>=500?Math.min(100,Math.round(subtotal*.1)):0;const delivery=subtotal===0||subtotal>=999?0:40;return{subtotal,discount,delivery,total:subtotal-discount+delivery};}
