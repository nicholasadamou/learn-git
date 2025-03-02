// @ts-nocheck

import { useEffect } from 'react';

const useCanvasCursor = () => {
	class Oscillator {
		constructor({ phase = 0, offset = 0, frequency = 0.001, amplitude = 1 } = {}) {
			this.phase = phase;
			this.offset = offset;
			this.frequency = frequency;
			this.amplitude = amplitude;
		}

		update() {
			this.phase += this.frequency;
			return this.offset + Math.sin(this.phase) * this.amplitude;
		}
	}

	class Node {
		constructor() {
			this.x = 0;
			this.y = 0;
			this.vx = 0;
			this.vy = 0;
		}
	}

	class Line {
		constructor({ spring }) {
			this.spring = spring + (Math.random() * 0.1 - 0.02);
			this.friction = SETTINGS.friction + (Math.random() * 0.01 - 0.002);
			this.nodes = Array.from({ length: SETTINGS.size }, () => new Node());
			// Set initial position of each node to the current cursor position
			this.nodes.forEach((node) => {
				node.x = cursorPos.x;
				node.y = cursorPos.y;
			});
		}

		update() {
			let factor = this.spring;
			let node = this.nodes[0];

			// Update first node using the cursor position
			node.vx += (cursorPos.x - node.x) * factor;
			node.vy += (cursorPos.y - node.y) * factor;
			node.vx *= this.friction;
			node.vy *= this.friction;
			node.x += node.vx;
			node.y += node.vy;
			factor *= SETTINGS.tension;

			// Update subsequent nodes based on previous nodes
			for (let i = 1; i < this.nodes.length; i++) {
				const prevNode = this.nodes[i - 1];
				node = this.nodes[i];
				node.vx += (prevNode.x - node.x) * factor + prevNode.vx * SETTINGS.dampening;
				node.vy += (prevNode.y - node.y) * factor + prevNode.vy * SETTINGS.dampening;
				node.vx *= this.friction;
				node.vy *= this.friction;
				node.x += node.vx;
				node.y += node.vy;
				factor *= SETTINGS.tension;
			}
		}

		draw(ctx) {
			ctx.beginPath();
			ctx.moveTo(this.nodes[0].x, this.nodes[0].y);

			for (let i = 1; i < this.nodes.length - 1; i++) {
				const current = this.nodes[i];
				const next = this.nodes[i + 1];
				const midX = (current.x + next.x) / 2;
				const midY = (current.y + next.y) / 2;
				ctx.quadraticCurveTo(current.x, current.y, midX, midY);
			}
			ctx.stroke();
			ctx.closePath();
		}
	}

	const SETTINGS = {
		friction: 0.5,
		trails: 20,
		size: 50,
		dampening: 0.25,
		tension: 0.98,
	};

	let ctx, oscillator;
	// Start with a default cursor position at the canvas center
	const cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	let lines = [];

	const updateCursorPosition = (e) => {
		if (e.touches && e.touches.length > 0) {
			cursorPos.x = e.touches[0].pageX;
			cursorPos.y = e.touches[0].pageY;
		} else {
			cursorPos.x = e.clientX;
			cursorPos.y = e.clientY;
		}
		e.preventDefault();
	};

	const initializeLines = () => {
		lines = Array.from({ length: SETTINGS.trails }, (_, i) =>
			new Line({ spring: 0.4 + (i / SETTINGS.trails) * 0.025 })
		);
	};

	const render = () => {
		if (!ctx.running) return;

		// Clear the canvas
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		// Update oscillator to change stroke hue over time
		ctx.strokeStyle = `hsla(${Math.round(oscillator.update())}, 50%, 50%, 0.2)`;
		ctx.lineWidth = 1;

		// Update and draw each trail
		lines.forEach((line) => {
			line.update();
			line.draw(ctx);
		});

		requestAnimationFrame(render);
	};

	const resizeCanvas = () => {
		ctx.canvas.width = window.innerWidth - 20;
		ctx.canvas.height = window.innerHeight;
	};

	const initializeCanvas = () => {
		const canvasElement = document.getElementById('canvas');
		if (!canvasElement) {
			console.error('Canvas element with id "canvas" not found.');
			return;
		}
		ctx = canvasElement.getContext('2d');
		ctx.running = true;

		resizeCanvas();
		// Set the initial cursor position to the center of the canvas
		cursorPos.x = ctx.canvas.width / 2;
		cursorPos.y = ctx.canvas.height / 2;

		oscillator = new Oscillator({
			phase: Math.random() * 2 * Math.PI,
			amplitude: 85,
			frequency: 0.0015,
			offset: 285,
		});

		// Set up event listeners for both mouse and touch interactions
		document.addEventListener('mousemove', updateCursorPosition);
		document.addEventListener('touchstart', updateCursorPosition);
		document.addEventListener('touchmove', updateCursorPosition);
		window.addEventListener('resize', resizeCanvas);

		initializeLines();
		render();
	};

	useEffect(() => {
		initializeCanvas();

		return () => {
			if (ctx) {
				ctx.running = false;
			}

			document.removeEventListener('mousemove', updateCursorPosition);
			document.removeEventListener('touchstart', updateCursorPosition);
			document.removeEventListener('touchmove', updateCursorPosition);
			window.removeEventListener('resize', resizeCanvas);
		};
	}, []);
};

export default useCanvasCursor;
