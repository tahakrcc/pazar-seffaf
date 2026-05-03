ALTER TABLE complaint ADD COLUMN vendor_id BIGINT REFERENCES vendor (id);
