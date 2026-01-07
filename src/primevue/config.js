import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// Customizar preset para usar a cor primary personalizada
export const MyPreset = definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
                primary: {
                    color: '#f5cee1',
                    inverseColor: '#761c49',
                    hoverColor: '#761c49',
                    activeColor: '#761c49'
                }
            },
            dark: {
                primary: {
                    color: '#f5cee1',
                    inverseColor: '#761c49',
                    hoverColor: '#761c49',
                    activeColor: '#761c49'
                }
            }
        }
    }
});

