# Post Constants

Single source of truth for post-related character limits.

## Constants

### `MAX_POST_TITLE_LENGTH = 250`

Maximum characters for post titles.

**Used in:** `WriteFreeformContent.tsx` (title field)

```typescript
import { MAX_POST_TITLE_LENGTH } from '../../../../constants/post';

<TextField maxLength={MAX_POST_TITLE_LENGTH} />
```

### `MAX_POST_COMMENTARY_LENGTH = 250`

Maximum characters for link commentary/descriptions.

**Used in:** `ShareLink.tsx` (commentary field + validation)

```typescript
import { MAX_POST_COMMENTARY_LENGTH } from '../../../constants/post';

// Validation
if (commentary.length > MAX_POST_COMMENTARY_LENGTH) return null;

// Component
<MarkdownInput maxInputLength={MAX_POST_COMMENTARY_LENGTH} />
```

## Notes

- **Backend sync required:** Keep these in sync with `daily-api` validation
- **Naming pattern:** `MAX_POST_[FIELD]_LENGTH`
