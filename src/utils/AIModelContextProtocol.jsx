import useSelectionStore from "../components/Store/Store";

/**
 * AI Command Parser - Converts AI text commands into app operations
 * @param {string} aiPrompt - AI text command
 * @returns {Object} - Operation result
 */
export const executeAITextureCommand = async (aiPrompt) => {
  try {
    // Get current state from store
    const store = useSelectionStore.getState();
    
    // 1. Check if there are preloaded textures
    if (!store.preloadedTextures || Object.keys(store.preloadedTextures).length === 0) {
      return {
        success: false,
        message: "No available materials"
      };
    }
    
    // 2. Parse AI command
    const parsedCommand = parseAITextureCommand(aiPrompt, store.preloadedTextures);
    
    // 3. Execute command
    if (parsedCommand.success) {
      const results = [];
      
      // Apply each specified material
      for (const action of parsedCommand.actions) {
        const { target, textureId } = action;
        
        // Confirm both target and texture are valid
        if (target && textureId && store.preloadedTextures[textureId]) {
          // Apply material
          store.setMaterialTexture(target, textureId);
          
          results.push({
            target,
            textureId,
            textureName: store.preloadedTextures[textureId].name || textureId,
            success: true
          });
        } else {
          results.push({
            target,
            textureId,
            success: false,
            reason: !target ? "Invalid target" : "Invalid texture ID"
          });
        }
      }
      
      return {
        success: true,
        message: `Successfully executed ${results.filter(r => r.success).length} material operations`,
        details: results
      };
    } else {
      return parsedCommand; // Return parsing error
    }
  } catch (error) {
    console.error("Error executing AI command:", error);
    return {
      success: false,
      message: `Error executing command: ${error.message}`
    };
  }
};

/**
 * Parse AI text command
 * @param {string} aiPrompt - AI text command
 * @param {Object} availableTextures - Available materials
 * @returns {Object} - Parsing result
 */
function parseAITextureCommand(aiPrompt, availableTextures) {
  try {
    // Initialize result
    const result = {
      success: false,
      actions: []
    };
    
    // Target mapping abbreviations
    const targetMapping = {
      '地板': 'floor', // floor
      '地面': 'floor', // ground
      '牆壁': 'wall', // wall (may need special handling to specify which wall)
      '牆': 'wall',    // wall
      '天花板': 'ceiling', // ceiling
      '頂棚': 'ceiling',   // ceiling
      '天頂': 'ceiling',   // ceiling top
      // English mappings
      'floor': 'floor',
      'ground': 'floor',
      'wall': 'wall',
      'ceiling': 'ceiling'
    };
    
    // Create a mapping from texture name to ID
    const textureNameToId = {};
    for (const [id, texture] of Object.entries(availableTextures)) {
      textureNameToId[texture.name?.toLowerCase() || id.toLowerCase()] = id;
    }
    
    // Extract target and texture from the command
    // For example: "Change floor to wooden floor, wall to white brick"
    
    // Find floor-related command
    const floorMatches = aiPrompt.match(/(?:地板|地面)(?:.*?)(?:改為|改成|設為|設成|用|使用|換成|換為|應用)(?:.*?)([^\s,，.。!！?？]+)/i);
    if (floorMatches && floorMatches[1]) {
      const textureName = floorMatches[1].toLowerCase();
      
      // Find matching texture ID
      let textureId = null;
      for (const [id, texture] of Object.entries(availableTextures)) {
        if (texture.name?.toLowerCase().includes(textureName) || id.toLowerCase().includes(textureName)) {
          textureId = id;
          break;
        }
      }
      
      if (textureId) {
        result.actions.push({
          target: 'floor',
          textureId: textureId
        });
      }
    }
    
    // Find wall-related command
    const wallMatches = aiPrompt.match(/(?:牆壁|牆)(?:.*?)(?:改為|改成|設為|設成|用|使用|換成|換為|應用)(?:.*?)([^\s,，.。!！?？]+)/i);
    if (wallMatches && wallMatches[1]) {
      const textureName = wallMatches[1].toLowerCase();
      
      // Find matching texture ID
      let textureId = null;
      for (const [id, texture] of Object.entries(availableTextures)) {
        if (texture.name?.toLowerCase().includes(textureName) || id.toLowerCase().includes(textureName)) {
          textureId = id;
          break;
        }
      }
      
      // Since walls may be multiple, we need to get all walls from roomData
      if (textureId) {
        const store = useSelectionStore.getState();
        if (store.roomData) {
          const wallKeys = Object.keys(store.roomData).filter(key => key.startsWith('wall-'));
          for (const wallKey of wallKeys) {
            result.actions.push({
              target: wallKey,
              textureId: textureId
            });
          }
        }
      }
    }
    
    // Find ceiling-related command
    const ceilingMatches = aiPrompt.match(/(?:天花板|頂棚|天頂)(?:.*?)(?:改為|改成|設為|設成|用|使用|換成|換為|應用)(?:.*?)([^\s,，.。!！?？]+)/i);
    if (ceilingMatches && ceilingMatches[1]) {
      const textureName = ceilingMatches[1].toLowerCase();
      
      // Find matching texture ID
      let textureId = null;
      for (const [id, texture] of Object.entries(availableTextures)) {
        if (texture.name?.toLowerCase().includes(textureName) || id.toLowerCase().includes(textureName)) {
          textureId = id;
          break;
        }
      }
      
      if (textureId) {
        result.actions.push({
          target: 'ceiling',
          textureId: textureId
        });
      }
    }
    
    // Check if any operation is found
    if (result.actions.length > 0) {
      result.success = true;
    } else {
      result.message = "Cannot identify valid material changes from command";
    }
    
    return result;
  } catch (error) {
    console.error("Error parsing AI command:", error);
    return {
      success: false,
      message: `Error parsing command: ${error.message}`
    };
  }
}

/**
 * Get information about all available materials
 * @returns {Array} - List of material information
 */
export const getAvailableTextures = () => {
  const store = useSelectionStore.getState();
  const textures = store.preloadedTextures || {};
  
  return Object.entries(textures).map(([id, texture]) => ({
    id,
    name: texture.name || id,
    description: texture.description || '',
    tags: texture.tags || [],
    price: texture.price || 0
  }));
}; 