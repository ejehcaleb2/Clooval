-- Add request_hash to prevent exact duplicate requests
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS request_hash TEXT;

-- Create unique index to prevent duplicate requests with same hash
CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_request_hash ON requests(request_hash);
