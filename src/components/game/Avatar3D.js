// Builds a Minecraft/Roblox-style blocky avatar Three.js Group from an
// appearance object. Used by both AvatarCreator (preview) and
// ThirdPersonRenderer (in-world). Pure helper — no React.

import * as THREE from "three";
import { DEFAULT_APPEARANCE } from "@/lib/gameData";

const mat = (color) => new THREE.MeshLambertMaterial({ color });

export function buildAvatar(appearanceIn = {}) {
  const a = { ...DEFAULT_APPEARANCE, ...(appearanceIn || {}) };

  const group = new THREE.Group();
  group.userData.appearance = a;

  const skin = mat(a.skinTone);
  const hair = mat(a.hairColor);
  const top  = mat(a.topColor);
  const bot  = mat(a.bottomColor);
  const sho  = mat(a.shoesColor);
  const blk  = mat("#0a0a0f");

  // ── Head ──
  const headGroup = new THREE.Group();
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), skin);
  head.castShadow = true;
  headGroup.add(head);
  // Eyes
  const eyeGeom = new THREE.BoxGeometry(0.08, 0.08, 0.04);
  const lEye = new THREE.Mesh(eyeGeom, blk); lEye.position.set(-0.13, 0.05, 0.31);
  const rEye = new THREE.Mesh(eyeGeom, blk); rEye.position.set( 0.13, 0.05, 0.31);
  headGroup.add(lEye, rEye);
  // Mouth
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.02), blk);
  mouth.position.set(0, -0.13, 0.31);
  headGroup.add(mouth);

  // ── Hair ──
  if (a.hair !== "buzz") {
    const top1 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.62), hair);
    top1.position.y = 0.39;
    headGroup.add(top1);
  } else {
    const top1 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.62), hair);
    top1.position.y = 0.33;
    headGroup.add(top1);
  }
  if (a.hair === "long") {
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.7, 0.1), hair);
    back.position.set(0, 0.05, -0.32);
    headGroup.add(back);
  }
  if (a.hair === "ponytail") {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.18), hair);
    tail.position.set(0, 0.05, -0.36);
    headGroup.add(tail);
  }
  if (a.hair === "curly") {
    const curl = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.7), hair);
    curl.position.y = 0.42;
    headGroup.add(curl);
  }
  if (a.hair === "pigtails") {
    const lTail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.16), hair);
    lTail.position.set(-0.36, 0.0, 0);
    const rTail = lTail.clone();
    rTail.position.set(0.36, 0.0, 0);
    headGroup.add(lTail, rTail);
  }
  if (a.hair === "medium") {
    const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.1), hair);
    m1.position.set(0, 0.1, -0.32);
    headGroup.add(m1);
  }

  // ── Accessory ──
  if (a.accessory === "cap") {
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.4), mat("#dc2626"));
    brim.position.set(0, 0.32, 0.18);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.62), mat("#dc2626"));
    top.position.y = 0.42;
    headGroup.add(brim, top);
  } else if (a.accessory === "beanie") {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.28, 0.66), mat("#0ea5e9"));
    b.position.y = 0.4;
    headGroup.add(b);
  } else if (a.accessory === "glasses") {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), blk);
    bar.position.set(0, 0.06, 0.32);
    const lLens = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.04), blk);
    lLens.position.set(-0.13, 0.05, 0.32);
    const rLens = lLens.clone(); rLens.position.set(0.13, 0.05, 0.32);
    headGroup.add(bar, lLens, rLens);
  } else if (a.accessory === "headphones") {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.18), blk);
    band.position.y = 0.34;
    const lEar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.18), mat("#a855f7"));
    lEar.position.set(-0.34, 0.16, 0);
    const rEar = lEar.clone(); rEar.position.set(0.34, 0.16, 0);
    headGroup.add(band, lEar, rEar);
  } else if (a.accessory === "crown") {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.16, 0.66), mat("#fbbf24"));
    c.position.y = 0.42;
    headGroup.add(c);
    // Spikes
    for (let i = -1; i <= 1; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), mat("#fbbf24"));
      sp.position.set(i * 0.22, 0.55, 0);
      headGroup.add(sp);
    }
  }

  headGroup.position.y = 1.6;
  group.add(headGroup);
  group.userData.head = headGroup;

  // ── Torso ──
  let torsoGeom;
  if (a.top === "dress") {
    torsoGeom = new THREE.BoxGeometry(0.55, 0.85, 0.32);
  } else if (a.top === "hoodie" || a.top === "jacket") {
    torsoGeom = new THREE.BoxGeometry(0.56, 0.72, 0.34);
  } else {
    torsoGeom = new THREE.BoxGeometry(0.5, 0.7, 0.3);
  }
  const torso = new THREE.Mesh(torsoGeom, top);
  torso.position.y = 1.0;
  torso.castShadow = true;
  group.add(torso);
  group.userData.torso = torso;

  // Hood flap for hoodie
  if (a.top === "hoodie") {
    const hoodie = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.22), top);
    hoodie.position.set(0, 1.32, -0.1);
    group.add(hoodie);
  }
  // Dress flare
  if (a.top === "dress") {
    const flare = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.4), top);
    flare.position.set(0, 0.55, 0);
    group.add(flare);
  }

  // ── Arms (with shoulder pivots) ──
  const armColor = a.top === "tank" ? skin : top;
  const lShoulder = new THREE.Group(); lShoulder.position.set(-0.34, 1.32, 0);
  const rShoulder = new THREE.Group(); rShoulder.position.set( 0.34, 1.32, 0);
  const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.18), armColor);
  const rArm = lArm.clone();
  lArm.position.y = -0.3; rArm.position.y = -0.3;
  lArm.castShadow = rArm.castShadow = true;
  lShoulder.add(lArm); rShoulder.add(rArm);
  group.add(lShoulder, rShoulder);
  group.userData.lShoulder = lShoulder;
  group.userData.rShoulder = rShoulder;

  // Hands
  const handGeom = new THREE.BoxGeometry(0.2, 0.14, 0.2);
  const lHand = new THREE.Mesh(handGeom, skin); lHand.position.y = -0.65;
  const rHand = new THREE.Mesh(handGeom, skin); rHand.position.y = -0.65;
  lShoulder.add(lHand); rShoulder.add(rHand);

  // ── Legs (with hip pivots) ──
  const legLen = a.bottom === "shorts" ? 0.32 : 0.6;
  const legGeom = new THREE.BoxGeometry(0.22, legLen, 0.22);
  const lHip = new THREE.Group(); lHip.position.set(-0.14, 0.65, 0);
  const rHip = new THREE.Group(); rHip.position.set( 0.14, 0.65, 0);
  const lLeg = new THREE.Mesh(legGeom, bot); lLeg.position.y = -legLen/2;
  const rLeg = lLeg.clone();
  lLeg.castShadow = rLeg.castShadow = true;
  lHip.add(lLeg); rHip.add(rLeg);

  // Skirt overlay
  if (a.bottom === "skirt") {
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.28, 0.36), bot);
    skirt.position.y = 0.5;
    group.add(skirt);
  }

  // Lower legs (skin) when shorts
  if (a.bottom === "shorts") {
    const calfGeom = new THREE.BoxGeometry(0.2, 0.32, 0.2);
    const lCalf = new THREE.Mesh(calfGeom, skin); lCalf.position.y = -legLen - 0.16;
    const rCalf = new THREE.Mesh(calfGeom, skin); rCalf.position.y = -legLen - 0.16;
    lHip.add(lCalf); rHip.add(rCalf);
  }

  // Shoes
  const shoeGeom = new THREE.BoxGeometry(0.24, 0.12, 0.32);
  const lShoe = new THREE.Mesh(shoeGeom, sho);
  const rShoe = new THREE.Mesh(shoeGeom, sho);
  const yShoe = a.bottom === "shorts" ? -legLen - 0.36 : -legLen - 0.06;
  lShoe.position.set(0, yShoe, 0.04);
  rShoe.position.set(0, yShoe, 0.04);
  lHip.add(lShoe); rHip.add(rShoe);

  group.add(lHip, rHip);
  group.userData.lHip = lHip;
  group.userData.rHip = rHip;

  // Reasonable bounding so chase cam looks good
  group.userData.height = 2.2;
  return group;
}

