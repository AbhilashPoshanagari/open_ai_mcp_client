# Advanced UI Features

The chatbot supports rich, interactive layouts within conversations through a structured layout system.

### Layout System

Each message can contain multiple layouts of different types:

```typescript
export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  layouts?: Layout[]; // Optional array of interactive layouts
}
```

### Available Layout Types

#### 1. **Table Layout**
Display structured tabular data with customizable columns and rows.

**Format:**
```typescript
{
  "type": "table",
  "data": {
    "table_name": string,
    "column_names": string[],
    "data": Array<Array<number | string | boolean>>
  }
}
```
**Example:**
```typescript
    {
      type: 'table',
      data: {
        table_name: 'Analysis Results',
        column_names: ['ID', 'Name', 'Value'],
        data: [
          ['1', 'Result A', 42],
          ['2', 'Result B', 87]
        ]
      }
    }
```

**Example Usage:**
- Display query results
- Show comparative data
- Present structured information

#### 2. **Button Layout**
Add clickable action buttons with links or deep links.

**Format:**
```typescript
{
  "type": "button",
  "data": {
    "title": string,
    "link": string,
    "deeplink": string (optional)
  }
}
```

**Example:**
```typescript
      {"type": "button",
        "data": {
                    "title": "Location",
                    "link": f"https://www.google.com/maps/search/?api=1&query={centerSchema.center}",
              }
        }
```

**Example Usage:**
- External navigation to maps, documents, or applications
- Quick action triggers
- Deep linking to mobile apps

#### 3. **Map Layout**
Visualize geospatial data using Leaflet maps with multiple layers and features.

**Format:**
```typescript
{
  "type": "map",
  "data": {
    "features": FeatureDetail[], // Optional
    "wmsLayers": WMSLayer[], // Optional
    "center": [number, number], // Optional
    "zoom": number, // Optional
    "title": string, // Optional
    "height": string // Optional
  }
}
```
## Map Layout JSON Structure

```json
{
  "type": "map",
  "data": {
    "features": [
      {
        "id": "string",
        "name": "string",
        "type": "string",
        "coordinates": [number, number],
        "properties": {
          "key1": "value1",
          "key2": "value2"
        },
        "style": {
          "color": "string",
          "fillColor": "string",
          "radius": number,
          "fillOpacity": number
        }
      }
    ],
    "center": [number, number],
    "zoom": number,
    "wmsLayers": [  // Optional
      {
        "url": "string",
        "layers": "string",
        "version": "string",
        "format": "string",
        "transparent": boolean,
        "attribution": "string",
        "opacity": number
      }
    ],
    "title": "string",  // Optional
    "height": "string"  // Optional
  }
}
```

## Required Fields
- `type`: Must be `"map"`
- `data.features`: Array of geospatial features
- `data.features[].id`: Unique identifier for the feature
- `data.features[].name`: Display name
- `data.features[].type`: Feature type classification
- `data.features[].coordinates`: [longitude, latitude] array
- `data.features[].properties`: Dynamic key-value metadata

## Optional Fields
- `data.features[].style`: Visual styling options
- `data.center`: Initial map center [lng, lat]
- `data.zoom`: Initial zoom level (0-18)
- `data.wmsLayers`: WMS (Web Map Service) layers
- `data.title`: Map title display
- `data.height`: Custom map height (e.g., "400px")

## Generic Example Use Case: Store Locator

**Scenario:** A chatbot helps users find nearby coffee shops and displays them on an interactive map.

```json
{
  "type": "map",
  "data": {
    "title": "Nearby Coffee Shops",
    "features": [
      {
        "id": "shop_1",
        "name": "Brew & Bean",
        "type": "Coffee Shop",
        "coordinates": [-73.9857, 40.7484],
        "properties": {
          "address": "123 Main St, New York, NY",
          "rating": 4.5,
          "hours": "7am-9pm",
          "phone": "(555) 123-4567",
          "specialty": "Artisanal Pour-Over"
        },
        "style": {
          "color": "#8B4513",
          "fillColor": "#D2691E",
          "radius": 12,
          "fillOpacity": 0.7
        }
      },
      {
        "id": "shop_2",
        "name": "Urban Roast",
        "type": "Coffee Shop",
        "coordinates": [-73.9821, 40.7523],
        "properties": {
          "address": "456 Broadway, New York, NY",
          "rating": 4.2,
          "hours": "6am-10pm",
          "phone": "(555) 987-6543",
          "specialty": "Cold Brew"
        },
        "style": {
          "color": "#654321",
          "fillColor": "#8B4513",
          "radius": 10,
          "fillOpacity": 0.7
        }
      }
    ],
    "center": [-73.9857, 40.7484],
    "zoom": 14,
    "height": "450px",
    "wmsLayers": [
      {
        "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        "layers": "osm",
        "attribution": "© OpenStreetMap contributors"
      }
    ]
  }
}
```

## Real-World Applications

