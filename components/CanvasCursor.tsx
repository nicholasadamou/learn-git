'use client';

import useCanvasCursor from '@/hooks/use-canvasCursor';
import { useEffect, useState } from 'react';

const CanvasCursor = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
		const mobileCheck = /Mobi|Android/i.test(userAgent);

		setIsMobile(mobileCheck);
	}, []);

	useCanvasCursor();

	return !isMobile ? <canvas className='pointer-events-none fixed inset-0' id='canvas' /> : null;
};

export default CanvasCursor;
