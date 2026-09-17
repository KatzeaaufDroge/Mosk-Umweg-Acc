/*
  # Fix contact_submissions.name NOT NULL constraint

  1. Problem
    - `name` was defined as NOT NULL in the original table creation, but the
      later migration that introduced `vorname`/`nachname`/`unternehmensname`/
      `ansprechpartner` never populated or dropped the constraint on `name`.
    - The contact form (src/components/Contact.tsx) never sets `name` when
      inserting a submission, so every insert currently violates this
      constraint and fails.

  2. Changes
    - Drop the NOT NULL constraint on `contact_submissions.name` so
      submissions can succeed again. The more specific `vorname`/`nachname`/
      `unternehmensname`/`ansprechpartner` fields already capture the actual
      name data depending on `kundentyp`.
*/

ALTER TABLE contact_submissions ALTER COLUMN name DROP NOT NULL;
