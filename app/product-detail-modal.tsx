'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Heart,Minus,Plus,ShoppingBag,X} from 'lucide-react';
import type {Product} from '@/lib/catalog';

type Props={
 product:Product;
 products:Product[];
 categoryName:string;
 lang:'bn'|'en';
 cart:Record<string,number>;
 wishlist:string[];
 wishBusy:string;
 saving:boolean;
 loading:boolean;
 error:string;
 onClose:()=>void;
 onSelect:(p:Product)=>void;
 onAdd:(p:Product)=>void;
 onSetQuantity:(p:Product,quantity:number)=>void;
 onFavorite:(p:Product)=>void;
};

const bnNum=(n:number)=>new Intl.NumberFormat('bn-BD').format(n);

function getCategoryDescription(p:Product,categoryName:string,lang:'bn'|'en'):string{
 if(lang==='en'){
  switch(p.category){
   case 'fresh':
   case 'fruits':
   case 'vegetables':
    return `Sourced fresh from trusted local farms and growers, ${p.name} (${p.unit}) is handpicked for quality, natural taste, and everyday nutrition. Rich in essential vitamins, minerals, and dietary fiber. Can be enjoyed fresh or used in your daily home recipes. Store in a cool, dry place or refrigerate to maintain peak freshness.`;
   case 'dairy':
   case 'bakery':
    return `${p.name} (${p.unit}) is hygienically packed to preserve farm-fresh taste and wholesome nutrition. A reliable source of protein, calcium, and essential nutrients for your family’s daily breakfast and cooking needs. Keep refrigerated and consume before the expiry date printed on the pack.`;
   case 'pantry':
   case 'spices':
    return `Prepared and packed under strict quality standards, ${p.name} (${p.unit}) is an essential staple for everyday Bengali home cooking. Carefully cleaned and processed to retain natural aroma, purity, and consistent cooking results. Store in an airtight container away from direct sunlight and moisture.`;
   case 'snacks':
   case 'drinks':
   case 'frozen':
    return `Enjoy the refreshing taste and convenient pack size of ${p.name} (${p.unit}). Ideal for quick family snacks, tea-time gatherings, or everyday refreshment. Check the packaging for detailed ingredients, nutritional values, and storage instructions.`;
   default:
    return `${p.name} (${p.unit}) from the ${categoryName||'everyday essentials'} department is selected for dependable household quality and value. Follow the usage and safety guidelines printed on the product packaging for best results.`;
  }
 }
 switch(p.category){
  case 'fresh':
  case 'fruits':
  case 'vegetables':
   return `নিয়ন্ত্রিত ও বিশ্বস্ত কৃষি উৎস থেকে সংগৃহীত ${p.bn} (${p.unit}) প্রতিদিনের পুষ্টি ও তাজা স্বাদের জন্য বাছাই করা। এতে রয়েছে প্রয়োজনীয় ভিটামিন, খনিজ ও ফাইবার যা শরীরের স্বাভাবিক পুষ্টি বজায় রাখতে সহায়ক। তাজা খেতে কিংবা প্রতিদিনের রান্নায় ব্যবহারের জন্য উপযুক্ত। সতেজতা ধরে রাখতে ঠান্ডা ও শুষ্ক স্থানে অথবা ফ্রিজে সংরক্ষণ করুন।`;
  case 'dairy':
  case 'bakery':
   return `সকালের নাস্তা ও প্রতিদিনের পুষ্টির জন্য স্বাস্থ্যসম্মতভাবে প্রক্রিয়াজাত ও প্যাক করা ${p.bn} (${p.unit})। প্রোটিন, ক্যালসিয়াম ও প্রয়োজনীয় পুষ্টিগুণে ভরপুর। সেরা স্বাদ ও গুণমান বজায় রাখতে প্যাকেটের গায়ে লেখা নির্দেশনা অনুযায়ী ফ্রিজে সংরক্ষণ করুন।`;
  case 'pantry':
  case 'spices':
   return `প্রতিদিনের ঘরোয়া রান্নার জন্য উন্নত মানের ও বাছাইকৃত ${p.bn} (${p.unit})। আধুনিক পদ্ধতিতে পরিষ্কার ও প্যাক করা হয়েছে যাতে প্রাকৃতিক স্বাদ, ঘ্রাণ ও বিশুদ্ধতা অটুট থাকে। আলো ও আর্দ্রতা থেকে দূরে মুখবন্ধ পাত্রে সংরক্ষণ করুন।`;
  case 'snacks':
  case 'drinks':
  case 'frozen':
   return `পরিবার ও প্রিয়জনদের সাথে প্রতিদিনের নাস্তা বা অবসরের মুহূর্তে উপভোগ করার জন্য ${p.bn} (${p.unit})। উপাদান, পুষ্টিমান ও সংরক্ষণ সংক্রান্ত তথ্যের জন্য প্যাকেটের গায়ের নির্দেশনা দেখুন।`;
  default:
   return `আপনার প্রতিদিনের ঘরোয়া প্রয়োজন ও যত্নের জন্য নির্ভরযোগ্য মানের ${p.bn} (${p.unit})। সঠিক ব্যবহার ও সংরক্ষণের জন্য প্যাকেটের গায়ে লেখা নির্দেশাবলি অনুসরণ করুন।`;
 }
}

