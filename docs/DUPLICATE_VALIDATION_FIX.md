# Duplicate Language Validation Fix

## Problem

The duplicate language validation was **global** instead of **project-specific**.

### Example of the Issue

1. User adds "English" (country: "USA") to project **"Kanz ul Irfan"** ✅
2. User tries to add "English" (country: "USA") to project **"Sirat ul Jinan"** ❌
3. Error: "Language already exists"

**Why this is wrong:** The same language should be allowed in different projects.

## Root Cause

The `createLanguage()` function checked for duplicates without considering `project_id`:

```typescript
// ❌ WRONG: Global duplicate check
const { data: existing } = await supabase
  .from("languages")
  .select("id")
  .ilike("language", input.language)
  .ilike("country", input.country)
  .maybeSingle();
```

This query would find ANY matching language+country combination across ALL projects.

## Solution

Updated the validation to check for duplicates **within the same project only**:

```typescript
// ✅ CORRECT: Project-specific duplicate check
const { data: existing } = await supabase
  .from("languages")
  .select("id")
  .eq("project_id", input.project_id)  // Added project filter
  .ilike("language", input.language)
  .ilike("country", input.country)
  .maybeSingle();
```

## Changes Made

### 1. `lib/supabase.ts` - `createLanguage()` function

**Before:**
```typescript
export async function createLanguage(input: CreateLanguageInput): Promise<Language | null> {
  try {
    // Check for duplicate language+country combination
    const { data: existing, error: checkError } = await supabase
      .from("languages")
      .select("id")
      .ilike("language", input.language)
      .ilike("country", input.country)
      .maybeSingle();

    if (existing) {
      throw new Error("Language already exists");
    }
    // ...
  }
}
```

**After:**
```typescript
export async function createLanguage(input: CreateLanguageInput): Promise<Language | null> {
  try {
    // Validate project_id is provided
    if (!input.project_id) {
      throw new Error("Project is required");
    }

    // Check for duplicate language+country combination within the same project
    const { data: existing, error: checkError } = await supabase
      .from("languages")
      .select("id")
      .eq("project_id", input.project_id)  // ← Added project filter
      .ilike("language", input.language)
      .ilike("country", input.country)
      .maybeSingle();

    if (existing) {
      throw new Error("Language already exists for this project");
    }
    // ...
  }
}
```

### 2. `app/actions/createLanguage.ts` - Error handling

**Before:**
```typescript
if (error instanceof Error && error.message === "Language already exists") {
  return { error: "Language already exists" };
}
```

**After:**
```typescript
if (error instanceof Error && error.message === "Language already exists for this project") {
  return { error: "This language already exists for the selected project" };
}
if (error instanceof Error && error.message === "Project is required") {
  return { error: "Project is required" };
}
```

## Validation Rules

### ✅ Allowed (No Duplicates)

| Project | Language | Country | Status |
|---------|----------|---------|--------|
| Kanz ul Irfan | English | USA | ✅ First occurrence |
| Sirat ul Jinan | English | USA | ✅ Different project |
| Taleem ul Quran | English | USA | ✅ Different project |

### ❌ Blocked (Duplicate Within Same Project)

| Project | Language | Country | Status |
|---------|----------|---------|--------|
| Kanz ul Irfan | English | USA | ✅ First occurrence |
| Kanz ul Irfan | English | USA | ❌ **Duplicate in same project** |

## Testing Scenarios

### Test 1: Add Same Language to Different Projects (Should Work)

```
1. Add: Project="Kanz ul Irfan", Language="English", Country="USA"
   Result: ✅ Success

2. Add: Project="Sirat ul Jinan", Language="English", Country="USA"
   Result: ✅ Success (different project)
```

### Test 2: Add Duplicate to Same Project (Should Fail)

```
1. Add: Project="Kanz ul Irfan", Language="English", Country="USA"
   Result: ✅ Success

2. Add: Project="Kanz ul Irfan", Language="English", Country="USA"
   Result: ❌ Error: "This language already exists for the selected project"
```

### Test 3: Add Different Language to Same Project (Should Work)

```
1. Add: Project="Kanz ul Irfan", Language="English", Country="USA"
   Result: ✅ Success

2. Add: Project="Kanz ul Irfan", Language="Urdu", Country="Pakistan"
   Result: ✅ Success (different language)
```

### Test 4: Add Same Language, Different Country to Same Project (Should Work)

```
1. Add: Project="Kanz ul Irfan", Language="English", Country="USA"
   Result: ✅ Success

2. Add: Project="Kanz ul Irfan", Language="English", Country="UK"
   Result: ✅ Success (different country)
```

## Database Schema

No database changes required. The existing schema already supports project-specific validation:

```sql
languages (
  id uuid PRIMARY KEY,
  language text NOT NULL,
  country text NOT NULL,
  project_id uuid REFERENCES projects(id) NOT NULL,
  -- ... other fields
)
```

## Performance

The query is optimized with the existing index:

```sql
-- Already created in performance indexes migration
CREATE INDEX idx_languages_project_id ON languages(project_id);
```

For even better performance on duplicate checks, consider adding a composite index:

```sql
CREATE INDEX IF NOT EXISTS idx_languages_project_language_country 
ON languages(project_id, language, country);
```

## Files Modified

1. **lib/supabase.ts**
   - Updated `createLanguage()` function
   - Added project_id validation
   - Changed duplicate check to include project_id
   - Updated error message

2. **app/actions/createLanguage.ts**
   - Updated error handling for new error messages
   - Added handling for "Project is required" error

## Migration Notes

- ✅ No database changes required
- ✅ No data migration needed
- ✅ Backward compatible with existing data
- ✅ Existing languages remain unchanged

## Error Messages

| Scenario | Error Message |
|----------|---------------|
| Missing project | "Project is required" |
| Duplicate in same project | "This language already exists for the selected project" |
| General error | "Failed to create language. Please try again." |

---

**Fixed:** 2026-03-06  
**Issue:** Global duplicate validation blocking same language in different projects  
**Status:** ✅ Resolved  
**Validation:** Project-specific (language + country + project_id)
