import React from 'react';
import { furniturePlacementExamples } from './AIModelContextProtocol';

/**
 * AI Furniture Placement Guide
 * 
 * This guide explains how to use AI commands to place furniture in your room simulation.
 * The system uses natural language processing to understand your requests and place
 * appropriate furniture models in the specified locations.
 */

// Example usage scenarios with explanations
export const furniturePlacementGuide = {
  basicUsage: {
    title: "基本使用方法 / Basic Usage",
    description: "You can use simple commands to place furniture in your room. The AI understands both English and Chinese.",
    examples: [
      {
        command: "Place a sofa in the center of the room",
        explanation: "This will find a sofa model and place it in the center of the room."
      },
      {
        command: "在房間中央放一張沙發",
        explanation: "This will do the same thing - place a sofa in the center of the room."
      }
    ]
  },
  
  positioningOptions: {
    title: "位置選項 / Positioning Options",
    description: "You can specify different positions in the room:",
    positions: [
      { name: "Center (中央)", example: "Place a coffee table in the center" },
      { name: "Corner (角落)", example: "Put a plant in the corner" },
      { name: "Wall (靠牆)", example: "Place a bookshelf against the wall" },
      { name: "Window (窗邊)", example: "Put a desk by the window" },
      { name: "Door (門邊)", example: "Add a shoe rack near the door" }
    ]
  },
  
  furnitureTypes: {
    title: "家具類型 / Furniture Types",
    description: "The system recognizes various furniture types:",
    categories: [
      { name: "Seating", items: ["sofa", "chair", "stool", "bench", "沙發", "椅子", "凳子"] },
      { name: "Tables", items: ["coffee table", "dining table", "desk", "side table", "桌子", "書桌", "餐桌"] },
      { name: "Storage", items: ["bookshelf", "cabinet", "wardrobe", "dresser", "書櫃", "櫃子", "衣櫃"] },
      { name: "Beds", items: ["bed", "bunk bed", "crib", "床", "睡床"] },
      { name: "Lighting", items: ["lamp", "floor lamp", "ceiling light", "燈", "落地燈", "吊燈"] },
      { name: "Decoration", items: ["plant", "rug", "artwork", "mirror", "植物", "地毯", "藝術品", "鏡子"] }
    ]
  },
  
  advancedUsage: {
    title: "進階用法 / Advanced Usage",
    examples: [
      {
        command: "Place a modern black sofa against the wall",
        explanation: "You can add descriptive adjectives to be more specific about the furniture you want."
      },
      {
        command: "在窗邊放一張木製餐桌和四張椅子",
        explanation: "You can request multiple pieces of furniture in a single command."
      },
      {
        command: "Create a reading corner with a comfortable chair and floor lamp",
        explanation: "You can describe functional areas and the AI will try to create appropriate arrangements."
      }
    ]
  },
  
  troubleshooting: {
    title: "疑難排解 / Troubleshooting",
    tips: [
      "If the AI doesn't place the exact furniture you want, try being more specific about the type or style.",
      "If furniture appears in an unexpected position, try using more precise location descriptions.",
      "The AI works best with clear, simple commands rather than complex requests.",
      "If a specific model isn't available, the AI will try to find the closest match based on the category."
    ]
  }
};

/**
 * How the AI Furniture Placement Works:
 * 
 * 1. The AI analyzes your natural language command to identify:
 *    - What furniture you want to place
 *    - Where you want to place it
 * 
 * 2. It searches through available 3D models to find matching furniture
 *    - First by exact name match
 *    - Then by category match if exact name isn't found
 * 
 * 3. It calculates the appropriate position in the room based on:
 *    - The location you specified (center, corner, wall, etc.)
 *    - The room dimensions
 * 
 * 4. It places the furniture with appropriate rotation:
 *    - Furniture against walls faces inward
 *    - Furniture by windows faces away from windows
 *    - Furniture by doors faces into the room
 * 
 * 5. The furniture is added to your room with default scaling
 */

// Component to display the furniture placement guide
const AIFurniturePlacementGuide = () => {
  return (
    <div className="ai-furniture-guide">
      <h1>AI Furniture Placement Guide</h1>
      
      <section>
        <h2>{furniturePlacementGuide.basicUsage.title}</h2>
        <p>{furniturePlacementGuide.basicUsage.description}</p>
        <ul>
          {furniturePlacementGuide.basicUsage.examples.map((example, index) => (
            <li key={index}>
              <code>{example.command}</code> - {example.explanation}
            </li>
          ))}
        </ul>
      </section>
      
      <section>
        <h2>{furniturePlacementGuide.positioningOptions.title}</h2>
        <p>{furniturePlacementGuide.positioningOptions.description}</p>
        <ul>
          {furniturePlacementGuide.positioningOptions.positions.map((position, index) => (
            <li key={index}>
              <strong>{position.name}</strong>: <code>{position.example}</code>
            </li>
          ))}
        </ul>
      </section>
      
      <section>
        <h2>{furniturePlacementGuide.furnitureTypes.title}</h2>
        <p>{furniturePlacementGuide.furnitureTypes.description}</p>
        {furniturePlacementGuide.furnitureTypes.categories.map((category, index) => (
          <div key={index}>
            <h3>{category.name}</h3>
            <p>{category.items.join(", ")}</p>
          </div>
        ))}
      </section>
      
      <section>
        <h2>{furniturePlacementGuide.advancedUsage.title}</h2>
        <ul>
          {furniturePlacementGuide.advancedUsage.examples.map((example, index) => (
            <li key={index}>
              <code>{example.command}</code> - {example.explanation}
            </li>
          ))}
        </ul>
      </section>
      
      <section>
        <h2>{furniturePlacementGuide.troubleshooting.title}</h2>
        <ul>
          {furniturePlacementGuide.troubleshooting.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </section>
      
      <section>
        <h2>Quick Examples</h2>
        <div>
          <h3>English</h3>
          <ul>
            {furniturePlacementExamples.english.map((example, index) => (
              <li key={index}><code>{example}</code></li>
            ))}
          </ul>
        </div>
        <div>
          <h3>中文</h3>
          <ul>
            {furniturePlacementExamples.chinese.map((example, index) => (
              <li key={index}><code>{example}</code></li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AIFurniturePlacementGuide; 