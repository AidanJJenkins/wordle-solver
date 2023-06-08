CREATE TABLE revoked_tokens (
    token TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW()
);
