# Enhanced Recipe Admin Interface Implementation Plan

## Overview

Enhance the admin recipe management interface to support all 27 database fields with create, edit, and delete functionality. Currently, the admin interface only handles 6 fields, while the actual database schema has 27 fields including complex JSONB structures and photo metadata.

## Database Schema Summary

The `recipes` table has **27 fields** across these categories:

**Core Identity** (4): id, created_by, recipe_name, description
**Portions & Timing** (5): servings, prep_time_minutes, cook_time_minutes, difficulty, portion_size
**Content** (5): ingredients (jsonb), steps (jsonb), nutrition (jsonb), health_benefits (jsonb), warnings (jsonb)
**Categorization** (4): health_score, dietary_tags (array), meal_categories (array), time_of_day (enum)
**Publishing** (2): is_published, language
**Photo Metadata** (7): photo_path, photo_url, photo_width, photo_height, photo_size_bytes, photo_moderation_status, photo_moderated_at
**System** (3): created_at, updated_at, deleted_at (soft-delete)
**AI** (1): embedding (vector, for semantic search)

## Critical Issues to Fix

1. **Field name mismatch**: Database uses `recipe_name`, current code uses `name`
2. **Incomplete type definitions**: `database.types.ts` only has 9 fields, missing 18 fields
3. **Missing CRUD operations**: No edit or delete functionality
4. **Complex field handling**: JSONB fields need structured input, not raw JSON

## Implementation Strategy

### Form Organization: Tabbed Sections

With 27 fields, organize the create/edit form into **6 tabs**:

1. **Basic Info** (5 fields): recipe_name, description, servings, language, is_published
2. **Timing & Difficulty** (4 fields): prep_time_minutes, cook_time_minutes, difficulty, time_of_day
3. **Ingredients & Steps** (2 complex fields): ingredients (jsonb array), steps (jsonb array)
4. **Nutrition & Health** (4 fields): nutrition (jsonb object), health_score, health_benefits (jsonb array), warnings (jsonb array)
5. **Categorization** (3 fields): dietary_tags (text array), meal_categories (text array), portion_size
6. **Photo & Metadata** (read-only): All photo fields, timestamps, id, embedding status

### Edit vs Create Approach

- **Create**: Stay on main `/admin` page with tabbed form
- **Edit**: Navigate to `/admin/recipes/[id]/edit` (separate page)
- **Reason**: Better UX for complex multi-tab forms, clear URL routing

### Delete Strategy

- **Soft-delete**: Set `deleted_at` timestamp (matches existing DB pattern)
- **Filter by default**: Hide deleted recipes unless "Show Deleted" toggle is on
- **Confirmation**: Require typing recipe name to confirm deletion

### Complex Field Handling

Use **structured forms** instead of raw JSON editors:

- **ingredients**: Add/remove rows with `name`, `amount`, `unit` fields
- **steps**: Add/remove numbered text inputs (array of strings)
- **nutrition**: Fixed fields for `calories`, `protein`, `carbs`, `fat`, `fiber`, `sugar`
- **health_benefits**: Add/remove rows with `benefit` and `description` fields
- **warnings**: Add/remove rows with `type` and `message` fields
- **dietary_tags/meal_categories**: Comma-separated tag input with chips

## Files to Create

### 1. Type Definitions
**File**: `lib/recipe-types.ts`

Comprehensive TypeScript types including:
- Enums: `RecipeDifficulty` (EASY, MEDIUM, HARD), `RecipeTimeOfDay` (BREAKFAST, LUNCH, DINNER, SNACK)
- Interfaces for JSONB structures: `Ingredient`, `NutritionInfo`, `HealthBenefit`, `Warning`
- Complete `Recipe` type matching all 27 database fields
- `RecipeFormData` type (omits system fields like id, timestamps)

### 2. API Endpoint for Single Recipe Operations
**File**: `app/api/admin/recipes/[id]/route.ts`

Three HTTP methods:
- **GET**: Fetch single recipe by ID
- **PATCH**: Update recipe (partial updates supported)
- **DELETE**: Soft-delete (set `deleted_at` to current timestamp)

All require `requireSession()` authentication check.

### 3. Edit Page
**File**: `app/admin/recipes/[id]/edit/page.tsx`

- Fetch recipe data on mount via GET `/api/admin/recipes/[id]`
- Pre-populate tabbed form with existing data
- Submit updates via PATCH `/api/admin/recipes/[id]`
- Redirect to `/admin` on success with success message

