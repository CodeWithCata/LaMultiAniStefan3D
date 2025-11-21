'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function BirthdayCard() {
  const mountRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  
  // --- CONFIGURATION SECTION (EDIT THIS) ---
  // 1. Put the link to your friend's photo here:
  const [photoUrl] = useState('/stefan.png'); 
  // 2. Put your message here:
  const [message] = useState("Happy Birthday! Multa sanatate, fericire si multe realizari."); 
    // 3. New photo for the table (can be the same or different)
    const [tablePhotoUrl] = useState('/rege.png'); 
    // 4. Message for the table
    const [tableMessage] = useState("La Mulți Ani bro!!"); 
    // 5. Message above the main photo
    const  [topMessage] = useState("La Mulți Ani Stefan!"); 
    // 6. Calea către fișierul tău MP3 (Pune fișierul în folderul /public)
    const [musicUrl] = useState('/muzica.mp3'); 
  // -----------------------------------------

  const [uiStep, setUiStep] = useState('ready'); 
  // Variabila de stare pentru muzică
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); 
  
  // Refs for 3D objects and Audio
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const giftRef = useRef(null);
  const lidRef = useRef(null);
  const contentRef = useRef(null); 
  const confettiSystemRef = useRef(null);
  const textMeshRef = useRef(null); 
  const tablePhotoMeshRef = useRef(null); 
  const topMessageMeshRef = useRef(null); 
  const audioRef = useRef(null); // Referința pentru elementul Audio

  // --- Setup Audio & Initial Client Setup (UNCHANGED) ---
  useEffect(() => {
    setIsClient(true);

    if (musicUrl && !audioRef.current) {
      audioRef.current = new Audio(musicUrl);
      audioRef.current.loop = true; // Muzica se repetă
      audioRef.current.volume = 0.6; // Volum inițial
    }

    return () => {
      // Curățare la demontare
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsMusicPlaying(false);
      }
    };
  }, [musicUrl]);

  // --- Functia de Control Muzică (UNCHANGED) ---
  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      // Încercăm să redăm. Redarea automată poate fi blocată, dar o pornim aici.
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(error => {
        console.warn("Redarea muzicii a fost blocată. Poate fi pornită manual de utilizator.", error);
        // Nu schimbăm starea isMusicPlaying dacă redarea eșuează.
      });
    }
  };
  
  // Custom Tweening Functions (UNCHANGED)
  const easeOutBack = (t) => {
    const s = 1.70158;
    return (t = t - 1) * t * ((s + 1) * t + s) + 1;
  };
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  const tweenValue = (start, end, duration, easing, onUpdate, onComplete) => {
      return new Promise(resolve => {
          let startTime = Date.now();
          const tick = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(1, elapsed / duration);
              const easedProgress = easing(progress);

              if (typeof start === 'number') {
                  const currentValue = start + (end - start) * easedProgress;
                  onUpdate(currentValue);
              } else { // Handle Vector3/Euler for positions/rotations
                  const currentValue = {};
                  for (const key in start) {
                      currentValue[key] = start[key] + (end[key] - start[key]) * easedProgress;
                  }
                  onUpdate(currentValue);
              }

              if (progress < 1) {
                  requestAnimationFrame(tick);
              } else {
                  if (onComplete) onComplete();
                  resolve();
              }
          };
          tick();
      });
  };

  // --- 3D SCENE SETUP (MODIFIED CAMERA) ---
  useEffect(() => {
    if (!isClient || !mountRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111118'); 
    scene.fog = new THREE.FogExp2('#111118', 0.02);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    // ADJUSTED CAMERA POSITION FOR MOBILE VIEWPORT (more height/less depth)
    camera.position.set(0, 3.5, 8); 
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // ADJUSTED MAX DISTANCE
    controls.minDistance = 5;
    controls.maxDistance = 12; 
    controls.maxPolarAngle = Math.PI / 2 - 0.1; 
    controls.autoRotate = true; 
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // 3. Lighting (UNCHANGED)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xff4757, 120); 
    spotLight.position.set(5, 10, 5);
    spotLight.angle = 0.4;
    spotLight.penumbra = 0.5;
    spotLight.decay = 1;
    spotLight.distance = 40;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.bias = -0.0001;
    scene.add(spotLight);

    const backLight = new THREE.PointLight(0x4444ff, 30);
    backLight.position.set(-5, 2, -5);
    scene.add(backLight);

    // 4. Objects (UNCHANGED)
    // Floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.5 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Gift Box Group
    const giftGroup = new THREE.Group();
    giftGroup.position.y = -1; 
    scene.add(giftGroup);
    giftRef.current = giftGroup;

    // Box Base
    const boxSize = 2.5;
    const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.4, metalness: 0.1 }); 
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.castShadow = true;
    box.receiveShadow = true;
    giftGroup.add(box);

    // Ribbon (Base)
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 }); 
    const ribbonGeo = new THREE.BoxGeometry(boxSize + 0.05, boxSize, 0.4);
    const r1 = new THREE.Mesh(ribbonGeo, ribbonMat);
    const r2 = r1.clone();
    r2.rotation.y = Math.PI / 2;
    giftGroup.add(r1);
    giftGroup.add(r2);

    // Lid Group
    const lidGroup = new THREE.Group();
    lidGroup.position.y = boxSize / 2; 
    giftGroup.add(lidGroup);
    lidRef.current = lidGroup;

    // Lid Mesh
    const lidGeo = new THREE.BoxGeometry(boxSize + 0.2, 0.5, boxSize + 0.2);
    const lid = new THREE.Mesh(lidGeo, boxMat);
    lid.position.y = 0.25;
    lid.castShadow = true;
    lidGroup.add(lid);

    // Lid Ribbon
    const lidRibbonGeo = new THREE.BoxGeometry(boxSize + 0.3, 0.52, 0.4);
    const lr1 = new THREE.Mesh(lidRibbonGeo, ribbonMat);
    lr1.position.y = 0.25;
    lidGroup.add(lr1);
    const lr2 = lr1.clone();
    lr2.position.y = 0.25;
    lr2.rotation.y = Math.PI / 2;
    lidGroup.add(lr2);

    // Bow
    const bowGeo = new THREE.TorusKnotGeometry(0.4, 0.12, 100, 16);
    const bow = new THREE.Mesh(bowGeo, ribbonMat);
    bow.position.y = 0.8;
    bow.rotation.x = Math.PI / 2;
    lidGroup.add(bow);

    // --- INNER CONTENT (Hidden initially) (UNCHANGED) ---
    const contentGroup = new THREE.Group();
    contentGroup.scale.set(0.1, 0.1, 0.1); // Small starting size
    contentGroup.visible = false;
    scene.add(contentGroup);
    contentRef.current = contentGroup;

    // Photo Frame
    const frameGeo = new THREE.BoxGeometry(2.2, 3.2, 0.1);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    contentGroup.add(frame);

    // Photo Plane (Main Photo)
    const photoGeo = new THREE.PlaneGeometry(2, 3);
    const photoMat = new THREE.MeshBasicMaterial({ color: 0xcccccc }); 
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.z = 0.06; 
    contentGroup.add(photoMesh);

    // Load Main Photo Texture
    if(photoUrl) {
        const loader = new THREE.TextureLoader();
        loader.load(photoUrl, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            photoMat.map = tex; 
            photoMat.color.setHex(0xffffff); 
            photoMat.needsUpdate = true; 
        }, undefined, (err) => {
            console.error('Error loading main photo texture:', err); 
        });
    }

    // --- Photo on the table/floor (UNCHANGED) ---
    const tablePhotoGroup = new THREE.Group();
    tablePhotoGroup.position.set(3, -1.9, -1); 
    tablePhotoGroup.rotation.x = -Math.PI / 2; 
    scene.add(tablePhotoGroup);
    tablePhotoMeshRef.current = tablePhotoGroup;

    const tablePhotoGeo = new THREE.PlaneGeometry(2.5, 2); 
    const tablePhotoMat = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
    const tablePhotoMesh = new THREE.Mesh(tablePhotoGeo, tablePhotoMat);
    tablePhotoGroup.add(tablePhotoMesh);

    // Load Table Photo Texture
    if (tablePhotoUrl) {
        const loader = new THREE.TextureLoader();
        loader.load(tablePhotoUrl, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tablePhotoMat.map = tex;
            tablePhotoMat.color.setHex(0xffffff); 
            tablePhotoMat.needsUpdate = true;
        }, undefined, (err) => {
            console.error('Error loading table photo texture:', err);
        });
    }

    // --- Text "La Mulți Ani!" under the table photo (UNCHANGED) ---
    const tableTextCanvas = document.createElement('canvas');
    tableTextCanvas.width = 512;
    tableTextCanvas.height = 256;
    const tableTextCtx = tableTextCanvas.getContext('2d');
    
   tableTextCtx.fillStyle = 'rgba(0, 0, 0, 0)'; // Fundal transparent
    tableTextCtx.fillRect(0, 0, 512, 256);
    
    tableTextCtx.font = 'bold 60px Inter, sans-serif';
    tableTextCtx.fillStyle = '#ff4757';
    tableTextCtx.textAlign = 'center';
    tableTextCtx.textBaseline = 'middle';
    tableTextCtx.fillText(tableMessage, 256, 128);

    const tableTextTex = new THREE.CanvasTexture(tableTextCanvas);
    tableTextTex.colorSpace = THREE.SRGBColorSpace;

    const tableTextPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 1), 
        new THREE.MeshBasicMaterial({ map: tableTextTex, transparent: true, side: THREE.DoubleSide })
    );
    tableTextPlane.position.z = 0.05; 
    tableTextPlane.position.y = -0.5; 
    tablePhotoGroup.add(tableTextPlane);


    // --- "La multi ani Stefan" above the main image (UNCHANGED) ---
    const topMessageCanvas = document.createElement('canvas');
    topMessageCanvas.width = 1024;
    topMessageCanvas.height = 200;
    const topMessageCtx = topMessageCanvas.getContext('2d');

    topMessageCtx.fillStyle = 'rgba(0,0,0,0)'; 
    topMessageCtx.fillRect(0, 0, 1024, 200);
    
    topMessageCtx.font = 'bold 90px Inter, sans-serif';
    topMessageCtx.fillStyle = '#FFD700'; 
    topMessageCtx.textAlign = 'center';
    topMessageCtx.textBaseline = 'middle';
    topMessageCtx.fillText(topMessage, 512, 100);

    const topMessageTex = new THREE.CanvasTexture(topMessageCanvas);
    topMessageTex.colorSpace = THREE.SRGBColorSpace;

    const topMessagePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 0.6), 
        new THREE.MeshBasicMaterial({ map: topMessageTex, transparent: true, side: THREE.DoubleSide })
    );
    topMessagePlane.position.y = 1.7; 
    topMessagePlane.position.z = 0.07; 
    contentGroup.add(topMessagePlane);
    topMessageMeshRef.current = topMessagePlane;

    // 3D Message Text (Original Canvas Texture) (UNCHANGED)
    const textGroup = new THREE.Group();
    textGroup.position.set(3, 0.5, 0); 
    contentGroup.add(textGroup);
    textMeshRef.current = textGroup;

    // --- CONFETTI PARTICLES (UNCHANGED) ---
    const confettiCount = 300;
    const confettiGeo = new THREE.BufferGeometry();
    const confettiPos = new Float32Array(confettiCount * 3);
    const confettiVel = []; 
    const confettiColors = new Float32Array(confettiCount * 3);
    
    const colorPalette = [
        new THREE.Color('#ff006e'), new THREE.Color('#00f8c8'), 
        new THREE.Color('#ffec43'), new THREE.Color('#a855f7')
    ];

    for(let i=0; i<confettiCount; i++) {
        confettiPos[i*3] = 0; confettiPos[i*3+1] = 0; confettiPos[i*3+2] = 0;
        
        confettiVel.push({
            x: (Math.random() - 0.5) * 0.8,
            y: Math.random() * 0.8 + 0.6, 
            z: (Math.random() - 0.5) * 0.8
        });

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        confettiColors[i*3] = col.r; confettiColors[i*3+1] = col.g; confettiColors[i*3+2] = col.b;
    }

    confettiGeo.setAttribute('position', new THREE.BufferAttribute(confettiPos, 3));
    confettiGeo.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3));

    const confettiMat = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.9 });
    const confettiSystem = new THREE.Points(confettiGeo, confettiMat);
    confettiSystem.visible = false; 
    scene.add(confettiSystem);
    confettiSystemRef.current = { mesh: confettiSystem, vels: confettiVel, geo: confettiGeo, active: false };

    // --- ANIMATION LOOP (UNCHANGED) ---
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();

      // Confetti Physics
      const sys = confettiSystemRef.current;
      if (sys && sys.active) {
          const positions = sys.geo.attributes.position.array;
          for(let i=0; i<confettiCount; i++) {
              // Gravity
              sys.vels[i].y -= 0.005; 
              // Friction
              sys.vels[i].x *= 0.98;
              sys.vels[i].z *= 0.98;

              positions[i*3] += sys.vels[i].x;
              positions[i*3+1] += sys.vels[i].y;
              positions[i*3+2] += sys.vels[i].z;

              // Floor collision
              if(positions[i*3+1] < -2) sys.vels[i].y = 0;
          }
          sys.geo.attributes.position.needsUpdate = true;
      }

      // Floating Content Animation
      if(uiStep === 'opened' && contentGroup.visible) {
          contentGroup.position.y = 1.5 + Math.sin(Date.now() * 0.001) * 0.1;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isClient, uiStep, photoUrl, tablePhotoUrl, tableMessage, topMessage, message]);

  // --- CREATE ORIGINAL MESSAGE TEXTURE (UNCHANGED) ---
  useEffect(() => {
      if(message && textMeshRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = 1024;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          
          // Draw background styling
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          // Fallback for roundRect if not available
          if (ctx.roundRect) {
            ctx.roundRect(50, 50, 924, 412, 40);
            ctx.fill();
          } else {
            ctx.fillRect(50, 50, 924, 412);
          }
          
          // Text
          ctx.font = 'bold 100px Inter, sans-serif';
          ctx.fillStyle = '#ff4757';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const lines = message.match(/.{1,15}(\s|$)/g) || [message]; // Break message into lines
          lines.forEach((line, index) => {
            ctx.fillText(line.trim(), 512, 256 + (index - (lines.length - 1) / 2) * 120);
          });
          
          const tex = new THREE.CanvasTexture(canvas);
          tex.colorSpace = THREE.SRGBColorSpace;
          
          textMeshRef.current.clear();
          
          const plane = new THREE.Mesh(
              new THREE.PlaneGeometry(3.5, 1.75), 
              new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
          );
          textMeshRef.current.add(plane);
      }
  }, [message]);


  // --- CUSTOM ANIMATION HANDLER (UNCHANGED) ---
  const handleOpenGift = async () => {
    if(uiStep === 'opened' || !cameraRef.current || !controlsRef.current || !giftRef.current || !lidRef.current || !contentRef.current) return;
    setUiStep('opened');
    
    // 🔑 PORNEȘTE MUZICA LA APĂSAREA BUTONULUI
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Începe de la început
      toggleMusic(); // Folosim toggleMusic pentru a iniția redarea și a seta isMusicPlaying
    }

    controlsRef.current.autoRotate = false;
    controlsRef.current.enabled = false;

    // 0. Camera Zoom-In
    await tweenValue(
        { x: cameraRef.current.position.x, y: cameraRef.current.position.y, z: cameraRef.current.position.z },
        { x: 0, y: 3, z: 6 },
        1500,
        easeInOutQuad,
        (val) => {
            cameraRef.current.position.set(val.x, val.y, val.z);
            controlsRef.current.update();
        }
    );

    // 1. Box Shake
    for (let i = 0; i < 6; i++) {
        const shakeRotation = i % 2 === 0 ? 0.1 : -0.1;
        await tweenValue(
            0, shakeRotation, 50, easeOutExpo,
            (val) => giftRef.current.rotation.z = val
        );
    }
    giftRef.current.rotation.z = 0;

    // 2. Confetti Explosion
    if (confettiSystemRef.current) {
        confettiSystemRef.current.mesh.visible = true;
        confettiSystemRef.current.active = true;
    }
    contentRef.current.visible = true;

    // 3. Lid Fly & Content Popup
    const lidPositionStart = { y: lidRef.current.position.y, x: lidRef.current.position.x };
    const lidRotationStart = { z: lidRef.current.rotation.z, x: lidRef.current.rotation.x };

    await Promise.all([
        // Lid Position
        tweenValue(
            lidPositionStart,
            { y: 7, x: -3 },
            1200,
            easeOutExpo,
            (val) => lidRef.current.position.set(val.x, val.y, lidRef.current.position.z)
        ),
        // Lid Rotation
        tweenValue(
            lidRotationStart,
            { z: 2, x: 1 },
            1200,
            easeOutExpo,
            (val) => lidRef.current.rotation.set(val.x, lidRef.current.rotation.y, val.z)
        ),
        // Content Popup Scale
        tweenValue(
            0.1, 1, 1000, easeOutBack,
            (val) => contentRef.current.scale.set(val, val, val),
            () => { controlsRef.current.enabled = true; } // Enable controls on scale complete
        ),
        // Content Popup Position
        tweenValue(
            contentRef.current.position.y,
            1.5,
            1500,
            easeOutExpo,
            (val) => contentRef.current.position.y = val
        )
    ]);
  };

  if (!isClient) return null;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'black' }}>
      
      {/* 3D Container */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />

      {/* UI Layer */}
      <div style={{
          position: 'absolute', 
          top: 0, left: 0, width: '100%', height: '100%', 
          pointerEvents: 'none', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 10
      }}>

        {/* READY TO OPEN UI */}
        {uiStep === 'ready' && (
             <div className="ready-ui" style={{ pointerEvents: 'auto', textAlign: 'center', position: 'absolute', bottom: '15%', padding: '20px' }}>
                 <p className="ready-text" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '15px', fontSize: '1.1rem', letterSpacing: '1px', textShadow: '0 0 5px #000' }}>
                   Cadoul Tau Stefane,te asteapta!
                 </p>
                 <button 
                    onClick={handleOpenGift}
                    className="open-button"
                    style={{
                        padding: '18px 50px', borderRadius: '50px', border: 'none',
                        background: 'linear-gradient(90deg, #ff0080, #7928ca)', 
                        color: 'white', fontWeight: '900', fontSize: '20px',
                        boxShadow: '0 0 30px rgba(255,0,128,0.5), 0 0 10px rgba(121, 40, 202, 0.8)', 
                        cursor: 'pointer',
                        transition: 'transform 0.3s',
                        animation: 'pulse 2s infinite',  
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
                    }}
                 >
                    Deschide-l 🎁
                 </button>
             </div>
        )}

        {/* UI DUPĂ DESCHIDERE (Inclusiv Butonul STOP MUZICA) */}
        {uiStep === 'opened' && (
            <div className="opened-ui-controls" style={{ position: 'absolute', bottom: '20px', display: 'flex', gap: '15px', pointerEvents: 'auto' }}>
                {/* BUTON STOP MUZICA */}
                {isMusicPlaying && (
                    <button 
                        onClick={toggleMusic}
                        className="control-button"
                        style={{
                            padding: '10px 20px', 
                            background: '#ff4757', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        STOP 🎶
                    </button>
                )}
                
                {/* BUTON RESETEAZĂ */}
                <button 
                    onClick={() => window.location.reload()}
                    className="control-button"
                    style={{
                        padding: '10px 20px', background: 'rgba(255,255,255,0.1)', 
                        color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
                >
                    Reseteaza
                </button>
            </div>
        )}

      </div>
      
      <style jsx global>{`
        @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 30px rgba(255,0,128,0.5); } 50% { transform: scale(1.05); box-shadow: 0 0 45px rgba(255,0,128,0.8); } 100% { transform: scale(1); box-shadow: 0 0 30px rgba(255,0,128,0.5); } }
        
        /* --- RESPONSIVE STYLES FOR MOBILE --- */
        @media (max-width: 600px) {
            /* Ready Text */
            .ready-text {
                font-size: 4vw !important; /* Smaller font for message */
                letter-spacing: 0.5px !important;
            }

            /* Main Open Button */
            .open-button {
                padding: 3.5vw 10vw !important; /* Responsive padding */
                font-size: 5vw !important; /* Responsive font size */
                font-weight: 700 !important;
            }

            /* Control Group (Stop Music/Reset) */
            .opened-ui-controls {
                flex-direction: column; /* Stack buttons vertically */
                gap: 10px !important;
                align-items: center;
                bottom: 10% !important; /* Move higher up from the bottom */
                padding: 10px;
            }
            
            /* Individual Control Buttons */
            .control-button {
                width: 70vw; /* Make them wide */
                max-width: 250px;
                padding: 12px !important;
                font-size: 4vw !important; /* Responsive font size */
                border-radius: 25px !important;
            }
        }
      `}</style>
    </div>
  );
}