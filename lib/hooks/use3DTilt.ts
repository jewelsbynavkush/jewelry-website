/**
 * Reusable hook for 3D tilt effect
 * Extracts common mouse handling logic for 3D animated components
 */

import { useRef, useState, useCallback, MouseEvent, RefObject } from 'react';
import { useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { ANIMATION_3D } from '@/lib/animations/constants';

interface Use3DTiltReturn {
  cardRef: RefObject<HTMLDivElement | null>;
  isHovered: boolean;
  setIsHovered: (value: boolean) => void;
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  translateZ: MotionValue<number>;
  scale: MotionValue<number>;
  handleMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
  handleMouseLeave: () => void;
}

/**
 * Reusable hook for 3D tilt effect with mouse tracking
 * @param includeScale - Whether to include scale effect on hover
 */
export function use3DTilt(includeScale: boolean = false): Use3DTiltReturn {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // 3D tilt effect values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Standardized 3D tilt effects
  const rotateX = useSpring(
    useTransform(
      y,
      [ANIMATION_3D.ROTATION.RANGE_MIN, ANIMATION_3D.ROTATION.RANGE_MAX],
      [ANIMATION_3D.ROTATION.MAX, -ANIMATION_3D.ROTATION.MAX]
    ),
    {
      stiffness: ANIMATION_3D.SPRING.STIFFNESS,
      damping: ANIMATION_3D.SPRING.DAMPING,
      mass: ANIMATION_3D.SPRING.MASS,
    }
  );
  
  const rotateY = useSpring(
    useTransform(
      x,
      [ANIMATION_3D.ROTATION.RANGE_MIN, ANIMATION_3D.ROTATION.RANGE_MAX],
      [-ANIMATION_3D.ROTATION.MAX, ANIMATION_3D.ROTATION.MAX]
    ),
    {
      stiffness: ANIMATION_3D.SPRING.STIFFNESS,
      damping: ANIMATION_3D.SPRING.DAMPING,
      mass: ANIMATION_3D.SPRING.MASS,
    }
  );
  
  // Standardized Z-axis translation for depth
  const distanceX = useTransform(x, (v) => Math.abs(v));
  const distanceY = useTransform(y, (v) => Math.abs(v));
  
  const translateZ = useSpring(
    useTransform([distanceX, distanceY], ([dx, dy]: number[]) => {
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance * ANIMATION_3D.DEPTH.MULTIPLIER;
    }),
    {
      stiffness: ANIMATION_3D.SPRING.STIFFNESS,
      damping: ANIMATION_3D.SPRING.DAMPING,
      mass: ANIMATION_3D.SPRING.MASS,
    }
  );
  
  // Scale effect (always created, but only used if includeScale is true)
  const scaleTransform = useTransform([distanceX, distanceY], ([dx, dy]: number[]) => {
    if (!includeScale) return 1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return isHovered ? 1 + distance * ANIMATION_3D.SCALE.HOVER_MULTIPLIER : 1;
  });
  
  const scale = useSpring(scaleTransform, {
    stiffness: ANIMATION_3D.SPRING.STIFFNESS,
    damping: ANIMATION_3D.SPRING.DAMPING,
    mass: ANIMATION_3D.SPRING.MASS,
  });
  
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const normalizedX = mouseX / (rect.width / 2);
    const normalizedY = mouseY / (rect.height / 2);
    
    x.set(normalizedX);
    y.set(normalizedY);
  }, [x, y]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);
  
  return {
    cardRef,
    isHovered,
    setIsHovered,
    x,
    y,
    rotateX,
    rotateY,
    translateZ,
    scale,
    handleMouseMove,
    handleMouseLeave,
  };
}