### 4. Reusable Form Components
**Files** in `app/admin/components/`:

- `RecipeFormTabs.tsx`: Tab navigation wrapper
- `IngredientsList.tsx`: Dynamic ingredient input with add/remove
- `StepsList.tsx`: Numbered steps with add/remove
- `NutritionInputs.tsx`: Structured nutrition fields
- `HealthBenefitsList.tsx`: Dynamic health benefits with add/remove
- `WarningsList.tsx`: Dynamic warnings with add/remove
- `TagInput.tsx`: Comma-separated tag input with visual chips
- `DeleteRecipeDialog.tsx`: Confirmation dialog with recipe name verification

## Files to Modify

### 1. Database Type Definitions
**File**: `lib/database.types.ts`

**Changes**:
- Update `recipes.Row` to include all 27 fields with correct types
- Fix field name: `name` → `recipe_name`
- Add JSONB fields: `ingredients`, `steps`, `nutrition`, `health_benefits`, `warnings`
- Add array fields: `dietary_tags`, `meal_categories`
- Add photo metadata fields (7 fields)
- Add soft-delete: `deleted_at`
- Add enum types in `Database.public.Enums`: `recipe_difficulty`, `recipe_time_of_day`

**Key type mappings**:
- `jsonb` → `Json` (already defined)
- `text[]` → `string[]`
- `vector(1536)` → `number[] | null` (or keep as `Json`)

### 2. Main Admin Page
**File**: `app/admin/page.tsx`

**Changes**:

1. **Update Create Form**:
   - Replace inline form fields with tabbed form using `RecipeFormTabs` component
   - Add all 27 fields organized into 6 tabs
   - Use structured components for JSONB fields
   - Update `emptyRecipe` state to match new schema
   - Fix field mapping: `name` → `recipe_name`

2. **Add "Show Deleted" Toggle**:
   - State: `const [showDeleted, setShowDeleted] = useState(false)`
   - Pass as query param to GET request: `?include_deleted=${showDeleted}`
   - Toggle button in recipes section header

3. **Add Edit Button to Recipe List**:
   - Add "Edit" button in each table row or in details panel
   - Navigate to `/admin/recipes/[id]/edit` on click

4. **Add Delete Button**:
   - Add "Delete" button next to Edit button
   - Open `DeleteRecipeDialog` on click
   - Refresh list after successful deletion

5. **Enhance Recipe Details Panel**:
   - Display all 27 fields in organized sections
   - Show JSONB data formatted (not raw JSON)
   - Show arrays as comma-separated or bulleted lists
   - Mark read-only fields (photo metadata, timestamps)

6. **Update Form Submission**:
   - Map all form data to match database schema
   - Handle JSONB field serialization
   - Convert arrays properly

### 3. Recipe List API Route
**File**: `app/api/admin/recipes/route.ts`

**Changes**:

1. **GET Endpoint**:
   - Add query param support: `include_deleted` (boolean)
   - Filter: `.is('deleted_at', null)` when `include_deleted !== 'true'`
   - Keep existing ordering: `.order('created_at', { ascending: false })`

2. **POST Endpoint**:
   - Update to accept all 27 fields
   - Fix field mapping: ensure frontend sends `recipe_name` not `name`
   - Add `created_by` from session user ID
   - Validate required fields server-side

## Data Flow

### Create Recipe Flow
1. User fills out tabbed form on `/admin` page
2. Frontend validates required fields
3. POST `/api/admin/recipes` with all field data
4. Backend validates and inserts into Supabase
5. Trigger automatically queues recipe for embedding generation
6. Success: Show message, reset form, refresh recipe list

### Edit Recipe Flow
1. User clicks "Edit" on recipe in list
2. Navigate to `/admin/recipes/[id]/edit`
3. Page fetches: GET `/api/admin/recipes/[id]`
4. Form pre-populated with fetched data
5. User modifies fields across tabs
6. PATCH `/api/admin/recipes/[id]` with changed fields
7. Database trigger updates `updated_at` automatically
8. Success: Redirect to `/admin` with success toast

### Delete Recipe Flow
1. User clicks "Delete" button
2. Dialog shows: "Type recipe name to confirm"
3. User types recipe name (exact match required)
4. DELETE `/api/admin/recipes/[id]`
5. Backend sets `deleted_at = NOW()`
6. Recipe disappears from list (unless "Show Deleted" is on)
7. Success message shown

