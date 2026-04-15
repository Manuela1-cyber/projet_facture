ALTER TABLE factures
ADD COLUMN created_at TIMESTAMP NULL,
ADD COLUMN updated_at TIMESTAMP NULL,


UPDATE factures
SET created_at = NOW(), updated_at = NOW();


ALTER TABLE assigner
ADD COLUMN created_at TIMESTAMP NULL,
ADD COLUMN updated_at TIMESTAMP NULL,


ALTER TABLE FACTURES
DROP COLUMN appartement_id,
DROP COLUMN locataire_id;
