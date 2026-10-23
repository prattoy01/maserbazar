import Account from './account';
import './auth.css';
import {availableProviders} from '@/lib/social-auth';
export const dynamic='force-dynamic';
export default function LoginPage(){return <Account providers={availableProviders()}/>;}