### View Details Flow
1. User clicks recipe row in table
2. `selectedRecipeId` state updates
3. Details panel renders on right side
4. All 27 fields shown in organized sections
5. Edit and Delete buttons at bottom

## Validation Rules

### Required Fields (NOT NULL in database):
- recipe_name
- description
- servings (min: 1)
- prep_time_minutes (min: 0)
- cook_time_minutes (min: 0)
- difficulty (enum: EASY, MEDIUM, HARD)
- ingredients (must be non-empty array)
- steps (must be non-empty array)
- nutrition (must have all required keys)
- health_score (range: 0-100)
- dietary_tags (can be empty array, default: [])
- meal_categories (can be empty array, default: [])
- is_published (default: false)

### Optional Fields:
- portion_size, language, time_of_day, health_benefits, warnings
- All photo metadata fields (auto-populated by system)

### Frontend Validation:
- Display inline errors below fields
- Prevent form submission if validation fails
- Show summary error banner at top of form

### Backend Validation:
- Verify required fields exist
- Validate enum values match allowed options
- Validate numeric ranges
- Return 400 with error details on validation failure

## UI Component Structure

```
app/admin/
├── page.tsx (MODIFY)
│   ├── Create Recipe section (tabbed form)
│   ├── Recipe List section (with Edit/Delete buttons, Show Deleted toggle)
│   └── Recipe Details panel (all 27 fields)
│
├── components/ (CREATE)
│   ├── RecipeFormTabs.tsx (tab navigation)
│   ├── tabs/
│   │   ├── BasicInfoTab.tsx
│   │   ├── TimingTab.tsx
│   │   ├── ContentTab.tsx (ingredients + steps)
│   │   ├── NutritionTab.tsx
│   │   ├── CategorizationTab.tsx
│   │   └── MetadataTab.tsx (read-only)
│   ├── IngredientsList.tsx
│   ├── StepsList.tsx
│   ├── NutritionInputs.tsx
│   ├── HealthBenefitsList.tsx
│   ├── WarningsList.tsx
│   ├── TagInput.tsx
│   └── DeleteRecipeDialog.tsx
│
└── recipes/[id]/edit/ (CREATE)
    └── page.tsx (edit form with same tabbed components)
```

## API Routes Structure

```
app/api/admin/recipes/
├── route.ts (MODIFY)
│   ├── GET (list all recipes, filter deleted)
│   └── POST (create new recipe)
│
└── [id]/ (CREATE)
    └── route.ts
        ├── GET (single recipe)
        ├── PATCH (update recipe)
        └── DELETE (soft-delete recipe)
```

## Example JSONB Structures

### ingredients (array of objects):
```json
[
  { "name": "Chicken breast", "amount": "500", "unit": "g" },
  { "name": "Olive oil", "amount": "2", "unit": "tbsp" }
]
```

### steps (array of strings):
```json
[
  "Preheat oven to 180°C",
  "Season chicken with salt and pepper",
  "Bake for 25 minutes"
]
```

### nutrition (object):
```json
{
  "calories": 350,
  "protein": 45,
  "carbs": 10,
  "fat": 15,
  "fiber": 2,
  "sugar": 3
}
```

### health_benefits (array of objects):
```json
[
  {
    "benefit": "High Protein",
    "description": "Supports muscle growth and repair"
  },
  {
    "benefit": "Low Carb",
    "description": "Suitable for ketogenic diets"
  }
]
```

### warnings (array of objects):
```json
[
  {
    "type": "allergen",
    "message": "Contains nuts"
  }
]
```

## Testing Checklist

### Type Safety
- [ ] `npm run type-check` passes with no errors
- [ ] All JSONB structures have TypeScript interfaces
- [ ] Enum types properly defined and used

### API Endpoints
- [ ] GET `/api/admin/recipes` returns all non-deleted recipes
- [ ] GET `/api/admin/recipes?include_deleted=true` returns all including deleted
- [ ] POST `/api/admin/recipes` creates recipe with all 27 fields
- [ ] GET `/api/admin/recipes/[id]` returns single recipe
- [ ] PATCH `/api/admin/recipes/[id]` updates only provided fields
- [ ] DELETE `/api/admin/recipes/[id]` sets deleted_at timestamp

