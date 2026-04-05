# AljuAlju Database Normalization

## Goal

The legacy schema keeps `user_allergies` and `menu_analyses` for backward compatibility, while the normalized schema adds query-friendly entities for analytics, recommendations, and future feature expansion.

## Legacy Tables

- `users`
- `user_allergies`
- `menu_analyses`

## Normalized Tables

### `allergen_catalog`
- Master catalog for allergen names.
- Stores `display_name`, `normalized_name`, activation state, and optional description.

### `user_allergen_items`
- User-specific allergen selections.
- Links a user to the shared catalog when possible.
- Keeps the original label and severity for profile history and UI rendering.

### `analysis_jobs`
- One row per analysis request lifecycle.
- Stores request status, source image metadata, pipeline version, and latency metrics.
- Designed for performance dashboards and failure tracking.

### `analysis_results`
- One row per completed analysis job.
- Stores raw AI response plus structured JSON segments for classification, ingredient analysis, allergy risk, recommendations, and similar menus.

### `menu_items`
- Child table of `analysis_results`.
- Stores the primary analyzed menu plus recommended and similar menu candidates in a unified shape.

### `menu_ingredients`
- Child table of `menu_items`.
- Stores extracted ingredients, matched allergen metadata, and user-risk flags for filtering/reporting.

## Relationship Summary

- `users 1:N user_allergies`
- `users 1:N user_allergen_items`
- `allergen_catalog 1:N user_allergen_items`
- `users 1:N menu_analyses`
- `users 1:N analysis_jobs`
- `analysis_jobs 1:1 analysis_results`
- `analysis_results 1:N menu_items`
- `menu_items 1:N menu_ingredients`
- `allergen_catalog 1:N menu_ingredients`

## Why This Structure Helps

- Separates request lifecycle data from structured result data.
- Makes latency, failure rate, and throughput analysis possible without parsing JSON blobs.
- Supports future recommendation ranking, ingredient search, allergen statistics, and user-personalized history pages.
- Preserves existing API behavior by writing legacy and normalized records in parallel.

## Index Strategy

- `allergen_catalog.normalized_name` unique lookup
- `user_allergen_items (user_id, normalized_name)` unique user-level dedupe
- `user_allergen_items (user_id, severity)` profile filtering
- `analysis_jobs (user_id, created_at)` recent-history lookups
- `analysis_jobs (status, created_at)` operational monitoring
- `menu_items (analysis_result_id, item_role)` fast primary/similar/alternative grouping
- `menu_ingredients (menu_item_id)` and `menu_ingredients (allergen_catalog_id)` join performance

## Migration Strategy

- Keep legacy tables active during transition.
- Persist new records in parallel from the existing route handlers.
- Move read paths to normalized tables after API compatibility checks are complete.
