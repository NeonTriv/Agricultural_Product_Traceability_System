# Process Step Foreign Key Correction

## Issue Discovered
The `PROCESS_STEP` table was incorrectly implemented with FK relationship to `PROCESSING_FACILITY` instead of `PROCESSING`.

### Incorrect Understanding (Before):
- Process Steps belonged to Facilities
- `PROCESS_STEP.P_ID → PROCESSING_FACILITY.ID`
- UI showed: Select facility → Add generic steps for that facility

### Correct Understanding (After):
- **Process Steps belong to Processing Operations**
- **`PROCESS_STEP.P_ID → PROCESSING.ID`**
- UI flow: Create processing operation → Add specific steps for that operation

---

## Database Schema
```sql
-- PROCESS_STEP table (composite primary key)
CREATE TABLE PROCESS_STEP (
    P_ID INT NOT NULL,           -- FK to PROCESSING (not PROCESSING_FACILITY!)
    Step NVARCHAR(100) NOT NULL,
    PRIMARY KEY (P_ID, Step),
    FOREIGN KEY (P_ID) REFERENCES PROCESSING(ID) ON DELETE CASCADE
);
```

**Key Point**: Process steps track the sequence of operations performed during a specific processing event (PROCESSING record), not generic capabilities of a facility.

---

## Files Corrected

### 1. Database Schema Comment
**File**: `database/BTL_LEADER_SCHEMA.sql`

**Change**:
```sql
-- OLD: Process Step phụ thuộc vào Facility
-- NEW: Process Step phụ thuộc vào PROCESSING (các bước của một lần chế biến)
```

Confirmed FK: `FOREIGN KEY (P_ID) REFERENCES PROCESSING(ID)`

---

### 2. Backend Entity
**File**: `backend/src/trace/entities/process-step.entity.ts`

**Changes**:
- Import changed: `ProcessingFacility` → `Processing`
- Field renamed: `facilityId` → `processingId`
- Relationship updated:
  ```typescript
  @ManyToOne(() => Processing)
  @JoinColumn({ name: 'P_ID' })
  processing: Processing;

  @PrimaryColumn()
  processingId: number;  // References PROCESSING.ID
  ```

---

### 3. Backend Service
**File**: `backend/src/trace/processing.service.ts`

**Changes**:

#### `getAllProcessSteps()`
```typescript
// OLD relations: ['facility']
// NEW relations: ['processing', 'processing.facility', 'processing.batch']

// Returns: processingId, step, facilityName (via processing.facility), batchId
```

#### `createProcessStep(data: { processingId, step })`
```typescript
// OLD: Validated against facilityRepo
// NEW: Validates against processingRepo
const processing = await this.processingRepo.findOne({ where: { id: processingId } });
if (!processing) throw new NotFoundException('Processing operation not found');
```

#### `deleteProcessStep(processingId, step)`
```typescript
// OLD: delete({ facilityId, step })
// NEW: delete({ processingId, step })
```

---

### 4. Backend Controller
**File**: `backend/src/trace/processing.controller.ts`

**Changes**:
```typescript
// POST body
@Body() body: {
  processingId: number;  // Changed from facilityId
  step: string;
}

// DELETE route parameters
@Delete('process-steps/:processingId/:step')  // Changed from :facilityId
async deleteProcessStep(
  @Param('processingId') processingId: string,
  @Param('step') step: string
)
```

---

### 5. Frontend Component
**File**: `frontend/src/components/ProcessingTab.tsx`

**Interface Changes**:
```typescript
// OLD
interface ProcessStep {
  facilityId: number;
  step: string;
  facilityName?: string;
}

// NEW
interface ProcessStep {
  processingId: number;  // Changed
  step: string;
  facilityName?: string;
  batchId?: number;       // Added (from processing.batch)
}
```

**State Changes**:
```typescript
// OLD
const [stepFormData, setStepFormData] = useState({ facilityId: '', step: '' });

// NEW
const [stepFormData, setStepFormData] = useState({ processingId: '', step: '' });
```

**Form Changes**:
- Label: "Facility *" → "Processing Operation *"
- Dropdown: Shows operations list (with facility + batch context) instead of facilities
- Options format: `#{operation.id} - {facility} ({product/batch})`

**Table Display**:
Now shows 4 columns to provide full context:
1. **Operation ID** - The processing operation this step belongs to
2. **Facility** - Which facility performed this operation
3. **Batch** - Which batch was processed
4. **Step** - The actual step description

**Handler Changes**:
```typescript
// OLD: handleStepSubmit sends { facilityId, step }
// NEW: handleStepSubmit sends { processingId, step }

// OLD: handleDeleteStep(facilityId, step)
// NEW: handleDeleteStep(processingId, step)

// OLD: DELETE /api/processing/process-steps/{facilityId}/{step}
// NEW: DELETE /api/processing/process-steps/{processingId}/{step}
```

---

## Data Flow (Corrected)

### Creating Process Steps:
1. User goes to **Processing Operations** tab
2. Creates a processing operation (selects facility + batch, enters packaging details)
3. Goes to **Process Steps** tab
4. Selects the **processing operation** from dropdown
5. Adds steps specific to that operation (e.g., "Washing", "Cutting", "Packaging")

### Viewing Process Steps:
Table displays:
```
| Operation ID | Facility        | Batch      | Step        | Actions |
|-------------|-----------------|------------|-------------|---------|
| #5          | Central Factory | Batch 12   | Washing     | Delete  |
| #5          | Central Factory | Batch 12   | Cutting     | Delete  |
| #6          | North Facility  | Batch 15   | Sorting     | Delete  |
```

---

## Database Relationships (Corrected)

```
COUNTRY (ID)
  └─→ PROVINCE (C_ID)
        └─→ PROCESSING_FACILITY (P_ID)
              └─→ PROCESSING (Facility_ID)
                    └─→ PROCESS_STEP (P_ID) ← Composite PK: (P_ID, Step)
              
BATCH (ID)
  └─→ PROCESSING (Batch_ID)
```

**Key Insight**: `PROCESS_STEP` tracks the workflow of a specific processing event, not the general capabilities of a facility. Each processing operation may have different steps depending on the product, batch requirements, etc.

---

## Testing Checklist

- [x] Backend compiles without errors
- [x] Frontend compiles without TypeScript errors
- [ ] Create a processing operation
- [ ] Add multiple steps to that operation
- [ ] Verify steps display with correct operation/facility/batch context
- [ ] Delete a step
- [ ] Verify cascade delete (deleting operation should remove its steps)

---

## Migration Notes

If there is existing test data with the old structure:
1. Export any existing PROCESS_STEP data
2. Clear PROCESS_STEP table
3. Manually recreate steps with correct processingId values
4. Verify data integrity with the new FK constraint

---

**Corrected By**: GitHub Copilot  
**Date**: 2024  
**Impact**: Backend entity, service, controller + Frontend UI/UX