### UI/UX
- [ ] Create form: All 27 fields accessible via tabs
- [ ] Tab navigation works smoothly
- [ ] Required field validation prevents submission
- [ ] Ingredient list: Add/remove buttons work
- [ ] Steps list: Add/remove buttons work, auto-numbered
- [ ] Nutrition inputs: All 6 fields functional
- [ ] Tag inputs: Comma-separated with visual chips
- [ ] Enum dropdowns: Show correct options
- [ ] Recipe list: Shows Edit and Delete buttons
- [ ] "Show Deleted" toggle filters list correctly
- [ ] Edit page: Pre-populates with existing data
- [ ] Edit page: Update saves changes and redirects
- [ ] Delete dialog: Requires typing recipe name to confirm
- [ ] Delete: Recipe disappears from list after deletion
- [ ] Details panel: Shows all 27 fields formatted

### Data Integrity
- [ ] Created recipe appears in list
- [ ] Edited recipe shows updated values
- [ ] Deleted recipe has `deleted_at` set in database
- [ ] Deleted recipe hidden from default list view
- [ ] Photo metadata fields remain read-only
- [ ] `updated_at` automatically updates on edit
- [ ] Embedding queue automatically triggered on create/update

## Critical Files Reference

### Files to CREATE (8 files):
1. `lib/recipe-types.ts` - Type definitions
2. `app/api/admin/recipes/[id]/route.ts` - Single recipe API
3. `app/admin/recipes/[id]/edit/page.tsx` - Edit form page
4. `app/admin/components/RecipeFormTabs.tsx` - Tab wrapper
5. `app/admin/components/IngredientsList.tsx` - Ingredient inputs
6. `app/admin/components/StepsList.tsx` - Steps inputs
7. `app/admin/components/TagInput.tsx` - Tag input with chips
8. `app/admin/components/DeleteRecipeDialog.tsx` - Delete confirmation

### Files to MODIFY (3 files):
1. `lib/database.types.ts` - Add missing 18 fields, fix field names
2. `app/admin/page.tsx` - Update form, add edit/delete buttons, enhance details
3. `app/api/admin/recipes/route.ts` - Add filtering, update POST to handle all fields

## Security Considerations

- All API routes require `requireSession()` authentication
- Use service role key for admin operations (bypass RLS)
- Validate all input server-side (don't trust client)
- Sanitize text inputs to prevent XSS
- Soft-delete preserves data for audit trail
- Photo moderation fields prevent inappropriate content

## Performance Considerations

- Don't fetch `embedding` field in list view (large 1536-dimension vector)
- Use Supabase `.select()` to fetch only needed fields
- Add pagination if recipe list grows large (>100 recipes)
- Debounce tag input validation
- Lazy load form tab content

## Implementation Sequence

**Phase 1: Foundation (Types & API)**
1. Create `lib/recipe-types.ts`
2. Update `lib/database.types.ts`
3. Update `app/api/admin/recipes/route.ts` (GET filtering, POST all fields)
4. Create `app/api/admin/recipes/[id]/route.ts` (GET, PATCH, DELETE)

**Phase 2: Form Components**
5. Create `IngredientsList.tsx`
6. Create `StepsList.tsx`
7. Create `NutritionInputs.tsx` (if needed for structured input)
8. Create `TagInput.tsx`
9. Create `DeleteRecipeDialog.tsx`

**Phase 3: Create Form Enhancement**
10. Update `app/admin/page.tsx` create form with tabs and all fields

**Phase 4: Edit & Delete Features**
11. Create `app/admin/recipes/[id]/edit/page.tsx`
12. Add Edit button to `app/admin/page.tsx` recipe list
13. Add Delete button and integrate `DeleteRecipeDialog`

**Phase 5: List & Details Enhancement**
14. Add "Show Deleted" toggle to `app/admin/page.tsx`
15. Update recipe details panel to show all 27 fields

**Phase 6: Polish & Test**
16. Add loading states, error handling
17. Test all CRUD operations end-to-end
18. Verify data integrity in database

## Success Criteria

✅ All 27 database fields accessible in admin interface
✅ Create recipe with full data set
✅ Edit existing recipes (separate page)
✅ Delete recipes with confirmation (soft-delete)
✅ View all recipe details (organized display)
✅ Toggle visibility of deleted recipes
✅ Type-safe throughout (TypeScript)
✅ Field name consistency (`recipe_name` everywhere)
✅ JSONB fields have structured input (not raw JSON)
✅ Validation prevents invalid data
