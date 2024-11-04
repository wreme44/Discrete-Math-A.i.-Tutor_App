import React, { forwardRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

const ExcalidrawWrapper = forwardRef((props, ref) => {
    return <Excalidraw ref={ref} {...props} />;
});

export default ExcalidrawWrapper;