1. **Emergency Response**: Show emergency shelters, hospitals, and evacuation routes
2. **Real Estate**: Display property listings with price, bedrooms, and amenities
3. **Logistics**: Track delivery vehicles with real-time status and ETA
4. **Field Operations**: Mark inspection points, assets, and maintenance locations
5. **Tourism**: Highlight attractions, restaurants, and hotels with visitor info

The map layout provides rich geospatial visualization with customizable markers, tooltips, and interactive layers, making it ideal for location-based applications within the chatbot interface.


**Supported Features:**
- Custom markers and polygons
- WMS (Web Map Service) layers
- Interactive feature properties
- Custom styling options

#### 4. **Form Layout**
Interactive forms for data collection with various input types and form actions.

## Form Layout Specification

### Complete Form Structure

```typescript
{
  "type": "form",
  "data": {
    "title": string,                      // Form title displayed to user
    "schema": FormSchema,                  // Form field definitions and structure
    "metadata": {                          // Form metadata (optional)
      "form_id": string,                   // Unique form identifier
      "form_name": string,                 // Display name of the form
      "createdBy": string,                 // Creator information
      "version": string,                   // Form version
      "description": string,               // Form description
      "totalFields": number,               // Count of form fields
      "comment": string                    // Additional comments (optional)
    },
    "actions": FormActions                 // Action button definitions
  }
}
```

### Form Schema Structure

The form schema follows a structured format compatible with the frontend elicitation component:

```typescript
{
  "formWidgets": FormWidget[],            // Array of form field widgets
  "isCurrentVersion": boolean,            // Version status
  "formInfo": FormInfo,                   // Form metadata
  "referenceList": any[],                 // Reference data (optional)
  "recordInformation": any[]              // Pre-filled data (optional)
}
```

### Form Widget Types

The system supports the following form widget types:

```typescript
export enum WidgetType {
  TEXTBOX = "textBox",        // Single-line text input
  STATUS = "status",          // Status indicator field
  DROPDOWN = "dropdown",      // Select dropdown with options
  CHECKBOX = "checkbox",      // Checkbox for boolean values
  RADIO = "radio",            // Radio button group
  TEXTAREA = "textarea",      // Multi-line text input
  NUMBER = "number",          // Numeric input
  DATE = "date",              // Date picker
  EMAIL = "email"             // Email input with validation
}
```

### Form Widget Properties

Each widget includes the following properties:

```typescript
{
  "id": string,                          // Unique field identifier
  "label": string,                       // Display label
  "isRequired": boolean | string,        // Field requirement
  "placeholder": string,                 // Input placeholder text
  "defaultValue": string,                // Pre-filled value
  "minLength": string | number | null,   // Minimum length (text fields)
  "maxLength": string | number | null,   // Maximum length (text fields)
  "type": WidgetType,                    // Widget type from enum
  "isUnderHeading": string,              // Section grouping
  "isDependentField": boolean,           // Dependency flag
  "disabled": string,                    // Disabled state
  "displayName": string,                 // Alternative display name
  "options": Option[],                   // Options for dropdown/radio
  "position": number                     // Display order
}
```

### Dropdown/Radio Options Format

```typescript
{
  "displayValue": string,                // Text shown to user
  "value": string                       // Internal value
}
```

## Action Button Requirements

### Form Actions Structure

The `actions` object defines the behavior of form submission and cancellation:

```typescript
{
  "actions": {
    "submit": FormAction,                // Submit button configuration
    "cancel": FormAction                 // Cancel button configuration
  }
}
```

### Form Action Specification

Each action must follow this exact structure:

```typescript
{
  "type": "tool" | "cancel" | "custom",  // Action type
  "title": string,                       // Button display text
  "tool_name": string,                   // MCP tool name (required for "tool" type)
  "description": string,                 // Action description
  "params": {                            // Parameters for the action
    [key: string]: {                     // Parameter name
      "type": "json" | "metadata" | "form_data",  // Parameter type
      "field"?: string                   // Field reference (for "metadata" type)
    }
  }
}
```

### Action Types Explained

#### 1. **Tool Actions** (`type: "tool"`)
- Triggers an MCP tool execution
- **Required field**: `tool_name` specifying which MCP tool to call
- Parameters are passed to the tool
- Example: Submitting form data to a backend service

```typescript
"submit": {
  "type": "tool",
  "title": "Submit",
  "tool_name": "add_record",            // Must match an available MCP tool
  "description": "Submit form data",
  "params": {
    "form_data": { "type": "json" },    // Form data as JSON
    "form_id": { 
      "type": "metadata",               // Reference to form metadata
      "field": "form_id" 
    }
  }
}
```

#### 2. **Cancel Actions** (`type: "cancel"`)
- Closes the form without submission
- No tool execution
- Minimal configuration required

```typescript
"cancel": {
  "type": "cancel",
  "title": "Cancel",
  "description": "Cancel form submission"
}
```

