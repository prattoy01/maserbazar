'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {LocateFixed,LoaderCircle,MapPin,Check,Navigation} from 'lucide-react';
import {areas} from '@/lib/catalog';
import {positionStatus,type DeliveryLocation} from '@/lib/delivery-location';
import './location-picker.css';
export default function LocationPicker({initial,lang,onConfirm}:{initial:DeliveryLocation;lang:'bn'|'en';onConfirm:(location:DeliveryLocation)=>void}){
 const[area,setArea]=useState(initial.area),[address,setAddress]=useState(initial.address),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const request=useRef(0);useEffect(()=>()=>{request.current++;},[]);
 const tr=(bn:string,en:string)=>lang==='bn'?bn:en;
 function locate(){
  setError('');setNotice('');
  if(!window.isSecureContext||!navigator.geolocation){setError(tr('এই ব্রাউজারে অবস্থান পাওয়া যাচ্ছে না। নিচে ঠিকানা লিখুন।','Location is unavailable in this browser. Enter your address below.'));return;}
  setBusy(true);const id=++request.current;
  navigator.geolocation.getCurrentPosition(({coords})=>{
   if(id!==request.current)return;setBusy(false);
   const status=positionStatus(coords.latitude,coords.longitude,coords.accuracy);
   if(status==='rajshahi')setNotice(tr('রাজশাহীতে আপনার অবস্থান পাওয়া গেছে। নিচে সঠিক এলাকা ও বাড়ির ঠিকানা নিশ্চিত করুন।','Your location appears to be in Rajshahi. Confirm your neighbourhood and street address below.'));
   else if(status==='outside')setError(tr('আপনার GPS অবস্থান রাজশাহীর বাইরে মনে হচ্ছে। বর্তমানে শুধু তালিকার এলাকাগুলোতে ডেলিভারি। রাজশাহীতে অর্ডার দিতে ঠিকানা লিখুন।','Your GPS location appears to be outside Rajshahi. We serve the listed neighbourhoods only. Enter a Rajshahi delivery address to continue.'));
   else setError(tr('GPS অবস্থান যথেষ্ট নির্ভুল নয়। নিচে আপনার এলাকা ও ঠিকানা লিখুন।','The GPS reading is not accurate enough. Choose your neighbourhood and enter your address below.'));
  },failure=>{
   if(id!==request.current)return;setBusy(false);
   setError(failure.code===1?tr('লোকেশনের অনুমতি দেওয়া হয়নি। সমস্যা নেই—নিচে ঠিকানা লিখুন।','Location permission was denied. You can enter your address below.'):failure.code===3?tr('অবস্থান পেতে সময় শেষ হয়েছে। আবার চেষ্টা করুন বা ঠিকানা লিখুন।','Location timed out. Try again or enter your address.'):tr('অবস্থান পাওয়া যায়নি। ফোনের লোকেশন চালু করুন বা ঠিকানা লিখুন।','Location could not be found. Enable location on your phone or enter your address.'));
  },{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
 }
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();request.current++;setBusy(false);onConfirm({area,address:address.trim()});}
 return <div className="location-picker"><div className="location-heading"><span><MapPin size={28}/></span><h3>{tr('কোথায় বাজার পৌঁছে দেব?','Where should we deliver?')}</h3><p>{tr('আপনার বর্তমান অবস্থান ব্যবহার করুন বা নিজে ঠিকানা লিখুন।','Use your current location or enter an address yourself.')}</p></div><button className="locate-button" type="button" onClick={locate} disabled={busy}>{busy?<LoaderCircle size={21} className="spin"/>:<LocateFixed size={21}/>}<span><strong>{busy?tr('অবস্থান খোঁজা হচ্ছে…','Finding your location…'):tr('আমার বর্তমান অবস্থান','Use my current location')}</strong><small>{tr('আপনার অনুমতি নিয়ে GPS ব্যবহার করব','Uses your device location with permission')}</small></span><Navigation size={18}/></button>{error&&<p className="location-feedback location-error" role="alert">{error}</p>}{notice&&<p className="location-feedback location-success" role="status"><Check size={18}/>{notice}</p>}<div className="location-divider"><span>{tr('অথবা নিজে ঠিকানা লিখুন','or enter a location manually')}</span></div><form onSubmit={submit}><label className="form-label">{tr('ডেলিভারির এলাকা','Delivery neighbourhood')}<select value={area} onChange={e=>setArea(e.target.value)} required>{areas.map(a=><option key={a} value={a}>{a}</option>)}</select></label><label className="form-label">{tr('বাড়ি / রাস্তা / ল্যান্ডমার্ক','House / street / landmark')}<textarea rows={3} minLength={8} maxLength={400} value={address} onChange={e=>setAddress(e.target.value)} autoComplete="street-address" placeholder={tr('যেমন: বাড়ি ১২, রোড ৩, মসজিদের পাশে','Example: House 12, Road 3, beside the mosque')}/><small>{tr('এখন না লিখলে চেকআউটে সম্পূর্ণ ঠিকানা দিতে হবে।','You can also provide the full address at checkout.')}</small></label><button type="submit" className="primary full"><Check size={19}/>{tr('এই ঠিকানায় বাজার করুন','Shop at this location')}</button></form><p className="location-privacy">{tr('সঠিক GPS অবস্থান শুধু এই পেজে ব্যবহৃত হয়। মানচিত্র সেবায় পাঠানো বা সংরক্ষণ করা হয় না। আপনার লেখা ঠিকানা এই ব্রাউজারে মনে রাখা হবে।','Exact GPS coordinates stay on this page and are not stored or sent to a map service. Your entered address is remembered in this browser.')}</p></div>;
}
