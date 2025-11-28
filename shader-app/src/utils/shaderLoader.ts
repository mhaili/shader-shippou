import { vertexShader } from '../shaders/vertexShader';
import { fragmentShader } from '../shaders/fragmentShader';

export function loadShaders(): { vertex: string; fragment: string } {
  return { 
    vertex: vertexShader, 
    fragment: fragmentShader 
  };
}