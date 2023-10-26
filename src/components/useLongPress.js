import { useEffect, useRef } from 'react';
import Hammer from 'hammerjs';

const useLongPress = (elementRef, onLongPress, duration = 1000) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    const hammerRef = useRef(null);

    useEffect(() => {
        if (elementRef.current === null) return;

        const hammer = new Hammer(elementRef.current);
        hammer.add(new Hammer.Press({ time: duration }));
        hammer.on('press', onLongPress);
        hammerRef.current = hammer;

        return () => {
            hammer.off('press', onLongPress);
            hammer.destroy();
        };
    }, [elementRef, onLongPress, duration]);

    return hammerRef;
};

export default useLongPress;