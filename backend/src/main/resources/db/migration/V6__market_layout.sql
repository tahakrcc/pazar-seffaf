CREATE TABLE IF NOT EXISTS market_layout (
    market_id BIGINT PRIMARY KEY REFERENCES market(id) ON DELETE CASCADE,
    format_version INT NOT NULL DEFAULT 2,
    revision BIGINT NOT NULL DEFAULT 1,
    layout_json CLOB NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(190)
);

INSERT INTO market_layout (market_id, format_version, revision, layout_json, updated_at, updated_by)
SELECT
    m.id,
    2,
    1,
    CASE
        WHEN m.schema_canvas_json IS NOT NULL AND TRIM(m.schema_canvas_json) <> '' THEN m.schema_canvas_json
        ELSE '{"version":2,"width":720,"height":520,"nodes":[]}'
    END,
    CURRENT_TIMESTAMP,
    'migration-v6'
FROM market m
WHERE NOT EXISTS (
    SELECT 1 FROM market_layout ml WHERE ml.market_id = m.id
);