#### 3. **Custom Actions** (`type: "custom"`)
- Custom behavior defined by frontend
- Can trigger UI changes or custom functions
- Requires frontend handler implementation

### Parameter Types

#### `"json"` Type
- Passes the complete form data as a JSON object
- Typically used for `form_data` parameter
- Automatically collects all form field values

#### `"metadata"` Type
- References values from the form's metadata object
- Requires a `field` property specifying which metadata field to use
- Example: `"field": "form_id"` extracts `metadata.form_id`

#### `"form_data"` Type
- Similar to `"json"` but with specific data extraction
- Can target specific form fields
- Not commonly used in current implementation

### Complete Form Example

```javascript
{
  "type": "form",
  "data": {
    "title": "User Registration",
    "schema": {
      "formWidgets": [
        {
          "id": "name",
          "label": "Full Name",
          "type": "textBox",
          "isRequired": true,
          "placeholder": "Enter your name"
        },
        {
          "id": "email",
          "label": "Email Address",
          "type": "email",
          "isRequired": true,
          "placeholder": "user@example.com"
        }
      ],
      "formInfo": {
        "name": "User Registration Form",
        "version": "1.0"
      }
    },
    "metadata": {
      "form_id": "form_12345",
      "form_name": "User Registration",
      "createdBy": "system",
      "version": "1.0",
      "description": "Register new users",
      "totalFields": 2,
      "comment": "Required for system access"
    },
    "actions": {
      "submit": {
        "type": "tool",
        "title": "Register User",
        "tool_name": "create_user_record",
        "description": "Submit registration form",
        "params": {
          "user_data": {
            "type": "json"
          },
          "registration_form_id": {
            "type": "metadata",
            "field": "form_id"
          },
          "form_version": {
            "type": "metadata",
            "field": "version"
          }
        }
      },
      "cancel": {
        "type": "cancel",
        "title": "Cancel Registration",
        "description": "Cancel user registration"
      }
    }
  }
}
```

## Data Format Validation

All layout data must adhere to the specified TypeScript interfaces. The frontend includes validation to ensure:

### Form Validation Rules
1. **Required Fields for Forms**:
   - `type` must be exactly `"form"`
   - `data.title` must be a non-empty string
   - `data.schema` must contain valid form structure
   - `data.actions.submit` must be properly configured
   - `data.actions.cancel` must be present

2. **Action Button Requirements**:
   - Submit action must have `type: "tool"`
   - Submit action must include `tool_name` matching an available MCP tool
   - Cancel action must have `type: "cancel"`
   - All parameters must have valid `type` values
   - Metadata references must exist in the form metadata

3. **Schema Validation**:
   - All form widgets must have unique `id` values
   - Required fields must be marked with `isRequired: true`
   - Widget types must match the `WidgetType` enum
   - Options arrays must be provided for dropdown/radio widgets

## Usage Examples

### Basic Chat
```javascript
// Simple text conversation
const message = {
  role: 'user',
  content: 'Hello, can you help me analyze this data?'
};
```

### Interactive Form with Actions
```javascript
// Message with interactive form and tool actions
const messageWithForm = {
  role: 'bot',
  content: 'Please fill out the registration form:',
  layouts: [
    {
      type: 'form',
      data: {
        title: 'Employee Registration',
        schema: {
          formWidgets: [
            {
              id: 'employee_id',
              label: 'Employee ID',
              type: 'textBox',
              isRequired: true,
              placeholder: 'Enter employee ID'
            }
          ],
          formInfo: { name: 'Employee Registration', version: '2.1' }
        },
        metadata: {
          form_id: 'emp_reg_2024',
          form_name: 'Employee Registration',
          createdBy: 'HR System',
          version: '2.1',
          totalFields: 1
        },
        actions: {
          submit: {
            type: 'tool',
            title: 'Register Employee',
            tool_name: 'hr_create_employee',
            description: 'Submit employee registration',
            params: {
              employee_data: { type: 'json' },
              form_identifier: { 
                type: 'metadata', 
                field: 'form_id' 
              }
            }
          },
          cancel: {
            type: 'cancel',
            title: 'Cancel',
            description: 'Cancel registration'
          }
        }
      }
    }
  ]
};
```

## Error Handling

### Common Form Errors
1. **Missing Tool Name**: Submit action requires `tool_name` for type: "tool"
2. **Invalid Parameter Type**: Parameters must be "json", "metadata", or "form_data"
3. **Missing Metadata Field**: Referenced metadata field must exist
4. **Invalid Widget Type**: Form widgets must use valid `WidgetType` values

### Validation Feedback
- Frontend validation provides specific error messages
- Invalid forms are displayed with error indicators
- Users can correct invalid data before submission

### Form Limitations
- Form actions only support `tool` and `cancel` types
- Custom action types require frontend implementation
- Complex form dependencies may require custom validation

## Development Notes

### Adding New Action Types
1. Update the `FormAction` interface in `message.model.ts`
2. Implement frontend handler for the new action type
3. Update validation logic
4. Document the new action type in this README
