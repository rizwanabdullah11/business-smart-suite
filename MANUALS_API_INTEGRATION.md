# Manuals Module - API Integration Guide

## Overview

This document outlines the complete API integration between the Next.js frontend and Node.js Express backend for the Manuals module, including Categories management.

## Architecture

### Frontend Structure

- **Frontend Framework**: Next.js 16.1.6 with TypeScript
- **UI Components**: React with Lucide Icons
- **State Management**: React Hooks
- **API Integration**: Server Actions + API Routes

### Backend Structure

- **Backend Framework**: Node.js Express
- **Database**: MongoDB (via connection string in .env)
- **API Base URL**: `http://localhost:5000/api`

## API Routes

### Server Actions (app/actions/manual-actions.ts)

Server-side actions that call the backend API:

- `addCategory(title)` - POST /categories
- `editCategory(categoryId, newTitle)` - PUT /categories/:id
- `addManual(categoryId, data)` - POST /manuals
- `toggleHighlight(id, type)` - PUT /manuals/:id (update highlight status)
- `approveManual(id)` - PUT /manuals/:id (set approved=true)
- `deleteItem(id, type)` - DELETE /categories/:id or /manuals/:id
- `archiveItem(id, type)` - PUT /categories/:id or /manuals/:id (set archived=true)
- `unarchiveItem(id, type)` - PUT /categories/:id or /manuals/:id (set archived=false)
- `reorderItem(id, type, direction)` - Placeholder for reordering logic

### API Routes

#### Categories

**GET /api/categories**
- Fetches all categories from backend
- Returns: Array of categories

**GET /api/categories/:id**
- Fetches a single category
- Returns: Category object

**POST /api/categories**
- Creates a new category
- Body: `{ name: string }`
- Returns: Created category object

**PUT /api/categories/:id**
- Updates a category
- Body: `{ name?: string, archived?: boolean, ... }`
- Returns: Updated category object

**DELETE /api/categories/:id**
- Deletes a category
- Returns: `{ success: true, message: "Category deleted" }`

#### Manuals

**GET /api/manuals**
- Fetches all manuals
- Returns: Array of manuals

**GET /api/manuals/:id**
- Fetches a single manual
- Returns: Manual object

**POST /api/manuals**
- Creates a new manual
- Body: `{ title, version, location, issueDate, category }`
- Returns: Created manual object

**PUT /api/manuals/:id**
- Updates a manual
- Body: `{ title?, version?, location?, issueDate?, highlighted?, approved?, ... }`
- Returns: Updated manual object

**DELETE /api/manuals/:id**
- Deletes a manual
- Returns: `{ success: true, message: "Manual deleted" }`

#### Entries

**POST /api/entries/move**
- Moves a manual to a different category/section
- Body: `{ entryId, currentSectionId, newSectionId, newCategoryId }`
- Returns: Success response with movement details

#### Sections

**GET /api/sections**
- Fetches list of all sections
- Returns: Array of section objects

#### Manuals Refresh

**GET /api/manuals/refresh**
- Combines categories and manuals, merges them, and separates archived items
- Returns: `{ categories, archivedCategories }`

## Data Models

### Category

```typescript
{
  _id: string (MongoDB ObjectId)
  name: string
  archived?: boolean
  highlighted?: boolean
  createdAt?: Date
  updatedAt?: Date
}
```

### Manual

```typescript
{
  _id: string (MongoDB ObjectId)
  title: string
  version: string
  issueDate: string (ISO date)
  location: string
  category: string (Reference to Category._id)
  highlighted?: boolean
  approved?: boolean
  archived?: boolean
  createdAt?: Date
  updatedAt?: Date
}
```

## Data Flow

### Fetching Manuals & Categories

1. Frontend calls `/api/manuals/refresh`
2. This API route fetches from backend:
   - GET `http://localhost:5000/api/categories`
   - GET `http://localhost:5000/api/manuals`
3. Data is merged (manuals grouped by category)
4. Categories are separated into active/archived
5. Response sent to frontend

