import React from 'react';
import { PivotControls } from '@react-three/drei';

const CustomPivotControls = ({
  isVisible,
  scale = 0.5,
  children, // 如果需要包裹子元素
}) => {


  return (
    <PivotControls
      visible={isVisible}
      enabled={isVisible}
      anchor={[0, 0, 0]}
      scale={scale}
      autoTransform
      //disableScaling
      annotations
      depthTest={false}
    >
      {children}
    </PivotControls>
  );
};

export default CustomPivotControls;
