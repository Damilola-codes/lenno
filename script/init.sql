-- # scripts/init.sql - Database initialization script
-- Create additional indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_budget ON jobs(budget);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_job_id ON proposals(job_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_receiver_id ON reviews(receiver_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Create full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_search ON profiles USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- Add some useful database functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_search ON profiles USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- Add some useful database functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for transactions