### Creating a Category

1. User submits in UI
2. `addCategory(title)` server action is called
3. Server action makes POST request to `http://localhost:5000/api/categories`
4. Backend creates category in MongoDB
5. Frontend receives new category ID
6. `revalidatePath("/manual")` refreshes the page cache

### Creating a Manual

1. User submits in UI
2. `addManual(categoryId, data)` server action is called
3. Server action makes POST request to `http://localhost:5000/api/manuals`
4. Backend creates manual in MongoDB
5. Frontend receives new manual ID
6. Local state is updated with new manual

### Updating Manual (Approve, Highlight, etc.)

1. User clicks action button
2. Appropriate server action called (e.g., `approveManual(id)`)
3. Server action makes PUT request with updated fields
4. Backend updates document in MongoDB
5. Frontend optimistically updates state
6. Page is revalidated

## Configuration

### Environment Variables

In `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

This URL is used by all API routes to communicate with the Express backend.

### Authentication

If your backend requires authentication:
1. Token is retrieved from cookies or authorization header
2. Passed as `Authorization: Bearer <token>` header
3. Update `getHeaders()` function in server actions if needed

## Frontend Components

### ManualsClient

Main client component that displays:
- List of active categories with manuals
- List of archived categories with manuals
- Add category/manual dialogs
- Approve, highlight, archive, delete actions
- Drag-to-reorder functionality

### Manual Page

Server component that:
1. Fetches data from `/api/manuals/refresh`
2. Passes data to `ManualsClient` component
3. Handles server-side rendering

## Testing

### Manual Testing

1. Start backend server: `npm run dev` (in backend folder)
2. Start Next.js: `npm run dev` (in root)
3. Navigate to http://localhost:3000/manual
4. Test operations:
   - Create category
   - Create manual
   - Approve manual
   - Highlight manual
   - Archive manual
   - Delete manual
   - Move manual to different category

### API Testing

Use Postman or curl to test endpoints directly:

```bash
# Get all categories
curl http://localhost:5000/api/categories

# Create category
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Quality Management"}'

# Get all manuals
curl http://localhost:5000/api/manuals

# Create manual
curl -X POST http://localhost:5000/api/manuals \
  -H "Content-Type: application/json" \
  -d '{"title":"QM v1.0","version":"v1.0","location":"QMS","issueDate":"2024-02-09","category":"<CATEGORY_ID>"}'
```

## Error Handling

All API routes include error handling that:
1. Catches backend errors
2. Returns appropriate HTTP status codes
3. Includes error messages for debugging
4. Logs errors to console for monitoring

## Future Enhancements

1. **Token Management**: Implement proper JWT token handling with middleware
2. **Caching**: Add Redis caching for frequently accessed data
3. **Pagination**: Add pagination for large datasets
4. **Search**: Implement backend search for manuals
5. **Bulk Operations**: Support bulk actions on multiple items
6. **Version History**: Track changes to manuals over time
7. **Permissions**: Role-based access control (RBAC)

## Troubleshooting

### API Not Responding

**Problem**: Frontend getting 500 errors from API routes

**Solution**: 
- Ensure backend server is running: `npm start` (backend folder)
- Check `.env.local` has correct API_URL
- Check browser console for error details

### CORS Issues

**Problem**: Cross-origin request blocked

**Solution**:
- Backend should have CORS middleware enabled
- Frontend API routes proxy to backend, so no direct CORS issues expected

### Data Not Loading

**Problem**: Manuals/categories not appearing

**Solution**:
- Check MongoDB connection string in backend `MongoDB Connected Successfully`
- Verify data exists in MongoDB
- Check browser Network tab for failed requests
- Review backend logs for errors

## Related Files

- `/app/manual/page.tsx` - Main manual page
- `/app/manual/[id]/page.tsx` - Single manual view
- `/app/actions/manual-actions.ts` - Server actions
- `/components/manuals-client.tsx` - UI component
- `/app/api/manuals/` - Manual API routes
- `/app/api/categories/` - Category API routes
