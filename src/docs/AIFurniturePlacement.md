# AI Furniture Placement Guide

This document explains how to use the AI-powered furniture placement feature in the Little Room Simulation application.

## Basic Usage

You can use natural language commands to place furniture in your room. The AI understands both English and Chinese commands.

### English Examples:

- "Place a sofa in the center of the room"
- "Put a coffee table near the sofa"
- "Add a lamp in the corner"
- "Place a bookshelf against the wall"
- "Put a dining table by the window"
- "Add a bed in the corner of the room"
- "Place a desk near the door"

### Chinese Examples:

- "在房間中央放一張沙發"
- "把一張咖啡桌放在沙發前面"
- "在角落放一盞落地燈"
- "靠牆放一個書櫃"
- "在窗邊放一張餐桌"
- "在房間角落放一張床"
- "在門邊放一張書桌"

## How It Works

When you enter a command, the AI:

1. Analyzes your request to identify:
   - What furniture you want to place
   - Where you want to place it

2. Searches through available 3D models to find matching furniture:
   - First by exact name match
   - Then by category match if exact name isn't found

3. Calculates the appropriate position in the room based on:
   - The location you specified (center, corner, wall, etc.)
   - The room dimensions

4. Places the furniture with appropriate rotation:
   - Furniture against walls faces inward
   - Furniture by windows faces away from windows
   - Furniture by doors faces into the room

## Positioning Options

You can specify different positions in the room:

- **Center (中央)**: "Place a coffee table in the center"
- **Corner (角落)**: "Put a plant in the corner"
- **Wall (靠牆)**: "Place a bookshelf against the wall"
- **Window (窗邊)**: "Put a desk by the window"
- **Door (門邊)**: "Add a shoe rack near the door"

## Furniture Types

The system recognizes various furniture types:

### Seating
sofa, chair, stool, bench, 沙發, 椅子, 凳子

### Tables
coffee table, dining table, desk, side table, 桌子, 書桌, 餐桌

### Storage
bookshelf, cabinet, wardrobe, dresser, 書櫃, 櫃子, 衣櫃

### Beds
bed, bunk bed, crib, 床, 睡床

### Lighting
lamp, floor lamp, ceiling light, 燈, 落地燈, 吊燈

### Decoration
plant, rug, artwork, mirror, 植物, 地毯, 藝術品, 鏡子

## Advanced Usage

You can make more specific requests:

- "Place a modern black sofa against the wall"
- "在窗邊放一張木製餐桌和四張椅子"
- "Create a reading corner with a comfortable chair and floor lamp"

## Troubleshooting

- If the AI doesn't place the exact furniture you want, try being more specific about the type or style.
- If furniture appears in an unexpected position, try using more precise location descriptions.
- The AI works best with clear, simple commands rather than complex requests.
- If a specific model isn't available, the AI will try to find the closest match based on the category.

## Code Example

```javascript
// Import the executeAIObjectCommand function
import { executeAIObjectCommand } from '../utils/AIModelContextProtocol';

// Example of using the AI to place furniture
async function placeFurnitureWithAI() {
  try {
    // Execute an AI command to place furniture
    const result = await executeAIObjectCommand("Place a sofa in the center of the room");
    
    if (result.success) {
      console.log("Furniture placed successfully!");
      console.log("Placed items:", result.details);
    } else {
      console.error("Failed to place furniture:", result.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
```

## Integration with UI

To integrate the AI furniture placement feature into your UI:

1. Create a text input field for the user to enter commands
2. When the user submits a command, call the `executeAIObjectCommand` function
3. Display the results to the user
4. Optionally, provide example commands that users can click to try

See the `AIFurniturePlacementExample.jsx` component for a complete example of how to implement this in your UI. 