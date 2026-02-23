# Form Builder API Documentation

## Overview
Complete REST API for dynamic form builder system with full CRUD operations for form templates and field definitions.

## Authentication
All endpoints require JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
http://localhost:5003/api/forms
```

---

## Form Template Endpoints

### 1. Create Form Template
**POST** `/api/forms`

**Request Body:**
```json
{
  "name": "Customer Registration Form",
  "description": "Form for collecting customer information",
  "tenantId": "tenant-123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Form template created successfully",
  "data": {
    "id": "clz123abc",
    "name": "Customer Registration Form",
    "description": "Form for collecting customer information",
    "version": 1,
    "status": "DRAFT",
    "createdBy": 1,
    "createdAt": "2026-02-17T10:00:00Z",
    "updatedAt": "2026-02-17T10:00:00Z",
    "tenantId": "tenant-123",
    "fieldCount": 0
  }
}
```

---

### 2. List All Forms (with Pagination)
**GET** `/api/forms?page=1&limit=10&status=DRAFT&tenantId=tenant-123`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (DRAFT, PUBLISHED, ARCHIVED)
- `tenantId` (optional): Filter by tenant

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clz123abc",
      "name": "Customer Registration Form",
      "description": "Form for collecting customer information",
      "version": 1,
      "status": "DRAFT",
      "createdBy": 1,
      "createdAt": "2026-02-17T10:00:00Z",
      "updatedAt": "2026-02-17T10:00:00Z",
      "tenantId": "tenant-123",
      "fieldCount": 5
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 3. Get Form with Fields
**GET** `/api/forms/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clz123abc",
    "name": "Customer Registration Form",
    "description": "Form for collecting customer information",
    "version": 1,
    "status": "DRAFT",
    "createdBy": 1,
    "createdAt": "2026-02-17T10:00:00Z",
    "updatedAt": "2026-02-17T10:00:00Z",
    "tenantId": "tenant-123",
    "fieldCount": 2,
    "fields": [
      {
        "id": "field123",
        "formId": "clz123abc",
        "fieldName": "firstName",
        "fieldType": "TEXT",
        "required": true,
        "order": 1,
        "validation": {
          "minLength": 2,
          "maxLength": 50
        },
        "uiProperties": {
          "placeholder": "Enter first name",
          "helpText": "Your first name"
        },
        "options": null,
        "createdAt": "2026-02-17T10:00:00Z",
        "updatedAt": "2026-02-17T10:00:00Z"
      }
    ]
  }
}
```

---

### 4. Update Form Template
**PUT** `/api/forms/:id`

**Request Body:**
```json
{
  "name": "Updated Form Name",
  "description": "Updated description",
  "status": "PUBLISHED"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Form template updated successfully",
  "data": {
    "id": "clz123abc",
    "name": "Updated Form Name",
    "description": "Updated description",
    "version": 1,
    "status": "PUBLISHED",
    "createdBy": 1,
    "createdAt": "2026-02-17T10:00:00Z",
    "updatedAt": "2026-02-17T10:05:00Z",
    "tenantId": "tenant-123",
    "fieldCount": 2
  }
}
```

---

### 5. Archive Form Template
**DELETE** `/api/forms/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Form template archived successfully",
  "data": {
    "id": "clz123abc",
    "status": "ARCHIVED"
  }
}
```

---

## Field Definition Endpoints

### 6. Add Field to Form
**POST** `/api/forms/:id/fields`

**Request Body:**
```json
{
  "fieldName": "email",
  "fieldType": "TEXT",
  "required": true,
  "order": 2,
  "validation": {
    "pattern": "^[^@]+@[^@]+\\.[^@]+$",
    "minLength": 5
  },
  "uiProperties": {
    "placeholder": "Enter your email",
    "type": "email",
    "helpText": "We'll never share your email"
  },
  "options": null
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Field added to form successfully",
  "data": {
    "id": "field456",
    "formId": "clz123abc",
    "fieldName": "email",
    "fieldType": "TEXT",
    "required": true,
    "order": 2,
    "validation": {
      "pattern": "^[^@]+@[^@]+\\.[^@]+$",
      "minLength": 5
    },
    "uiProperties": {
      "placeholder": "Enter your email",
      "type": "email",
      "helpText": "We'll never share your email"
    },
    "options": null,
    "createdAt": "2026-02-17T10:00:00Z",
    "updatedAt": "2026-02-17T10:00:00Z"
  }
}
```

---

### 7. Update Field Definition
**PUT** `/api/forms/:formId/fields/:fieldId`

**Request Body:**
```json
{
  "fieldName": "email_address",
  "required": true,
  "validation": {
    "pattern": "^[^@]+@[^@]+\\.[^@]+$"
  },
  "uiProperties": {
    "placeholder": "your@email.com"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Field updated successfully",
  "data": {
    "id": "field456",
    "formId": "clz123abc",
    "fieldName": "email_address",
    "fieldType": "TEXT",
    "required": true,
    "order": 2,
    "validation": {
      "pattern": "^[^@]+@[^@]+\\.[^@]+$"
    },
    "uiProperties": {
      "placeholder": "your@email.com"
    },
    "options": null,
    "createdAt": "2026-02-17T10:00:00Z",
    "updatedAt": "2026-02-17T10:15:00Z"
  }
}
```

---

### 8. Delete Field from Form
**DELETE** `/api/forms/:formId/fields/:fieldId`

**Response (200):**
```json
{
  "success": true,
  "message": "Field deleted successfully",
  "data": {
    "id": "field456"
  }
}
```

---

## Field Types
- `TEXT` - Single line text input
- `NUMBER` - Numeric input
- `DROPDOWN` - Select from predefined options
- `DATE` - Date picker
- `BOOLEAN` - Checkbox/toggle

## Form Statuses
- `DRAFT` - Form is being created/edited
- `PUBLISHED` - Form is published and ready to use
- `ARCHIVED` - Form is archived (soft delete)

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Form name is required and must be a non-empty string"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Form template not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create form template"
}
```

---

## Files Created

1. **src/types/formTypes.ts** - TypeScript interfaces and types
2. **src/controllers/formController.ts** - Business logic for all operations
3. **src/routes/formRoutes.ts** - API route definitions with authentication
4. **src/middleware/authMiddleware.ts** - JWT token verification utility

## Key Features

✅ **JWT Authentication** - All endpoints secured with token verification  
✅ **Type Safety** - Full TypeScript support with interfaces  
✅ **Pagination** - Built-in pagination for list endpoints  
✅ **Validation** - Input validation for all requests  
✅ **Error Handling** - Comprehensive error responses  
✅ **Soft Delete** - Archive instead of hard delete  
✅ **Multi-tenancy** - Support for multiple tenants  
✅ **JSON Storage** - Flexible JSON fields for validation and UI properties