function ModalPhoto({p,viewIndex=0}:{p:Product;viewIndex?:number}){
 const [broken,setBroken]=useState(false);
 if(broken){
  return (
   <div className="image-fallback">
    <ShoppingBag size={48}/>
    <span>{p.bn}</span>
   </div>
  );
 }
 const scaleClass=viewIndex===1?'pdp-img-zoom':viewIndex===2?'pdp-img-tilt':viewIndex===3?'pdp-img-detail':'';
 return <img className={scaleClass} src={p.image} alt={p.name} onError={()=>setBroken(true)}/>;
}

function CarouselSection({
 title,
 items,
 lang,
 cart,
 saving,
 loading,
 onSelect,
 onAdd,
 onSetQuantity,
}:{
 title:string;
 items:Product[];
 lang:'bn'|'en';
 cart:Record<string,number>;
 saving:boolean;
 loading:boolean;
 onSelect:(p:Product)=>void;
 onAdd:(p:Product)=>void;
 onSetQuantity:(p:Product,quantity:number)=>void;
}){
 const trackRef=useRef<HTMLDivElement>(null);
 const [canLeft,setCanLeft]=useState(false);
 const [canRight,setCanRight]=useState(true);

 function updateArrows(){
  const el=trackRef.current;
  if(!el)return;
  setCanLeft(el.scrollLeft>10);
  setCanRight(el.scrollLeft+el.clientWidth<el.scrollWidth-10);
 }

 useEffect(()=>{
  updateArrows();
 },[items.length]);

 if(!items.length)return null;

 const fmtMoney=(n:number)=>lang==='bn'?'৳'+bnNum(n):'Tk '+n.toLocaleString('en-BD');
 const fmtSave=(n:number)=>lang==='bn'?'সাশ্রয় ৳'+bnNum(n):'Save Tk'+n.toLocaleString('en-BD');

 return (
  <section className="pdp-carousel-section">
   <h3>{title}</h3>
   <div className="pdp-carousel-wrap">
    {canLeft&&(
     <button
      type="button"
      className="pdp-carousel-arrow left"
      aria-label="Previous products"
      onClick={()=>trackRef.current?.scrollBy({left:-420,behavior:'smooth'})}
     >
      <ChevronLeft size={20}/>
     </button>
    )}
    <div className="pdp-carousel-track" ref={trackRef} onScroll={updateArrows}>
     {items.map(item=>{
      const qty=cart[item.id]||0;
      const savings=item.originalPrice>item.price?item.originalPrice-item.price:0;
      const displayTitle=lang==='bn'?`${item.bn} ${item.unit}`:`${item.name} ${item.unit}`;
      return (
       <article key={item.id} className={'pdp-mini-card '+(item.stock===0?'unavailable':'')}>
        <div className="pdp-mini-photo-wrap">
         <button
          type="button"
          className="pdp-mini-photo"
          onClick={()=>onSelect(item)}
          aria-label={displayTitle}
         >
          <ModalPhoto p={item}/>
         </button>
         {qty>0?(
          <div className="pdp-mini-qty">
           <button
            type="button"
            disabled={saving}
            onClick={()=>onSetQuantity(item,qty-1)}
            aria-label={'Decrease '+item.name}
           >
            <Minus size={13}/>
           </button>
           <span>{lang==='bn'?bnNum(qty):qty}</span>
           <button
            type="button"
            disabled={saving||qty>=Math.min(20,item.stock)}
            onClick={()=>onAdd(item)}
            aria-label={'Increase '+item.name}
           >
            <Plus size={13}/>
           </button>
          </div>
         ):(
          <button
           type="button"
           className="pdp-mini-add"
           disabled={loading||saving||item.stock===0}
           onClick={()=>onAdd(item)}
           aria-label={'Add '+item.name}
          >
           <Plus size={18}/>
          </button>
         )}
        </div>
        <div className="pdp-mini-prices">
         <strong className={savings>0?'discounted':''}>{fmtMoney(item.price)}</strong>
         {savings>0&&<del>{fmtMoney(item.originalPrice)}</del>}
        </div>
        {savings>0&&<span className="pdp-save-pill small">{fmtSave(savings)}</span>}
        <button type="button" className="pdp-mini-name" onClick={()=>onSelect(item)}>
         {displayTitle}
        </button>
       </article>
      );
     })}
    </div>
    {canRight&&items.length>4&&(
     <button
      type="button"
      className="pdp-carousel-arrow right"
      aria-label="More products"
      onClick={()=>trackRef.current?.scrollBy({left:420,behavior:'smooth'})}
     >
      <ChevronRight size={20}/>
     </button>
    )}
   </div>
  </section>
 );
}

