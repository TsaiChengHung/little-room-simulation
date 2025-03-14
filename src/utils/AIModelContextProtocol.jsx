import useSelectionStore from "../components/Store/Store";

/**
 * AI Command Parser - Converts AI text commands into app operations
 * @param {string} aiPrompt - AI text command
 * @returns {Object} - Operation result
 */
export const executeAITextureCommand = async (aiPrompt) => {
  try {
    console.log("Processing AI texture command:", aiPrompt);
    
    // Get current state from store
    const store = useSelectionStore.getState();
    
    // 1. Check if there are preloaded textures
    if (!store.preloadedTextures || Object.keys(store.preloadedTextures).length === 0) {
      console.log("Error: No preloaded textures available");
      return {
        success: false,
        message: "No available materials"
      };
    }
    
    // Log available textures for debugging
    console.log("Available textures:", Object.keys(store.preloadedTextures).map(key => ({
      id: key,
      name: store.preloadedTextures[key].name
    })));
    
    // 2. Check if roomData is initialized
    if (!store.roomData) {
      console.log("Error: Room data not initialized");
      return {
        success: false,
        message: "Room data not initialized"
      };
    }
    
    // 1. First try direct texture specification mode
    let parsedCommand = parseDirectTextureCommand(aiPrompt, store.preloadedTextures);
    
    // 2. If direct mode failed, try style guidance mode
    if (!parsedCommand.success) {
      parsedCommand = await parseStyleGuidanceCommand(aiPrompt, store.preloadedTextures);
    }
    
    // 3. Execute command if parsing was successful
    if (parsedCommand.success) {
      const results = [];
      
      // Apply each specified material
      for (const action of parsedCommand.actions) {
        const { target, textureId } = action;
        
        // Confirm both target and texture are valid
        if (target && textureId && store.preloadedTextures[textureId]) {
          try {
            // Apply material using the store's setMaterialTexture method
            store.setMaterialTexture(target, textureId);
            
            // Log success for debugging
            console.log(`Successfully applied ${store.preloadedTextures[textureId].name} to ${target}`);
            
            results.push({
              target,
              textureId,
              textureName: store.preloadedTextures[textureId].name || textureId,
              success: true
            });
          } catch (error) {
            console.error(`Error applying texture to ${target}:`, error);
            results.push({
              target,
              textureId,
              success: false,
              reason: `Error applying texture: ${error.message}`
            });
          }
        } else {
          // Log invalid parameters
          console.log(`Invalid parameters - Target: ${target}, TextureId: ${textureId}, Exists: ${store.preloadedTextures[textureId] ? 'Yes' : 'No'}`);
          
          results.push({
            target,
            textureId,
            success: false,
            reason: !target ? "Invalid target" : 
                   !textureId ? "Invalid texture ID" : 
                   "Texture not found in preloaded textures"
          });
        }
      }
      
      return {
        success: true,
        message: `Successfully executed ${results.filter(r => r.success).length} material operations`,
        details: results,
        style: parsedCommand.style // Include style information if applicable
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
 * Direct Mode - Parse commands where user explicitly specifies surface and texture
 * @param {string} aiPrompt - AI text command
 * @param {Object} availableTextures - Available materials
 * @returns {Object} - Parsing result
 */
function parseDirectTextureCommand(aiPrompt, availableTextures) {
  try {
    console.log("Attempting direct texture command parsing:", aiPrompt);
    
    // Initialize result
    const result = {
      success: false,
      actions: []
    };
    
    // Normalize prompt - convert to lowercase for case-insensitive matching
    const normalizedPrompt = aiPrompt.toLowerCase();
    
    // Create an array of textures with normalized names for easier matching
    const textureArray = Object.entries(availableTextures).map(([id, texture]) => ({
      id,
      name: texture.name || id,
      nameLower: (texture.name || id).toLowerCase(),
      description: texture.description || "",
      descriptionLower: (texture.description || "").toLowerCase(),
      tags: texture.tags || []
    }));
    
    // Target surface definitions (with aliases)
    const surfaces = [
      { type: 'floor', keywords: ['地板', '地面', 'floor', 'ground', '底部', '樓板'] },
      { type: 'wall', keywords: ['牆壁', '牆', 'wall', '墻壁', '墙壁', '墙', '牆面', '壁面'] },
      { type: 'ceiling', keywords: ['天花板', '頂棚', '天頂', 'ceiling', '頂部', '顶部', '天花'] }
    ];
    
    // Special pattern for Chinese commands like "將牆壁材質改成 'dryWall'"
    // or "天花板和牆壁都用 'whiteAndGrayPaint'"
    for (const texture of textureArray) {
      // Look for patterns like: "將X改成'Y'" or "X都用'Y'" where Y is a texture ID
      const texturePatterns = [
        new RegExp(`將([^'"]*)(?:材質|)改成\\s*['"]${texture.id}['"]`, 'i'),
        new RegExp(`([^'"]*)(?:材質|)改成\\s*['"]${texture.id}['"]`, 'i'),
        new RegExp(`([^'"]*)都用\\s*['"]${texture.id}['"]`, 'i'),
        new RegExp(`([^'"]*)使用\\s*['"]${texture.id}['"]`, 'i')
      ];

      for (const pattern of texturePatterns) {
        const match = aiPrompt.match(pattern);
        if (match) {
          console.log(`Found command match: ${match[0]}, targeting: ${match[1]}, texture: ${texture.id}`);
          
          // Get the target part of the command
          const targetText = match[1].trim().toLowerCase();
          
          // Handle "天花板和牆壁" or similar combined targets
          const multiTargets = [];
          for (const surface of surfaces) {
            if (surface.keywords.some(keyword => targetText.includes(keyword.toLowerCase()))) {
              multiTargets.push(surface.type);
            }
          }
          
          if (multiTargets.length > 0) {
            for (const targetType of multiTargets) {
              if (targetType === 'wall') {
                const store = useSelectionStore.getState();
                if (store.roomData) {
                  const wallKeys = Object.keys(store.roomData).filter(key => key.startsWith('wall'));
                  for (const wallKey of wallKeys) {
                    result.actions.push({
                      target: wallKey,
                      textureId: texture.id
                    });
                  }
                } else {
                  result.actions.push({
                    target: 'wall',
                    textureId: texture.id
                  });
                }
              } else {
                result.actions.push({
                  target: targetType,
                  textureId: texture.id
                });
              }
            }
          }
        }
      }
    }
    
    // If we haven't found any actions yet, use more flexible matching including descriptions
    if (result.actions.length === 0) {
      // Extract key terms from the user's prompt
      const promptTerms = normalizedPrompt.split(/\s+/);
      const keyTerms = promptTerms.filter(term => term.length > 1); // Filter out single characters
      
      // Check each surface for potential matches
      for (const surface of surfaces) {
        for (const keyword of surface.keywords) {
          if (normalizedPrompt.includes(keyword)) {
            console.log(`Found surface: ${surface.type} with keyword: ${keyword}`);
            
            // Find textures that best match the prompt based on name, tags, and description
            const textureMatches = [];
            
            for (const texture of textureArray) {
              let matchScore = 0;
              
              // Check for exact ID match (highest priority)
              if (normalizedPrompt.includes(texture.id.toLowerCase())) {
                matchScore += 100;
              }
              
              // Check for name match
              if (normalizedPrompt.includes(texture.nameLower)) {
                matchScore += 50;
              }
              
              // Check for tag matches
              for (const tag of texture.tags) {
                if (normalizedPrompt.includes(tag.toLowerCase())) {
                  matchScore += 30;
                }
              }
              
              // Check for description matches (new)
              if (texture.descriptionLower) {
                // Count how many key terms from the prompt appear in the description
                const descriptionMatchCount = keyTerms.filter(term => 
                  texture.descriptionLower.includes(term)
                ).length;
                
                // Add to score based on match count
                matchScore += descriptionMatchCount * 20;
                
                // Give extra points for cold-related terms in description, if looking for cold
                const coldTerms = ['cold', 'cool', 'chill', '冷', '寒冷', '冰冷', 'gray', 'grey', 'white'];
                if (normalizedPrompt.includes('cold') || normalizedPrompt.includes('冷')) {
                  const coldMatchCount = coldTerms.filter(term => 
                    texture.descriptionLower.includes(term)
                  ).length;
                  matchScore += coldMatchCount * 15;
                }
              }
              
              if (matchScore > 0) {
                textureMatches.push({
                  textureId: texture.id,
                  score: matchScore
                });
              }
            }
            
            // Sort matches by score (descending)
            textureMatches.sort((a, b) => b.score - a.score);
            
            // Use the best match if any found
            if (textureMatches.length > 0) {
              const bestMatch = textureMatches[0];
              console.log(`Selected texture ${bestMatch.textureId} with score ${bestMatch.score}`);
              
              // Handle special case for walls
              if (surface.type === 'wall') {
                const store = useSelectionStore.getState();
                if (store.roomData) {
                  const wallKeys = Object.keys(store.roomData).filter(key => key.startsWith('wall'));
                  for (const wallKey of wallKeys) {
                    result.actions.push({
                      target: wallKey,
                      textureId: bestMatch.textureId
                    });
                  }
                } else {
                  result.actions.push({
                    target: 'wall',
                    textureId: bestMatch.textureId
                  });
                }
              } else {
                // Standard case for floor and ceiling
                result.actions.push({
                  target: surface.type,
                  textureId: bestMatch.textureId
                });
              }
            }
            
            break; // Found a keyword match for this surface, move to next surface
          }
        }
      }
    }
    
    // Check if any operation is found
    if (result.actions.length > 0) {
      result.success = true;
    } else {
      result.message = "No direct texture specification found";
    }
    
    console.log("Direct parse result:", result);
    return result;
  } catch (error) {
    console.error("Error in direct parsing:", error);
    return {
      success: false,
      message: `Error in direct parsing: ${error.message}`
    };
  }
}

/**
 * Style Guidance Mode - Parse commands where user specifies design style or elements
 * @param {string} aiPrompt - AI text command
 * @param {Object} availableTextures - Available materials
 * @returns {Object} - Parsing result
 */
async function parseStyleGuidanceCommand(aiPrompt, availableTextures) {
  try {
    console.log("Attempting style guidance parsing:", aiPrompt);
    
    // Initialize result
    const result = {
      success: false,
      actions: [],
      style: "" // Store the identified style
    };
    
    // Normalize prompt for analysis
    const normalizedPrompt = aiPrompt.toLowerCase();
    const promptTerms = normalizedPrompt.split(/\s+/);
    const keyTerms = promptTerms.filter(term => term.length > 1); // Filter out single characters
    
    // Create an array of textures with normalized descriptions for easier matching
    const textureArray = Object.entries(availableTextures).map(([id, texture]) => ({
      id,
      name: texture.name || id,
      nameLower: (texture.name || id).toLowerCase(),
      description: texture.description || "",
      descriptionLower: (texture.description || "").toLowerCase(),
      tags: texture.tags || []
    }));
    
    // Predefined styles and their keywords
    const styles = [
      { name: "現代簡約", keywords: ["現代", "簡約", "簡潔", "modern", "minimal", "簡單"], 
        floorTextures: ["wood_floor", "white_tiles", "gray_concrete"], 
        wallTextures: ["white_paint", "light_gray_paint", "concrete"], 
        ceilingTextures: ["white_paint", "light_fixtures"] },
      
      { name: "工業風格", keywords: ["工業", "工廠", "loft", "industrial", "復古工業"], 
        floorTextures: ["concrete_floor", "dark_wood", "rough_concrete"], 
        wallTextures: ["exposed_brick", "concrete", "metal_panels"], 
        ceilingTextures: ["exposed_pipes", "concrete"] },
      
      { name: "北歐風格", keywords: ["北歐", "斯堪地納維亞", "scandinavian", "nordic"], 
        floorTextures: ["light_wood_floor", "white_wood", "light_tiles"], 
        wallTextures: ["white_paint", "light_pastel", "blue_accent"], 
        ceilingTextures: ["white_paint", "simple_light"] },
      
      { name: "鄉村風格", keywords: ["鄉村", "田園", "rustic", "country", "farmhouse"], 
        floorTextures: ["distressed_wood", "terracotta", "stone_tiles"], 
        wallTextures: ["beige_paint", "floral_wallpaper", "wood_panels"], 
        ceilingTextures: ["wooden_beams", "cream_paint"] },
      
      { name: "日式風格", keywords: ["日式", "和風", "日本", "japanese", "zen"], 
        floorTextures: ["tatami", "bamboo", "light_wood"], 
        wallTextures: ["shoji", "neutral_paint", "wood_panels"], 
        ceilingTextures: ["wood_panels", "simple_design"] },
      
      // Add a new style for cold room designs
      { name: "冷調設計", 
        keywords: ["冷", "寒冷", "冷色", "冷調", "涼爽", "冷色調", "cool", "cold", "冰冷", "清涼"], 
        floorTextures: ["newPascoGrayGlossTiles", "phantomStoneWarmLightGreyFloorAndWallTiles", "concrete"], 
        wallTextures: ["dryWall", "whiteAndGrayPaint", "luminousWaterWhiteGrayPaint", "concrete", "newPascoGrayGlossTiles", "phantomStoneWarmLightGreyFloorAndWallTiles"], 
        ceilingTextures: ["dryWall", "whiteAndGrayPaint", "luminousWaterWhiteGrayPaint"] 
      },
      
      // New styles added below
      { name: "中世紀現代風格", 
        keywords: ["中世紀現代", "mid century", "中世紀", "復古現代", "50年代", "60年代"], 
        floorTextures: ["wood_floor", "walnut_wood", "teak_wood"], 
        wallTextures: ["neutral_paint", "wood_panels", "accent_wall"], 
        ceilingTextures: ["white_paint", "wood_beams"] 
      },
      
      { name: "極簡主義", 
        keywords: ["極簡", "簡約", "minimalist", "極簡主義", "簡單"], 
        floorTextures: ["concrete", "white_tiles", "light_wood_floor"], 
        wallTextures: ["white_paint", "concrete", "neutral_paint"], 
        ceilingTextures: ["white_paint", "recessed_lighting"] 
      },
      
      { name: "地中海風格", 
        keywords: ["地中海", "mediterranean", "希臘", "西班牙", "摩洛哥"], 
        floorTextures: ["terracotta", "ceramic_tile", "stone_tiles"], 
        wallTextures: ["stucco", "white_paint", "blue_accent"], 
        ceilingTextures: ["white_paint", "wooden_beams"] 
      },
      
      { name: "波西米亞風格", 
        keywords: ["波西米亞", "bohemian", "boho", "自由風格", "異國情調"], 
        floorTextures: ["natural_fiber", "patterned_rugs", "wood_floor"], 
        wallTextures: ["textured_wall", "accent_wall", "neutral_paint"], 
        ceilingTextures: ["white_paint", "wooden_beams"] 
      },
      
      { name: "奢華風格", 
        keywords: ["奢華", "豪華", "luxury", "glamour", "典雅", "高級"], 
        floorTextures: ["marble", "polished_stone", "high_end_wood"], 
        wallTextures: ["wallpaper", "accent_wall", "paneling"], 
        ceilingTextures: ["coffered_ceiling", "chandelier", "ornate_molding"] 
      },
      
      { name: "當代風格", 
        keywords: ["當代", "contemporary", "現代感", "時尚"], 
        floorTextures: ["engineered_wood", "large_format_tile", "polished_concrete"], 
        wallTextures: ["accent_wall", "neutral_paint", "large_windows"], 
        ceilingTextures: ["white_paint", "track_lighting", "recessed_lighting"] 
      },
      
      { name: "熱帶風格", 
        keywords: ["熱帶", "tropical", "海灘", "度假", "島嶼"], 
        floorTextures: ["bamboo", "rattan", "light_wood_floor"], 
        wallTextures: ["bamboo_wall", "tropical_print", "light_colors"], 
        ceilingTextures: ["natural_fiber", "fan", "thatch"] 
      },
      
      { name: "裝飾藝術風格", 
        keywords: ["art deco", "裝飾藝術", "1920年代", "30年代", "幾何圖案"], 
        floorTextures: ["geometric_tile", "parquet", "marble"], 
        wallTextures: ["bold_colors", "geometric_pattern", "metallic_finish"], 
        ceilingTextures: ["ornate_molding", "stepped_design", "metallic_paint"] 
      }
    ];
    
    // Check for style keywords in the prompt
    let matchedStyle = null;
    for (const style of styles) {
      if (style.keywords.some(keyword => normalizedPrompt.includes(keyword.toLowerCase()))) {
        matchedStyle = style;
        result.style = style.name;
        console.log(`Matched style: ${style.name}`);
        break;
      }
    }
    
    // If a style is matched, select appropriate textures
    if (matchedStyle) {
      // Surface types to consider
      const surfaces = ['floor', 'wall', 'ceiling'];
      
      // Check which surfaces are mentioned in the prompt
      const mentionedSurfaces = [];
      
      if (surfaces.some(s => normalizedPrompt.includes(s)) ||
          normalizedPrompt.includes('地板') || 
          normalizedPrompt.includes('牆') || 
          normalizedPrompt.includes('天花板')) {
        // Specific surfaces mentioned
        if (normalizedPrompt.includes('floor') || normalizedPrompt.includes('地板') || normalizedPrompt.includes('地面')) {
          mentionedSurfaces.push('floor');
        }
        if (normalizedPrompt.includes('wall') || normalizedPrompt.includes('牆') || normalizedPrompt.includes('牆壁')) {
          mentionedSurfaces.push('wall');
        }
        if (normalizedPrompt.includes('ceiling') || normalizedPrompt.includes('天花板') || normalizedPrompt.includes('頂棚')) {
          mentionedSurfaces.push('ceiling');
        }
      } else {
        // No specific surface mentioned, apply to all
        mentionedSurfaces.push(...surfaces);
      }
      
      console.log("Applying to surfaces:", mentionedSurfaces);
      
      // Apply appropriate textures for each mentioned surface
      for (const surface of mentionedSurfaces) {
        let textureKeywords = [];
        
        // Get texture keywords for this surface and style
        if (surface === 'floor') {
          textureKeywords = matchedStyle.floorTextures;
        } else if (surface === 'wall') {
          textureKeywords = matchedStyle.wallTextures;
        } else if (surface === 'ceiling') {
          textureKeywords = matchedStyle.ceilingTextures;
        }
        
        // Find matching textures with scoring system
        const textureMatches = [];
        
        for (const textureItem of textureArray) {
          let score = 0;
          
          // Check direct matches with style's texture keywords
          for (const keyword of textureKeywords) {
            if (textureItem.id.toLowerCase().includes(keyword) || 
                keyword.includes(textureItem.id.toLowerCase())) {
              score += 50;
            }
            
            if (textureItem.nameLower.includes(keyword) || 
                keyword.includes(textureItem.nameLower)) {
              score += 40;
            }
            
            // Check tags
            for (const tag of textureItem.tags) {
              if (tag.toLowerCase().includes(keyword) || 
                  keyword.includes(tag.toLowerCase())) {
                score += 30;
              }
            }
          }
          
          // Check description matches with prompt terms and style
          if (textureItem.descriptionLower) {
            // Add points for matching key terms from the prompt
            const termMatchCount = keyTerms.filter(term => 
              textureItem.descriptionLower.includes(term)
            ).length;
            score += termMatchCount * 20;
            
            // Add points for style-specific matches in description
            const styleMatchCount = matchedStyle.keywords.filter(keyword => 
              textureItem.descriptionLower.includes(keyword.toLowerCase())
            ).length;
            score += styleMatchCount * 15;
          }
          
          if (score > 0) {
            textureMatches.push({
              textureId: textureItem.id,
              score: score
            });
          }
        }
        
        // Sort by score and select the best match
        textureMatches.sort((a, b) => b.score - a.score);
        
        // If we found matching textures, pick the best one
        if (textureMatches.length > 0) {
          const bestMatch = textureMatches[0];
          console.log(`For ${surface}, selected texture: ${bestMatch.textureId} with score ${bestMatch.score}`);
          
          // Handle walls specially
          if (surface === 'wall') {
            const store = useSelectionStore.getState();
            if (store.roomData) {
              const wallKeys = Object.keys(store.roomData).filter(key => key.startsWith('wall'));
              for (const wallKey of wallKeys) {
                result.actions.push({
                  target: wallKey,
                  textureId: bestMatch.textureId
                });
              }
            } else {
              result.actions.push({
                target: 'wall',
                textureId: bestMatch.textureId
              });
            }
          } else {
            result.actions.push({
              target: surface,
              textureId: bestMatch.textureId
            });
          }
        } else {
          console.log(`Could not find matching texture for ${surface} in style ${matchedStyle.name}`);
        }
      }
    } else {
      // If no predefined style matched, check for specific materials/elements
      const materialElements = [
        { keywords: ["木", "wood", "timber", "wooden"], textures: ["wood_floor", "wood_panels", "oak", "bamboo"] },
        { keywords: ["磚", "brick", "紅磚", "磚塊"], textures: ["brick_wall", "exposed_brick", "red_brick"] },
        { keywords: ["石", "stone", "石頭", "石材"], textures: ["stone_wall", "marble", "granite", "slate"] },
        { keywords: ["混凝土", "水泥", "cement", "concrete"], textures: ["concrete_floor", "concrete_wall", "gray_concrete"] },
        { keywords: ["瓷磚", "tile", "磁磚"], textures: ["ceramic_tile", "porcelain_tile", "mosaic_tile"] },
        { keywords: ["金屬", "metal", "鋼", "銅"], textures: ["metal_panel", "steel", "copper", "metallic"] },
        { keywords: ["玻璃", "glass"], textures: ["glass_panel", "mirror", "frosted_glass"] },
        { keywords: ["白色", "white"], textures: ["white_paint", "white_tiles", "white_wood"] },
        { keywords: ["黑色", "black"], textures: ["black_paint", "dark_wood", "black_marble"] },
        { keywords: ["灰色", "gray", "grey"], textures: ["gray_paint", "gray_concrete", "gray_stone"] }
      ];
      
      // Check for material/element keywords
      let matchedElements = [];
      for (const element of materialElements) {
        if (element.keywords.some(keyword => normalizedPrompt.includes(keyword.toLowerCase()))) {
          matchedElements.push(element);
          console.log(`Matched element/material: ${element.keywords[0]}`);
        }
      }
      
      if (matchedElements.length > 0) {
        // Surface types to consider
        const surfaceKeywords = [
          { type: 'floor', keywords: ['地板', '地面', 'floor', 'ground', '底部'] },
          { type: 'wall', keywords: ['牆壁', '牆', 'wall', '墻壁', '墙壁', '墙'] },
          { type: 'ceiling', keywords: ['天花板', '頂棚', '天頂', 'ceiling', '頂部', '顶部'] }
        ];
        
        // Check which surfaces are mentioned
        const mentionedSurfaces = [];
        for (const surface of surfaceKeywords) {
          if (surface.keywords.some(keyword => normalizedPrompt.includes(keyword.toLowerCase()))) {
            mentionedSurfaces.push(surface.type);
          }
        }
        
        // If no specific surface mentioned, try to infer from context or use all
        if (mentionedSurfaces.length === 0) {
          mentionedSurfaces.push('floor', 'wall', 'ceiling');
        }
        
        // For each matched element, find textures for the mentioned surfaces
        for (const element of matchedElements) {
          for (const surface of mentionedSurfaces) {
            // Find matching texture
            let matchedTextureId = null;
            
            for (const textureKeyword of element.textures) {
              for (const [id, texture] of Object.entries(availableTextures)) {
                const textureName = (texture.name || id).toLowerCase();
                const textureTags = (texture.tags || []).map(tag => tag.toLowerCase());
                
                if (textureName.includes(textureKeyword) || 
                    textureKeyword.includes(textureName) || 
                    textureTags.some(tag => tag.includes(textureKeyword) || textureKeyword.includes(tag))) {
                  matchedTextureId = id;
                  break;
                }
              }
              if (matchedTextureId) break;
            }
            
            // If texture found, apply it
            if (matchedTextureId) {
              console.log(`For ${surface}, selected texture: ${matchedTextureId} based on element ${element.keywords[0]}`);
              
              // Handle walls specially
              if (surface === 'wall') {
                const store = useSelectionStore.getState();
                if (store.roomData) {
                  const wallKeys = Object.keys(store.roomData).filter(key => key.startsWith('wall-'));
                  for (const wallKey of wallKeys) {
                    result.actions.push({
                      target: wallKey,
                      textureId: matchedTextureId
                    });
                  }
                } else {
                  result.actions.push({
                    target: 'wall',
                    textureId: matchedTextureId
                  });
                }
              } else {
                result.actions.push({
                  target: surface,
                  textureId: matchedTextureId
                });
              }
              
              // Only apply one texture per surface
              break;
            }
          }
        }
      }
    }
    
    // Check if any operation is found
    if (result.actions.length > 0) {
      result.success = true;
    } else {
      result.message = "Could not identify appropriate materials for the requested style";
    }
    
    console.log("Style guidance parse result:", result);
    return result;
  } catch (error) {
    console.error("Error in style guidance parsing:", error);
    return {
      success: false,
      message: `Error in style guidance parsing: ${error.message}`
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

/**
 * Apply cold room materials to all surfaces
 * This is a convenience function to quickly apply cold-looking materials
 * @returns {Object} - Result of the operation
 */
export const applyColdRoomStyle = () => {
  try {
    const store = useSelectionStore.getState();
    
    if (!store.roomData) {
      return {
        success: false,
        message: "Room data not initialized"
      };
    }
    
    // Define the materials to use for cold room effect with rationale from descriptions
    const materials = {
      floor: {
        id: "newPascoGrayGlossTiles",
        reason: "Gray glossy tiles create a cool, sleek surface that visually reduces warmth"
      },
      ceiling: {
        id: "dryWall", 
        reason: "Clean, flat white ceiling surface creates an open, airy feeling"
      },
      walls: {
        id: "whiteAndGrayPaint",
        reason: "White and gray paint combination creates a soft neutral tone that enhances the cool atmosphere"
      }
    };
    
    const results = [];
    
    // Apply floor material
    if (store.roomData["floor"]) {
      store.setMaterialTexture("floor", materials.floor.id);
      results.push({
        target: "floor",
        textureId: materials.floor.id,
        textureName: store.preloadedTextures[materials.floor.id]?.name || materials.floor.id,
        description: materials.floor.reason,
        success: true
      });
    }
    
    // Apply ceiling material
    if (store.roomData["ceiling"]) {
      store.setMaterialTexture("ceiling", materials.ceiling.id);
      results.push({
        target: "ceiling",
        textureId: materials.ceiling.id,
        textureName: store.preloadedTextures[materials.ceiling.id]?.name || materials.ceiling.id,
        description: materials.ceiling.reason,
        success: true
      });
    }
    
    // Apply wall materials
    const wallKeys = Object.keys(store.roomData).filter(key => key.startsWith('wall'));
    for (const wallKey of wallKeys) {
      store.setMaterialTexture(wallKey, materials.walls.id);
      results.push({
        target: wallKey,
        textureId: materials.walls.id,
        textureName: store.preloadedTextures[materials.walls.id]?.name || materials.walls.id,
        description: materials.walls.reason,
        success: true
      });
    }
    
    return {
      success: true,
      message: "Successfully applied cold room style",
      details: results,
      style: "冷調設計",
      description: "冷調設計使用了灰色和白色系列材質，營造出清爽、冷靜的空間氛圍。灰色光澤地磚反射光線，白灰色牆面增加空間感，整體設計簡潔現代。"
    };
  } catch (error) {
    console.error("Error applying cold room style:", error);
    return {
      success: false,
      message: `Error applying cold room style: ${error.message}`
    };
  }
}; 