// Animate walk: rotate arm & leg pivots in opposite phases. Call each frame.
export function animateAvatar(group, time, isMoving) {
  if (!group?.userData) return;
  const { lShoulder, rShoulder, lHip, rHip, torso } = group.userData;
  if (!lShoulder) return;
  if (isMoving) {
    const sw = Math.sin(time * 9) * 0.7;
    if (lShoulder) lShoulder.rotation.x = -sw;
    if (rShoulder) rShoulder.rotation.x =  sw;
    if (lHip)      lHip.rotation.x      =  sw;
    if (rHip)      rHip.rotation.x      = -sw;
    if (torso)     torso.position.y     = 1.0 + Math.abs(Math.sin(time * 9)) * 0.04;
  } else {
    const breath = Math.sin(time * 2) * 0.05;
    if (lShoulder) lShoulder.rotation.x *= 0.85;
    if (rShoulder) rShoulder.rotation.x *= 0.85;
    if (lHip)      lHip.rotation.x      *= 0.85;
    if (rHip)      rHip.rotation.x      *= 0.85;
    if (torso)     torso.position.y     = 1.0 + breath;
  }
}

export function disposeAvatar(group) {
  if (!group) return;
  group.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
  });
}

export function buildRoxy() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.4), mat("#e0a754"));
  body.position.y = 0.4;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), mat("#e0a754"));
  head.position.set(0.45, 0.55, 0);
  head.castShadow = true;
  group.add(head);
  group.userData.head = head;

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.22), mat("#c98c5a"));
  snout.position.set(0.62, 0.5, 0);
  group.add(snout);

  // Eyes
  const eye = new THREE.BoxGeometry(0.06, 0.06, 0.04);
  const blk = mat("#0a0a0f");
  const e1 = new THREE.Mesh(eye, blk); e1.position.set(0.6, 0.62, 0.13); group.add(e1);
  const e2 = new THREE.Mesh(eye, blk); e2.position.set(0.6, 0.62, -0.13); group.add(e2);

  // Ears (floppy)
  const ear = new THREE.BoxGeometry(0.1, 0.18, 0.05);
  const lEar = new THREE.Mesh(ear, mat("#a05a2c")); lEar.position.set(0.4, 0.74, 0.14);
  const rEar = lEar.clone(); rEar.position.set(0.4, 0.74, -0.14);
  group.add(lEar, rEar);

  // Tail
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.1), mat("#e0a754"));
  tail.position.set(-0.45, 0.55, 0);
  group.add(tail);
  group.userData.tail = tail;

  // Legs
  const legGeom = new THREE.BoxGeometry(0.12, 0.3, 0.12);
  const legMat = mat("#c98c5a");
  const positions = [[0.22, 0.15, 0.14], [0.22, 0.15, -0.14], [-0.22, 0.15, 0.14], [-0.22, 0.15, -0.14]];
  group.userData.legs = [];
  for (const [x, y, z] of positions) {
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    group.add(leg);
    group.userData.legs.push(leg);
  }

  group.userData.height = 0.9;
  return group;
}

export function animateRoxy(group, time, isMoving) {
  if (!group?.userData?.legs) return;
  if (isMoving) {
    const sw = Math.sin(time * 12) * 0.4;
    group.userData.legs[0].rotation.x =  sw;
    group.userData.legs[1].rotation.x = -sw;
    group.userData.legs[2].rotation.x = -sw;
    group.userData.legs[3].rotation.x =  sw;
    if (group.userData.tail) group.userData.tail.rotation.y = Math.sin(time * 10) * 0.4;
  } else {
    if (group.userData.tail) group.userData.tail.rotation.y = Math.sin(time * 4) * 0.6; // wag
  }
}
