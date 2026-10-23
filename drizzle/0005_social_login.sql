CREATE TABLE customer_identities (
 provider TEXT NOT NULL,
 subject TEXT NOT NULL,
 customer_id TEXT NOT NULL REFERENCES customers(id),
 PRIMARY KEY(provider, subject)
);
--> statement-breakpoint
CREATE TABLE oauth_attempts (
 state_hash TEXT PRIMARY KEY,
 provider TEXT NOT NULL,
 customer_id TEXT,
 expires_at INTEGER NOT NULL
);
