import {deliveryChoices} from '@/lib/shopping';
export const dynamic='force-dynamic';
export async function GET(){return Response.json({deliveryChoices:deliveryChoices()},{headers:{'Cache-Control':'no-store'}});}
