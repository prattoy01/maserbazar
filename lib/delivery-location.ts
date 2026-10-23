import {areas} from './catalog';
export type DeliveryLocation={area:string;address:string};
export const locationStorageKey='bazar-delivery-location-rajshahi';
export function parseDeliveryLocation(raw:string|null):DeliveryLocation|null{
 try{const value=JSON.parse(raw||'null');return value&&areas.includes(value.area)&&typeof value.address==='string'&&value.address.length<=400?{area:value.area,address:value.address}:null;}catch{return null;}
}
export function positionStatus(latitude:number,longitude:number,accuracy:number){
 if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return 'unavailable';
 if(!Number.isFinite(accuracy)||accuracy<0||accuracy>2000)return 'inaccurate';
 // A broad city check is a suggestion only, never a street address or a
 // delivery-eligibility decision. Customers confirm a supported area themselves.
 return latitude>=24.32&&latitude<=24.45&&longitude>=88.50&&longitude<=88.72?'rajshahi':'outside';
}
