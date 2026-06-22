'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FootballHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x22c55e, 1.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const footballMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100,
      bumpScale: 0.05,
    });

    const ball = new THREE.Mesh(geometry, footballMaterial);
    scene.add(ball);

    const wireframe = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.05, 1));
    const line = new THREE.LineSegments(wireframe);
    (line.material as THREE.LineBasicMaterial).color.setHex(0x22c55e);
    (line.material as THREE.LineBasicMaterial).transparent = true;
    (line.material as THREE.LineBasicMaterial).opacity = 0.3;
    ball.add(line);

    camera.position.z = 8;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleMouseDown = () => ball.scale.set(0.9, 0.9, 0.9);
    const handleMouseUp = () => ball.scale.set(1, 1, 1);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      ball.rotation.y += 0.01;
      ball.rotation.x += 0.005;
      ball.position.x = targetX * 2;
      ball.position.y = targetY * 1.5;
      renderer.render(scene, camera);
    }

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      geometry.dispose();
      footballMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      id="football-container"
    />
  );
}
