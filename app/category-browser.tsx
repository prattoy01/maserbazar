'use client';
import {useId,useRef,useState} from 'react';
import {ChevronDown,ChevronUp,ChevronLeft,ChevronRight,Tag,ShoppingBasket,Flame,ShoppingBag,SprayCan} from 'lucide-react';
import {defaultCategorySettings,type CategorySettings} from '@/lib/category-settings';
import './category-browser.css';

function Illustration({src}:{src:string}){const[failed,setFailed]=useState(false);return failed?<ShoppingBag size={38}/>:<img src={src} alt="" loading="lazy" onError={()=>setFailed(true)}/>;}
export default function CategoryBrowser({lang,onChoose,settings=defaultCategorySettings}:{settings?:CategorySettings;lang:'bn'|'en';onChoose:(id:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 const [expanded,setExpanded]=useState(false);
 const gridId=useId();
 const departments=settings.items.filter(c=>c.active);
 const tr=(bn:string,en:string)=>lang==='bn'?bn:en;
 const promos=[{id:'deals',bn:'অফারগুলো',en:'Offers',Icon:Tag},{id:'monthly',bn:'মাসিক বাজার',en:'Monthly bazar',Icon:ShoppingBasket},{id:'popular',bn:'সবার পছন্দ',en:'Best sellers',Icon:Flame},{id:'care-deals',bn:'ঘরের যত্ন',en:'Home care',Icon:SprayCan}];
 return <section className="department-section" aria-label={tr('ক্যাটেগরি অনুযায়ী বাজার','Shop by category')}><div className="section-head"><h2>{tr('ক্যাটেগরি অনুযায়ী বাজার','Shop by category')}</h2><div className="department-controls"><button aria-label={tr('আগের ক্যাটেগরি','Previous categories')} onClick={()=>ref.current?.scrollBy({left:-360,behavior:'smooth'})}><ChevronLeft size={19}/></button><button aria-label={tr('পরের ক্যাটেগরি','Next categories')} onClick={()=>ref.current?.scrollBy({left:360,behavior:'smooth'})}><ChevronRight size={19}/></button></div></div><div className="department-track" ref={ref}><div className="department-promos">{promos.map(({id,bn,en,Icon},index)=><button className={'department-promo '+(index===0?'offer-promo':'')} key={id} onClick={()=>onChoose(id)}><span className="promo-art"><Icon size={36} strokeWidth={1.7}/></span><span>{tr(bn,en)}</span></button>)}</div><div id={gridId} className="department-grid">{(expanded?departments:departments.slice(0,settings.initialCount)).map(d=><button className="department-tile" key={d.id} onClick={()=>onChoose(d.id)}><span className="department-art"><Illustration key={d.image} src={d.image}/></span><span className="department-label">{tr(d.name,d.en)}</span></button>)}</div></div>{departments.length>settings.initialCount&&<button type="button" className="department-expand" aria-expanded={expanded} aria-controls={gridId} onClick={()=>{setExpanded(!expanded);if(expanded)ref.current?.scrollTo({left:0});}}><span>{expanded?tr('কম দেখুন','Show less'):tr('আরও দেখুন','Show more')}</span>{expanded?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button>}</section>;
}

