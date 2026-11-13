import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const products = sqliteTable('products', {
 id:text('id').primaryKey(),name:text('name').notNull(),price:integer('price').notNull(),originalPrice:integer('original_price').notNull(),stock:integer('stock').notNull(),active:integer('active').notNull().default(1),bn:text('bn'),category:text('category'),unit:text('unit'),image:text('image'),popular:integer('popular'),lowStockThreshold:integer('low_stock_threshold').notNull().default(5),
});
export const carts = sqliteTable('carts', {userId:text('user_id').primaryKey(),items:text('items').notNull().default('{}'),updatedAt:text('updated_at').notNull()});
export const customers = sqliteTable('customers', {
 id:text('id').primaryKey(),email:text('email').notNull(),name:text('name').notNull(),passwordHash:text('password_hash').notNull(),recoveryHash:text('recovery_hash').notNull(),authVersion:integer('auth_version').notNull().default(1),createdAt:integer('created_at').notNull(),
},t=>[uniqueIndex('customers_email').on(t.email)]);
export const customerSessions = sqliteTable('customer_sessions', {
 tokenHash:text('token_hash').primaryKey(),customerId:text('customer_id').notNull().references(()=>customers.id),authVersion:integer('auth_version').notNull(),expiresAt:integer('expires_at').notNull(),
},t=>[index('sessions_customer').on(t.customerId),index('sessions_expiry').on(t.expiresAt)]);
export const authLimits = sqliteTable('auth_limits', {key:text('key').primaryKey(),attempts:integer('attempts').notNull(),expiresAt:integer('expires_at').notNull()});
export const homepageContent=sqliteTable('homepage_content',{id:text('id').primaryKey(),value:text('value').notNull(),revision:integer('revision').notNull().default(0)});
export const customerIdentities=sqliteTable('customer_identities',{
 provider:text('provider').notNull(),subject:text('subject').notNull(),customerId:text('customer_id').notNull().references(()=>customers.id),
},t=>[uniqueIndex('identities_provider_subject').on(t.provider,t.subject)]);
export const oauthAttempts=sqliteTable('oauth_attempts',{
 stateHash:text('state_hash').primaryKey(),provider:text('provider').notNull(),customerId:text('customer_id'),expiresAt:integer('expires_at').notNull(),
});
export const orders = sqliteTable('orders', {
 id:text('id').primaryKey(),userId:text('user_id').notNull(),requestId:text('request_id').notNull(),customerName:text('customer_name').notNull(),phone:text('phone').notNull(),address:text('address').notNull(),area:text('area').notNull(),items:text('items').notNull(),subtotal:integer('subtotal').notNull(),discount:integer('discount').notNull(),delivery:integer('delivery').notNull(),total:integer('total').notNull(),status:text('status').notNull().default('received'),payment:text('payment').notNull().default('cod'),trxId:text('trx_id'),paymentStatus:text('payment_status').notNull().default('pending'),note:text('note').notNull().default(''),stockApplied:integer('stock_applied').notNull().default(0),createdAt:text('created_at').notNull(),deliveryDate:text('delivery_date'),deliverySlot:text('delivery_slot'),
},t=>[uniqueIndex('orders_user_request').on(t.userId,t.requestId),index('orders_user_created').on(t.userId,t.createdAt)]);
export const savedAddresses=sqliteTable('saved_addresses', {
 id:text('id').primaryKey(),userId:text('user_id').notNull().references(()=>customers.id),label:text('label').notNull(),name:text('name').notNull(),phone:text('phone').notNull(),address:text('address').notNull(),area:text('area').notNull(),isDefault:integer('is_default').notNull().default(0),createdAt:text('created_at').notNull(),
},t=>[index('addresses_user').on(t.userId)]);
export const wishlist=sqliteTable('wishlist', {
 id:text('id').primaryKey(),userId:text('user_id').notNull().references(()=>customers.id),productId:text('product_id').notNull().references(()=>products.id),createdAt:text('created_at').notNull(),
},t=>[uniqueIndex('wishlist_user_product').on(t.userId,t.productId)]);
export const productImages=sqliteTable('product_images', {
 id:text('id').primaryKey(),objectKey:text('object_key').notNull(),contentType:text('content_type').notNull(),size:integer('size').notNull(),createdAt:text('created_at').notNull(),
});
export const cartActions=sqliteTable('cart_actions', {
 id:text('id').primaryKey(),userId:text('user_id').notNull(),requestId:text('request_id').notNull(),warnings:text('warnings').notNull(),applied:integer('applied').notNull().default(0),createdAt:text('created_at').notNull(),
},t=>[uniqueIndex('cart_actions_user_request').on(t.userId,t.requestId)]);

export const imagePayloads=sqliteTable('image_payloads',{id:text('id').primaryKey().references(()=>productImages.id),dataBase64:text('data_base64').notNull()});
