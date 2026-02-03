import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin globally
gsap.registerPlugin(ScrollTrigger);

// Export for use in components
export { gsap, ScrollTrigger };
