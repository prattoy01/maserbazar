import Storefront from './storefront';
import {readBanners} from '@/lib/banner-store';
import {readCategorySettings} from '@/lib/category-store';
import {readPaymentSettings} from '@/lib/payment-store';
export const dynamic='force-dynamic';
export default async function Page() { return <Storefront initialCategories={(await readCategorySettings()).settings} initialBanners={(await readBanners()).banners.filter(b=>b.active)} initialPaymentSettings={(await readPaymentSettings()).settings} />; }