export default function ProductDetailModal({
 product,
 products,
 categoryName,
 lang,
 cart,
 wishlist,
 wishBusy,
 saving,
 loading,
 error,
 onClose,
 onSelect,
 onAdd,
 onSetQuantity,
 onFavorite,
}:Props){
 const dialogRef=useRef<HTMLDialogElement>(null);
 const scrollRef=useRef<HTMLDivElement>(null);
 const [scrolled,setScrolled]=useState(false);
 const [slide,setSlide]=useState(0);
 const totalSlides=4;

 useEffect(()=>{
  dialogRef.current?.showModal();
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=previous;};
 },[]);

 function selectProduct(next:Product){
  setSlide(0);
  setScrolled(false);
  onSelect(next);
  scrollRef.current?.scrollTo({top:0,behavior:'smooth'});
 }

 const tr=(bn:string,en:string)=>lang==='bn'?bn:en;
 const fmtMoney=(n:number)=>lang==='bn'?'৳'+bnNum(n):'Tk '+n.toLocaleString('en-BD');
 const savings=product.originalPrice>product.price?product.originalPrice-product.price:0;
 const qty=cart[product.id]||0;
 const isSaved=wishlist.includes(product.id);
 const fullTitle=lang==='bn'?`${product.bn} ${product.unit}`:`${product.name} ${product.unit}`;
 const secondaryTitle=lang==='bn'?`${product.name} · ${product.unit}`:`${product.bn} · ${product.unit}`;

 const moreLikeThis=useMemo(()=>{
  const sameCategory=products.filter(p=>p.id!==product.id&&p.category===product.category&&p.active!==false);
  if(sameCategory.length>=6)return sameCategory.slice(0,12);
  const fallback=products.filter(p=>p.id!==product.id&&p.category!==product.category&&p.active!==false);
  return [...sameCategory,...fallback].slice(0,12);
 },[products,product]);

 const customersAlsoBought=useMemo(()=>{
  const moreIds=new Set(moreLikeThis.map(p=>p.id));
  const others=products
   .filter(p=>p.id!==product.id&&!moreIds.has(p.id)&&p.active!==false)
   .sort((a,b)=>Number(!!b.popular)-Number(!!a.popular)||(b.originalPrice-b.price)-(a.originalPrice-a.price));
  if(others.length>=6)return others.slice(0,12);
  return products.filter(p=>p.id!==product.id&&p.active!==false).slice(0,12);
 },[products,product,moreLikeThis]);

 const description=useMemo(
  ()=>getCategoryDescription(product,categoryName,lang),
  [product,categoryName,lang]
 );

 return (
  <dialog
   ref={dialogRef}
   className="dialog pdp-dialog"
   onCancel={e=>{e.preventDefault();onClose();}}
   onClick={e=>{if(e.target===dialogRef.current)onClose();}}
   aria-label={fullTitle}
  >
   <div
    ref={scrollRef}
    className="pdp-scroll"
    onScroll={e=>setScrolled(e.currentTarget.scrollTop>220)}
   >
    {scrolled?(
     <header className="pdp-sticky-bar">
      <button
       type="button"
       className="pdp-sticky-add"
       disabled={loading||saving||product.stock===0||qty>=Math.min(20,product.stock)}
       onClick={()=>onAdd(product)}
       aria-label={tr('কার্টে যোগ করুন','Add to cart')}
      >
       {qty>0?<span>{lang==='bn'?bnNum(qty):qty}</span>:<Plus size={20}/>}
      </button>
      <div className="pdp-sticky-meta">
       <strong>{fullTitle}</strong>
       <div>
        <span className="pdp-sticky-price">{fmtMoney(product.price)}</span>
        {savings>0&&<del>{fmtMoney(product.originalPrice)}</del>}
       </div>
      </div>
      <button type="button" className="pdp-sticky-close" onClick={onClose} aria-label={tr('বন্ধ করুন','Close')}>
       <X size={21}/>
      </button>
     </header>
    ):(
     <button type="button" className="pdp-floating-close" onClick={onClose} aria-label={tr('বন্ধ করুন','Close')}>
      <X size={20}/>
     </button>
    )}

    <div className="pdp-body">
     <div className="pdp-hero">
      <div className="pdp-gallery">
       <div className="pdp-stage">
        {slide>0&&(
         <button
          type="button"
          className="pdp-stage-arrow left"
          onClick={()=>setSlide(s=>(s-1+totalSlides)%totalSlides)}
          aria-label="Previous image"
         >
          <ChevronLeft size={18}/>
         </button>
        )}
        <ModalPhoto key={product.id+'-'+slide} p={product} viewIndex={slide}/>
        <button
         type="button"
         className="pdp-stage-arrow right"
         onClick={()=>setSlide(s=>(s+1)%totalSlides)}
         aria-label="Next image"
        >
         <ChevronRight size={18}/>
        </button>
       </div>
       <div className="pdp-dots" role="tablist" aria-label="Product gallery">
        {Array.from({length:totalSlides}).map((_,i)=>(
         <button
          key={i}
          type="button"
          role="tab"
          className={slide===i?'active':''}
          aria-label={`View ${i+1}`}
          aria-selected={slide===i}
          onClick={()=>setSlide(i)}
         />
        ))}
       </div>
      </div>

      <div className="pdp-summary">
       {savings>0&&(
        <div>
         <span className="pdp-save-pill">
          {lang==='bn'?'সাশ্রয় ৳'+bnNum(savings):'Save Tk'+savings.toLocaleString('en-BD')}
         </span>
        </div>
       )}
       <h2>{fullTitle}</h2>
       <p className="pdp-subtitle">{secondaryTitle}</p>
       <div className="pdp-price-row">
        <strong>{fmtMoney(product.price)}</strong>
        {savings>0&&<del>{fmtMoney(product.originalPrice)}</del>}
       </div>

       <div className="pdp-actions">
        {qty>0?(
         <div className="pdp-qty-control">
          <button
           type="button"
           disabled={saving}
           onClick={()=>onSetQuantity(product,qty-1)}
           aria-label={product.name+' কমান'}
          >
           <Minus size={18}/>
          </button>
          <span>{lang==='bn'?bnNum(qty):qty}</span>
          <button
           type="button"
           disabled={saving||qty>=Math.min(20,product.stock)}
           onClick={()=>onAdd(product)}
           aria-label={product.name+' বাড়ান'}
          >
           <Plus size={18}/>
          </button>
         </div>
        ):(
         <button
          type="button"
          className="pdp-add-btn"
          disabled={loading||saving||product.stock===0}
          onClick={()=>onAdd(product)}
         >
          {product.stock===0?tr('স্টক শেষ','Out of stock'):tr('কার্টে যোগ করুন','Add to cart')}
         </button>
        )}
        <button
         type="button"
         className={'pdp-wish-btn '+(isSaved?'saved':'')}
         disabled={!!wishBusy}
         onClick={()=>onFavorite(product)}
         aria-label={isSaved?'Remove from wishlist':'Save to wishlist'}
         aria-pressed={isSaved}
        >
         <Heart size={19}/>
        </button>
       </div>
       {error&&<p className="field-error">{error}</p>}
      </div>
     </div>

     <hr className="pdp-divider"/>

     <section className="pdp-info-section">
      <h3>{tr('পণ্যের তথ্য','Product information')}</h3>
      <p className="pdp-origin">{tr('উৎপাদনকারী দেশ: বাংলাদেশ','Country of Origin: Bangladesh')}</p>
      <p className="pdp-description">{description}</p>
     </section>

     <hr className="pdp-divider"/>

     <CarouselSection
      title={tr('একই ধরনের আরও পণ্য','More like this')}
      items={moreLikeThis}
      lang={lang}
      cart={cart}
      saving={saving}
      loading={loading}
      onSelect={selectProduct}
      onAdd={onAdd}
      onSetQuantity={onSetQuantity}
     />

     <CarouselSection
      title={tr('গ্রাহকরা আরও কিনেছেন','Customers also bought')}
      items={customersAlsoBought}
      lang={lang}
      cart={cart}
      saving={saving}
      loading={loading}
      onSelect={selectProduct}
      onAdd={onAdd}
      onSetQuantity={onSetQuantity}
     />
    </div>
   </div>
  </dialog>
 );
}
