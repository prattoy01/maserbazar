'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {Percent,Tag,RotateCcw,CheckCircle2} from 'lucide-react';
import {defaultCategorySettings,type CategorySettings,type CategoryTile} from '@/lib/category-settings';
import type {Product} from '@/lib/catalog';
import {departments} from '@/lib/departments';
import './banners.css';
import './categories.css';
const blankCategory=():CategoryTile=>({id:'cat-'+crypto.randomUUID().slice(0,8),name:'',en:'',image:'/product-placeholder.svg',active:true});
export default function CategoryManager({adminKey,products=[],onChange,onRefresh}:{adminKey:string;products?:Product[];onChange?:(settings:CategorySettings)=>void;onRefresh?:()=>Promise<void>}){
 const [settings,setSettings]=useState<CategorySettings>(defaultCategorySettings),[revision,setRevision]=useState(0),[draft,setDraft]=useState<CategoryTile|null>(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[remove,setRemove]=useState('');
 const [offerOpen,setOfferOpen]=useState(false),[offerCategory,setOfferCategory]=useState(''),[offerMode,setOfferMode]=useState<'percent'|'flat'>('percent'),[offerValue,setOfferValue]=useState('10');
 const headers={Authorization:'Bearer '+adminKey};
 useEffect(()=>{let live=true;fetch('/api/admin/categories',{headers:{Authorization:'Bearer '+adminKey}}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);if(live){setSettings(d.settings);setRevision(d.revision);onChange?.(d.settings);}}).catch(e=>{if(live)setError(e instanceof Error?e.message:'লোড করা যায়নি।');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[adminKey]);
 async function refresh(){setBusy(true);setError('');try{const r=await fetch('/api/admin/categories',{headers}),d=await r.json();if(!r.ok)throw new Error(d.error);setSettings(d.settings);setRevision(d.revision);onChange?.(d.settings);await onRefresh?.();}catch(e){setError(e instanceof Error?e.message:'লোড করা যায়নি।');}finally{setBusy(false);}}
 async function save(next:CategorySettings){setBusy(true);setError('');setNotice('');try{const r=await fetch('/api/admin/categories',{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({settings:next,revision})}),d=await r.json();if(!r.ok)throw new Error(d.error);setSettings(d.settings);setRevision(d.revision);onChange?.(d.settings);setNotice('ক্যাটেগরির পরিবর্তন সংরক্ষিত হয়েছে। স্টোর রিফ্রেশ করুন।');return true;}catch(e){setError(e instanceof Error?e.message:'সংরক্ষণ করা যায়নি।');return false;}finally{setBusy(false);}}
 function move(index:number,step:number){const items=[...settings.items];[items[index],items[index+step]]=[items[index+step],items[index]];void save({...settings,items});}
 async function submit(e:FormEvent){
  e.preventDefault();if(!draft)return;
  const cleaned:CategoryTile={...draft,name:draft.name.trim(),en:draft.en.trim(),image:draft.image.trim()||'/product-placeholder.svg'};
  const exists=settings.items.some(c=>c.id===cleaned.id);
  const nextItems=exists?settings.items.map(c=>c.id===cleaned.id?cleaned:c):[cleaned,...settings.items];
  if(await save({...settings,items:nextItems}))setDraft(null);
 }
 async function upload(file:File){setBusy(true);setError('');try{const body=new FormData();body.set('file',file);const r=await fetch('/api/admin/upload',{method:'POST',headers,body}),d=await r.json();if(!r.ok)throw new Error(d.error);setDraft(c=>c?{...c,image:d.url}:null);}catch(e){setError(e instanceof Error?e.message:'আপলোড করা যায়নি।');}finally{setBusy(false);}}
 async function applyCategoryOffer(mode:'percent'|'flat'|'clear',targetCat?:string){
  const cat=targetCat||offerCategory||(settings.items[0]?.id??'all');
  const val=mode==='clear'?0:Number(offerValue);
  if(mode!=='clear'&&(!Number.isFinite(val)||val<1)){setError('সঠিক ছাড়ের পরিমাণ লিখুন।');return;}
  setBusy(true);setError('');setNotice('');
  try{
   const r=await fetch('/api/admin',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({type:'category_offer',category:cat,mode,value:val})}),d=await r.json();
   if(!r.ok)throw new Error(d.error);
   await onRefresh?.();
   const catName=cat==='all'?'সব ক্যাটেগরি':(settings.items.find(c=>c.id===cat)?.name||cat);
   setNotice(mode==='clear'?`“${catName}”-এর ${d.updated}টি পণ্যের অফার তুলে নেওয়া হয়েছে।`:`“${catName}”-এর ${d.updated}টি পণ্যে অফার চালু হয়েছে।`);
  }catch(e){setError(e instanceof Error?e.message:'অফার সংরক্ষণ করা যায়নি।');}finally{setBusy(false);}
 }
 function openOfferFor(catId:string){
  setOfferCategory(catId);
  setOfferOpen(true);
  setDraft(null);
  setError('');
  setNotice('');
 }
 const activeOfferCat=offerCategory||settings.items[0]?.id||'all';
 const catProducts=products.filter(p=>activeOfferCat==='all'||p.category===activeOfferCat);
 const numericOffer=Math.max(0,Number(offerValue)||0);
 const isEditingExisting=draft?settings.items.some(c=>c.id===draft.id):false;
 return <section className="category-manager"><div className="product-manager-head"><div><h2>হোমপেজ ক্যাটেগরি ও অফার</h2><p className="muted">নতুন ক্যাটেগরি যোগ করুন অথবা নির্দিষ্ট ক্যাটেগরির সব পণ্যে একসাথে অফার/ছাড় দিন।</p></div><div className="banner-actions"><button className="outline" disabled={busy||loading} onClick={refresh}>রিফ্রেশ</button><button className="outline offer-trigger-btn" disabled={busy||loading} onClick={()=>{setOfferCategory(offerCategory||settings.items[0]?.id||'all');setOfferOpen(v=>!v);setDraft(null);}}><Tag size={16}/> ক্যাটেগরি অফার</button><button className="primary" disabled={busy||loading||settings.items.length>=50} onClick={()=>{setDraft(blankCategory());setOfferOpen(false);setError('');setNotice('');}}>নতুন ক্যাটেগরি</button></div></div>{error&&<p className="field-error" role="alert">{error}</p>}{notice&&<p className="admin-success" role="status"><CheckCircle2 size={18}/>{notice}</p>}
 {offerOpen&&<div className="category-offer-panel">
  <div className="category-offer-head">
   <div>
    <h3><Tag size={19}/> ক্যাটেগরির সব পণ্যে একসাথে অফার দিন</h3>
    <p className="muted">ক্যাটেগরি বেছে নিয়ে শতাংশ (%) অথবা নির্দিষ্ট টাকা (৳) ছাড় দিলে ওই ক্যাটেগরির প্রতিটি পণ্যে অফার প্রযোজ্য হবে।</p>
   </div>
   <button type="button" className="outline" onClick={()=>setOfferOpen(false)}>বন্ধ করুন</button>
  </div>
  <div className="category-offer-controls">
   <label className="form-label">ক্যাটেগরি নির্বাচন করুন
    <select value={activeOfferCat} disabled={busy} onChange={e=>setOfferCategory(e.target.value)}>
     {settings.items.map(c=>{const count=products.filter(p=>p.category===c.id).length;return <option key={c.id} value={c.id}>{c.name} ({count}টি পণ্য)</option>;})}
     <option value="all">সব ক্যাটেগরি ({products.length}টি পণ্য)</option>
    </select>
   </label>
   <label className="form-label">ছাড়ের ধরন
    <select value={offerMode} disabled={busy} onChange={e=>{const m=e.target.value as 'percent'|'flat';setOfferMode(m);setOfferValue(m==='percent'?'10':'20');}}>
     <option value="percent">শতাংশ ছাড় (% OFF)</option>
     <option value="flat">নির্দিষ্ট টাকা ছাড় (৳ OFF)</option>
    </select>
   </label>
   <label className="form-label">{offerMode==='percent'?'ছাড়ের হার (%)':'ছাড়ের পরিমাণ (৳)'}
    <input type="number" min="1" max={offerMode==='percent'?90:50000} step="1" value={offerValue} disabled={busy} onChange={e=>setOfferValue(e.target.value)}/>
   </label>
  </div>
  <div className="category-offer-presets">
   <span>দ্রুত নির্বাচন:</span>
   {(offerMode==='percent'?[5,10,15,20,25,30]:[5,10,20,30,50,100]).map(preset=><button key={preset} type="button" className={'preset-chip '+(Number(offerValue)===preset?'active':'')} disabled={busy} onClick={()=>setOfferValue(String(preset))}>{offerMode==='percent'?`${preset}% ছাড়`:`৳${preset} ছাড়`}</button>)}
  </div>
  {catProducts.length>0?<div className="category-offer-preview">
   <div className="category-offer-preview-head">
    <strong>প্রিভিউ ({catProducts.length}টি পণ্য)</strong>
    <span>আগের মূল্যের ওপর ছাড় হিসাব করা হবে</span>
   </div>
   <div className="category-offer-preview-list">
    {catProducts.slice(0,8).map(p=>{
     const base=Math.max(p.price,p.originalPrice);
     const nextPrice=offerMode==='percent'?Math.max(1,Math.round(base*(100-numericOffer)/100)):Math.max(1,Math.round(base-numericOffer));
     const saved=Math.max(0,base-nextPrice);
     return <div key={p.id} className="category-offer-preview-item">
      <span><strong>{p.bn}</strong> <small>({p.unit})</small></span>
      <span className="offer-price-change"><del>৳{base}</del> <b>৳{nextPrice}</b> {saved>0&&<em>-৳{saved}</em>}</span>
     </div>;
    })}
    {catProducts.length>8&&<div className="category-offer-preview-more">+ আরও {catProducts.length-8}টি পণ্যে একইভাবে অফার যুক্ত হবে</div>}
   </div>
  </div>:<p className="muted" style={{margin:'12px 0'}}>এই ক্যাটেগরিতে এখনো কোনো পণ্য যোগ করা হয়নি।</p>}
  <div className="banner-actions category-offer-actions">
   <button type="button" className="primary" disabled={busy||catProducts.length===0} onClick={()=>void applyCategoryOffer(offerMode)}><Percent size={16}/> সব পণ্যে অফার চালু করুন ({catProducts.length}টি)</button>
   <button type="button" className="outline" disabled={busy||catProducts.length===0} onClick={()=>void applyCategoryOffer('clear')}><RotateCcw size={16}/> অফার তুলে নিন (নিয়মিত মূল্যে ফিরুন)</button>
  </div>
 </div>}
 {draft&&<form className="banner-editor" onSubmit={submit}><h3>{isEditingExisting?'ক্যাটেগরি সম্পাদনা':'নতুন ক্যাটেগরি যোগ'}</h3><fieldset disabled={busy}><label>বাংলা নাম<input required maxLength={80} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="যেমন: ফল ও সবজি"/></label><label>ইংরেজি নাম<input required maxLength={80} value={draft.en} onChange={e=>setDraft({...draft,en:e.target.value})} placeholder="e.g. Fruits & Vegetables"/></label><label>ছবির HTTPS লিংক (ঐচ্ছিক)<input maxLength={1000} value={draft.image==='/product-placeholder.svg'?'':draft.image} onChange={e=>setDraft({...draft,image:e.target.value||'/product-placeholder.svg'})} placeholder="https://..."/></label><label>ছবি আপলোড (সর্বোচ্চ ৩ এমবি)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);e.target.value='';}}/></label><label><input type="checkbox" checked={draft.active} onChange={e=>setDraft({...draft,active:e.target.checked})}/> হোমপেজে দেখান</label></fieldset><div className="category-tile-preview"><img src={draft.image||'/product-placeholder.svg'} alt="ক্যাটেগরির প্রিভিউ"/><strong>{draft.name||'ক্যাটেগরির নাম'}</strong></div><div className="banner-actions"><button className="primary" disabled={busy}>{isEditingExisting?'সংরক্ষণ করুন':'ক্যাটেগরি যোগ করুন'}</button><button type="button" className="outline" disabled={busy} onClick={()=>setDraft(null)}>বাতিল</button></div></form>}
 <label className="category-count">“আরও দেখুন” চাপার আগে কতটি ক্যাটেগরি দেখাবেন?<select disabled={busy||loading} value={settings.initialCount} onChange={e=>void save({...settings,initialCount:Number(e.target.value)})}>{[1,2,3,4,8,12,16,20,24,30].map(n=><option key={n} value={n}>{n}টি</option>)}</select></label><p className="muted category-manager-note">লুকানো ক্যাটেগরির পণ্য মুছে যাবে না। আবার “দেখান” চাপলে ফিরবে। যেকোনো ক্যাটেগরির “অফার দিন” বোতামে চাপলে ওই ক্যাটেগরির সব পণ্যে একসাথে ছাড় দিতে পারবেন।</p>
 {loading?<p>ক্যাটেগরি লোড হচ্ছে…</p>:<div className="category-admin-list">{settings.items.map((c,i)=>{
  const itemsInCat=products.filter(p=>p.category===c.id);
  const discountedInCat=itemsInCat.filter(p=>p.originalPrice>p.price).length;
  return <article key={c.id}><img src={c.image||'/product-placeholder.svg'} alt=""/><div><strong>{c.name}</strong><small>{c.en} · {c.active?'দেখানো':'লুকানো'} · {itemsInCat.length}টি পণ্য{discountedInCat>0?` (${discountedInCat}টিতে অফার চলছে)`:''}</small></div><div className="banner-actions"><button className="cat-offer-btn" disabled={busy} onClick={()=>openOfferFor(c.id)}><Tag size={14}/> অফার দিন</button>{discountedInCat>0&&<button disabled={busy} onClick={()=>void applyCategoryOffer('clear',c.id)}>অফার তুলুন</button>}<button disabled={busy} onClick={()=>{setDraft({...c});setOfferOpen(false);setError('');}}>সম্পাদনা</button><button disabled={busy} onClick={()=>save({...settings,items:settings.items.map(v=>v.id===c.id?{...v,active:!v.active}:v)})}>{c.active?'লুকান':'দেখান'}</button><button disabled={busy||i===0} aria-label={'Move '+c.en+' up'} onClick={()=>move(i,-1)}>↑</button><button disabled={busy||i===settings.items.length-1} aria-label={'Move '+c.en+' down'} onClick={()=>move(i,1)}>↓</button>{!departments.some(d=>d.id===c.id)&&<button disabled={busy} onClick={()=>setRemove(c.id)}>মুছুন</button>}</div>{remove===c.id&&<div className="banner-delete">এই ক্যাটেগরি মুছবেন? <button disabled={busy} onClick={async()=>{if(await save({...settings,items:settings.items.filter(v=>v.id!==c.id)})){setRemove('');if(draft?.id===c.id)setDraft(null);}}}>হ্যাঁ, মুছুন</button><button onClick={()=>setRemove('')}>বাতিল</button></div>}</article>;
 })}</div>}
 </section>;
}

