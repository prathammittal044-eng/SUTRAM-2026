import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CaseTraceAnimationProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * CaseTraceAnimation — real-time 3D investigation loop (30s, 4:5).
 * The CaseTrace logo is traced from the supplied PNG into vector contours and
 * extruded with ExtrudeGeometry, so no image asset is needed at runtime.
 * Props: className, style.
 */
export default function CaseTraceAnimation({ className = '', style }: CaseTraceAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let api: { dispose: () => void } | null = null;
    try {
      api = createCaseTrace(THREE, ref.current, {});
    } catch (err) {
      console.warn('Using 2D investigation fallback:', err);
      api = createCaseTrace2DFallback(ref.current, {});
    }
    return () => {
      if (api && typeof api.dispose === 'function') {
        try {
          api.dispose();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      role="img"
      aria-label="Animated story: an investigator turns scattered digital evidence into a verified, chronological case."
      style={{ width: '100%', aspectRatio: '4 / 5', ...style }}
    />
  );
}

const LOGO_DATA: [number[], number[][]][] = [
  [[1460,1588,1460,1692,1530,1692,1530,1677,1479,1677,1478,1676,1478,1648,1479,1647,1527,1647,1527,1632,1479,1632,1478,1631,1478,1604,1479,1603,1530,1603,1530,1588],[]],
  [[1253,1588,1206,1692,1225,1692,1235,1669,1286,1669,1288,1671,1297,1692,1316,1692,1269,1588],[[1261,1608,1280,1653,1279,1654,1242,1654,1241,1652,1258,1612]]],
  [[1099,1588,1099,1692,1118,1692,1118,1652,1119,1651,1142,1652,1150,1661,1166,1692,1187,1692,1168,1657,1164,1652,1157,1648,1173,1640,1179,1631,1181,1623,1181,1615,1179,1606,1174,1598,1164,1591,1153,1588],[[1118,1604,1119,1603,1149,1603,1156,1606,1161,1611,1162,1614,1161,1628,1157,1633,1151,1636,1119,1637,1118,1636]]],
  [[979,1588,979,1604,1013,1604,1014,1605,1014,1692,1033,1692,1033,1605,1034,1604,1069,1604,1069,1588],[]],
  [[826,1588,826,1692,896,1692,896,1677,845,1677,844,1676,844,1648,845,1647,893,1647,893,1632,845,1632,844,1631,844,1604,845,1603,896,1603,896,1588],[]],
  [[624,1588,577,1692,596,1692,606,1669,657,1669,659,1671,668,1692,687,1692,640,1588],[[632,1608,651,1653,650,1654,613,1654,612,1652,629,1612]]],
  [[1374,1588,1362,1593,1355,1598,1348,1606,1343,1615,1339,1630,1339,1650,1343,1665,1348,1674,1355,1682,1362,1687,1371,1691,1379,1693,1401,1693,1412,1690,1425,1682,1419,1667,1414,1671,1399,1677,1384,1677,1373,1673,1364,1664,1360,1655,1358,1643,1359,1629,1364,1616,1373,1607,1384,1603,1399,1603,1406,1605,1419,1613,1422,1608,1425,1598,1415,1591,1402,1587,1389,1586],[]],
  [[776,1590,765,1587,755,1587,754,1586,742,1587,727,1592,716,1602,712,1611,712,1625,718,1637,723,1641,735,1646,765,1652,772,1657,774,1664,772,1670,768,1674,756,1678,737,1677,724,1673,715,1668,710,1681,711,1684,721,1689,737,1693,762,1693,775,1689,787,1679,792,1668,792,1657,788,1647,780,1640,771,1636,738,1629,731,1623,730,1615,733,1609,740,1604,748,1602,765,1603,783,1612,789,1598],[]],
  [[504,1588,492,1593,485,1598,478,1606,473,1615,469,1630,469,1650,473,1665,478,1674,485,1682,492,1687,501,1691,509,1693,531,1693,542,1690,555,1682,549,1667,544,1671,529,1677,514,1677,503,1673,494,1664,490,1655,488,1643,489,1629,494,1616,503,1607,514,1603,529,1603,536,1605,549,1613,552,1608,555,1598,545,1591,532,1587,519,1586],[]],
  [[1320,926,1317,929,1316,933,1316,949,1318,963,1321,969,1327,974,1336,977,1345,977,1357,972,1361,968,1364,962,1367,948,1367,936,1364,929,1357,925,1345,923,1334,923],[]],
  [[1222,834,1218,837,1215,844,1216,862,1222,879,1228,885,1239,889,1251,889,1261,885,1267,879,1270,872,1271,844,1269,835,1266,832,1261,830,1236,830],[]],
  [[1324,816,1319,818,1312,824,1308,831,1306,838,1305,851,1306,852,1310,905,1312,910,1321,917,1339,920,1357,920,1360,919,1365,913,1366,849,1364,838,1358,826,1351,820,1345,817,1335,815],[]],
  [[1346,725,1342,725,1338,727,1322,744,1316,755,1316,762,1319,770,1328,779,1337,783,1347,783,1359,777,1371,766,1374,760,1374,755,1369,745,1358,733],[]],
  [[1257,709,1252,708,1240,709,1227,714,1219,722,1214,732,1212,741,1212,771,1213,772,1215,816,1217,822,1222,826,1238,826,1261,822,1267,820,1273,814,1275,810,1277,757,1278,756,1277,734,1275,727,1270,718,1265,713],[]],
  [[1424,649,1412,647,1405,649,1393,656,1352,705,1351,715,1353,720,1366,737,1378,748,1385,748,1391,744,1428,708,1440,691,1443,679,1440,665,1437,660,1429,652],[]],
  [[963,623,962,643,959,660,953,677,944,691,930,704,914,712,888,718,871,718,871,858,917,858,919,860,919,955,921,967,925,979,931,991,937,999,953,1013,968,1021,982,1026,999,1030,1028,1033,1050,1033,1051,1032,1072,1031,1097,1026,1123,1017,1123,887,1096,893,1077,893,1062,890,1056,887,1048,879,1046,874,1046,859,1047,858,1126,858,1126,718,1047,718,1046,717,1046,623],[]],
  [[767,235,512,447,512,1166,776,1386,1234,1386,1404,1246,1466,1193,1466,984,1159,984,1126,1104,900,1104,851,1064,851,557,900,518,1125,518,1129,526,1142,577,1160,639,1466,639,1466,422,1243,235],[]]
];

function createCaseTrace(THREE: any, host: HTMLElement, opts: any) {
  const o = opts || {}, V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v)), seg = (t: number, a: number, b: number) => cl((t - a) / (b - a)), lp = (a: number, b: number, k: number) => a + (b - a) * k;
  const ez = (x: number) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, sm = (k: number) => k * k * (3 - 2 * k);
  const lp3 = (a: any, b: any, k: number) => a.clone().lerp(b, k);
  function kf(K: number[][], t: number) { if (t <= K[0][0]) return K[0].slice(1); for (let i = 0; i < K.length - 1; i++) if (t <= K[i + 1][0]) { const k = sm(seg(t, K[i][0], K[i + 1][0])); return K[i].slice(1).map((v, j) => lp(v, K[i + 1][j + 1], k)) } return K[K.length - 1].slice(1) }
  const LI = (+THREE.REVISION >= 155) ? Math.PI : 1, tex = (c: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(c); if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; return t };
  const ORG = new THREE.Color(0xff5a1f), WHT = new THREE.Color(0xf5f5f0), GRY = new THREE.Color(0x8a8a8a);

  // ---------- renderer / scene ----------
  host.style.position = 'relative'; host.style.overflow = 'hidden'; host.style.background = '#080808';
  let renderer: any;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, failIfMajorPerformanceCaveat: false });
  } catch (err) {
    console.warn('WebGL renderer creation failed:', err);
    return createCaseTrace2DFallback(host, o);
  }

  renderer.setClearColor(0x080808); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const el = renderer.domElement; el.style.cssText = 'display:block;width:100%;height:100%'; host.appendChild(el);
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x080808, .06);
  const cam = new THREE.PerspectiveCamera(42, .8, .1, 60);
  function size() { const w = host.clientWidth || 400, h = host.clientHeight || 500; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix() }
  size(); const ro = new ResizeObserver(size); ro.observe(host);
  // grain + vignette overlay
  const nc = document.createElement('canvas'); nc.width = nc.height = 96; { const g = nc.getContext('2d')!, d = g.createImageData(96, 96); for (let i = 0; i < d.data.length; i += 4) { d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; d.data[i + 3] = Math.random() * 40 } g.putImageData(d, 0, 0) }
  const ov = document.createElement('div'); ov.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:.5;background:radial-gradient(ellipse at 50% 45%,transparent 55%,rgba(0,0,0,.55)),url(' + nc.toDataURL() + ')'; host.appendChild(ov);

  // ---------- lights ----------
  const amb = new THREE.AmbientLight(0xffffff, .25 * LI), key = new THREE.SpotLight(0xffffff, 1.4 * LI, 30, .7, 1, 1), rim = new THREE.DirectionalLight(0xffffff, .5 * LI), spot = new THREE.SpotLight(0xffffff, 0, 12, .35, .8, 1);
  key.position.set(0, 7, 3); rim.position.set(0, 3, -6); scene.add(amb, key, key.target, rim, spot, spot.target);
  const poolTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!, r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return tex(c) })();
  const mkPool = (z: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(z, z), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, fog: false, opacity: 0 })); m.rotation.x = -Math.PI / 2; m.position.y = .004; scene.add(m); return m }, casePool = mkPool(2.4), heroPool = mkPool(1.2);
  const logoL = new THREE.DirectionalLight(0xffffff, 0); logoL.position.set(-2.5, 3, 5); scene.add(logoL);

  // ---------- helpers ----------
  const mat = (c = 0xe9e9e4, e = 0x1a1a1a) => new THREE.MeshStandardMaterial({ color: c, roughness: .8, emissive: e });
  const edges = (geo: any, col = 0xffffff, op = .9) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op }));
  function solid(geo: any, m: any, ec?: number) { const g = new THREE.Group(), me = new THREE.Mesh(geo, m), ed = edges(geo, ec || 0xffffff, .55); g.add(me, ed); g.userData = { m, ed }; return g }
  function label(txt: string, w: number, col = '#f5f5f0') { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d')!; g.font = '600 38px "Courier New",monospace'; g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 256, 48);
    const m = new THREE.SpriteMaterial({ map: tex(c), transparent: true, depthWrite: false, fog: false, opacity: 0 }), s = new THREE.Sprite(m); s.scale.set(w, w * 96 / 512, 1); scene.add(s); return s }
  function line(n: number, col = 0xffffff) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0 })); l.frustumCulled = false; scene.add(l); return l }
  function setLine(l: any, pts: any[], op: number, col?: any) { const a = l.geometry.attributes.position; pts.forEach((p, i) => a.setXYZ(i, p.x, p.y, p.z)); a.needsUpdate = true; l.geometry.setDrawRange(0, pts.length); l.material.opacity = op; if (col) l.material.color.copy(col) }
  const Yv = V(0, 1, 0), _d = V(0, 0, 0);
  function bone(m: any, a: any, b: any) { _d.subVectors(b, a); const L = _d.length() || 1e-4; m.position.copy(a).addScaledVector(_d, .5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(Yv, _d.divideScalar(L)) }

  // ---------- characters ----------
  function Man(col: number, emi: number, H: number, lensOn: boolean) {
    const m = mat(col, emi), B: any[] = [], J: any[] = [];
    for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.011, .011, 1, 6), m); scene.add(b); B.push(b) }
    for (let i = 0; i < 8; i++) { const j = new THREE.Mesh(new THREE.SphereGeometry(.02 * H, 8, 6), m); scene.add(j); J.push(j) }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.085 * H, .008 * H, 6, 28), m), brim = new THREE.Mesh(new THREE.TorusGeometry(.15 * H, .007 * H, 6, 28), m),
      crown = edges(new THREE.CylinderGeometry(.078 * H, .09 * H, .075 * H, 14, 1, true), 0xf5f5f0, .9), coat = edges(new THREE.CylinderGeometry(.07 * H, .2 * H, .6 * H, 12, 1, true), 0xf5f5f0, .5),
      lens = new THREE.Mesh(new THREE.TorusGeometry(.075 * H, .008 * H, 6, 24), m); brim.rotation.x = Math.PI / 2;
    const all = [...B, ...J, ring, brim, crown, coat, lens]; all.forEach(x => scene.add(x));
    return { m, hand: V(0, 1, 0), show(v: boolean) { all.forEach(x => x.visible = v) },
      pose(x: number, z: number, psi: number, ph: number, mv: boolean, P: any) {
        P = P || {}; const f = V(Math.sin(psi), 0, Math.cos(psi)), r = V(Math.cos(psi), 0, -Math.sin(psi)), up = V(0, 1, 0), lean = P.lean || 0;
        const sw = mv ? Math.sin(ph) : 0, bob = mv ? Math.abs(Math.cos(ph)) * .025 : 0;
        const W = (a: number, b: number, c: number) => V(x, 0, z).addScaledVector(r, a * H).addScaledVector(up, b * H).addScaledVector(f, c * H);
        const hip = W(0, .6 - bob, 0), sh = W(0, 1 - bob - lean * .04, lean * .22), neck = W(0, 1.04 - bob, lean * .25), hc = W(0, 1.19 - bob, lean * .33);
        const foot = (s: number) => W(s * .07, mv ? Math.max(0, Math.cos(ph) * s) * .07 : 0, sw * s * .22), fL = foot(1), fR = foot(-1), kn = (ft: any) => hip.clone().add(ft).multiplyScalar(.5).addScaledVector(f, .08 * H);
        const shL = sh.clone().addScaledVector(r, .05 * H), shR = sh.clone().addScaledVector(r, -.05 * H);
        const idle = (s0: any, s: number) => s0.clone().addScaledVector(up, -.4 * H).addScaledVector(f, -sw * s * .17 * H).addScaledVector(r, s * .04 * H);
        const solve = (s0: any, i0: any, tg: any, a: number) => { if (!tg || a <= 0) return i0; const d = tg.clone().sub(s0), L = d.length() || 1, k = Math.min(.55 * H, L) / L; return i0.clone().lerp(s0.clone().addScaledVector(d, k), a) };
        let hL = idle(shL, 1), hR = idle(shR, -1);
        hR = solve(shR, hR, P.tgt, P.amt || 0);
        if (P.loupe > 0) hL = solve(shL, hL, P.look, P.loupe);
        if (P.chin > 0) hR = solve(shR, hR, hc.clone().addScaledVector(up, -.1 * H).addScaledVector(f, .08 * H), P.chin);
        if (P.start > 0) { const rt = sh.clone().addScaledVector(up, .12 * H).addScaledVector(f, .3 * H); hL = solve(shL, hL, rt, P.start); hR = solve(shR, hR, rt, P.start) }
        const el = (s0: any, h: any, sg: number) => s0.clone().add(h).multiplyScalar(.5).addScaledVector(up, -.07 * H).addScaledVector(r, sg * .05 * H), eL = el(shL, hL, 1), eR = el(shR, hR, -1), kL = kn(fL), kR = kn(fR);
        bone(B[0], hip, neck); bone(B[1], neck, hc.clone().addScaledVector(up, -.085 * H));
        bone(B[2], shL, eL); bone(B[3], eL, hL); bone(B[4], shR, eR); bone(B[5], eR, hR);
        bone(B[6], hip, kL); bone(B[7], kL, fL); bone(B[8], hip, kR); bone(B[9], kR, fR);
        bone(B[10], fL, fL.clone().addScaledVector(f, .09 * H)); bone(B[11], fR, fR.clone().addScaledVector(f, .09 * H));
        bone(B[13], hc.clone().addScaledVector(f, .1 * H), hc.clone().addScaledVector(f, .17 * H));
        [eL, eR, kL, kR, hL, hR, hip, sh].forEach((p, i) => J[i].position.copy(p));
        ring.position.copy(hc); ring.lookAt(cam.position); ring.rotateZ(P.tilt || 0); brim.position.copy(hc).addScaledVector(up, .07 * H).addScaledVector(f, .01 * H); crown.position.copy(hc).addScaledVector(up, .105 * H);
        coat.position.copy(W(0, .7 - bob, lean * .1)); coat.rotation.x = -lean * .12;
        const ld = P.look && P.loupe > 0 ? P.look.clone().sub(hL).normalize() : f.clone().multiplyScalar(.5).add(V(0, -.4, 0)).normalize(), lp0 = hL.clone().addScaledVector(ld, .1 * H);
        lens.visible = !!lensOn; B[12].visible = !!lensOn; if (lensOn) { lens.position.copy(lp0); lens.lookAt(lp0.clone().add(P.loupe > 0 ? ld : V(0, 0, 1))); bone(B[12], hL, lp0.clone().addScaledVector(ld, -.075 * H)) }
        this.hand.copy(hR) } };
  }
  const hero = Man(0xf5f5f0, 0x2a2a26, 1.3, true), foe = Man(0x4a4a4a, 0x1c0a02, 1.2, false); foe.show(false);

  // ---------- evidence ----------
  const NAMES = 7, evs: any[] = [];
  const RR = (w: number, h: number, r: number) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s };
  const PS = (a: number[][]) => { const s = new THREE.Shape(); a.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return s };
  const EX = (s: any, d = .035) => { const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 6 }); g.translate(0, 0, -d / 2); return g };
  const mDark = mat(0x1a1a1a, 0x050505), mGr = mat(0x8a8a86, 0x101010);
  const G = (m: any) => { const g = new THREE.Group(); g.userData = { m, eds: [] }; return g };
  const part = (g: any, geo: any, m: any, x = 0, y = 0, z = 0, ed = true) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); g.add(me); if (ed) { const e = edges(geo, 0xffffff, .55); e.position.copy(me.position); g.add(e); if (m === g.userData.m) g.userData.eds.push(e) } return me };
  const bx = (g: any, w: number, h: number, x: number, y: number, m = mGr, z = .024) => part(g, new THREE.BoxGeometry(w, h, .01), m, x, y, z, false);
  const mk = [
    () => { const m = mat(), g = G(m); part(g, EX(RR(.38, .24, .05)), m); part(g, EX(PS([[-.14, -.12], [-.04, -.12], [-.15, -.21]])), m); bx(g, .24, .022, 0, .05); bx(g, .17, .022, -.035, 0); bx(g, .21, .022, -.01, -.05); return g },
    () => { const m = mat(), g = G(m); part(g, EX(PS([[-.135, -.175], [.135, -.175], [.135, .09], [.05, .175], [-.135, .175]])), m); part(g, EX(PS([[.05, .175], [.05, .09], [.135, .09]]), .045), mGr, 0, 0, .005, false); [[.17, .02], [.17, -.04], [.12, -.1]].forEach(([w, y]) => bx(g, w, .022, -.02 - (.17 - w) / 2, y - .01)); bx(g, .1, .022, -.05, .125); return g },
    () => { const m = mat(), g = G(m); part(g, EX(RR(.4, .3, .03)), m); part(g, new THREE.BoxGeometry(.34, .24, .01), mDark, 0, 0, .022, false); part(g, EX(PS([[-.16, -.11], [-.05, .05], [.03, -.11]])), m, 0, 0, .03, false); part(g, EX(PS([[-.02, -.11], [.07, .0], [.16, -.11]])), m, 0, 0, .03, false); const sn = part(g, new THREE.CylinderGeometry(.03, .03, .012, 16), m, .09, .07, .032, false); sn.rotation.x = Math.PI / 2; return g },
    () => { const m = mat(), g = G(m); part(g, EX(RR(.4, .3, .03)), m); part(g, new THREE.BoxGeometry(.34, .24, .01), mDark, 0, 0, .022, false); [[.2, .07], [.27, .02], [.14, -.03], [.22, -.08]].forEach(([w, y]) => bx(g, w, .02, -.15 + w / 2 + .02, y, m, .03)); return g },
    () => { const m = mat(), g = G(m); part(g, EX(RR(.22, .4, .035)), m); part(g, new THREE.BoxGeometry(.18, .3, .01), mDark, 0, .015, .022, false); part(g, new THREE.CylinderGeometry(.012, .012, .01, 10), m, 0, -.175, .022, false).rotation.x = Math.PI / 2; return g },
    () => { const m = mat(), g = G(m); part(g, new THREE.SphereGeometry(.15, 18, 12), mDark, 0, 0, 0, false); [[0, 0, 0], [0, Math.PI / 2, 0], [Math.PI / 2, 0, 0]].forEach(r => part(g, new THREE.TorusGeometry(.152, .007, 6, 36), m, 0, 0, 0, false).rotation.set(r[0], r[1], r[2])); return g },
    () => { const m = mat(), g = G(m), c = part(g, new THREE.CylinderGeometry(.15, .15, .035, 32), m); c.rotation.x = Math.PI / 2; part(g, new THREE.CylinderGeometry(.125, .125, .01, 32), mDark, 0, 0, .02, false).rotation.x = Math.PI / 2;
      [[0, .1], [.1, 0], [0, -.1], [-.1, 0]].forEach(([x, y]) => bx(g, .014, .024, x, y, m, .028)); g.userData.h = [0, 1].map(k => { const p = new THREE.Group(), h = new THREE.Mesh(new THREE.BoxGeometry(.014, k ? .06 : .09, .01), m); h.position.y = (k ? .03 : .045); p.add(h); p.position.z = .03; g.add(p); return p }); return g }
  ];
  for (let i = 0; i < NAMES; i++) { const e = mk[i](); e.scale.setScalar(0); scene.add(e); evs.push(e) }
  const CASEP = V(0, .08, 1.6), CENTER = V(0, 1.55, 0), CONT = V(-1.7, .2, 1.3);
  const SC = [[-1.5, 1.2, -.5], [1.4, 1.7, -1], [1.6, .7, .6], [-1.6, .5, .8], [-.8, 1.8, -1.6], [1, .4, -1.7], [0, 1, -2.2]].map(a => V(a[0], a[1], a[2]));
  const GR = [[-1.15, 1.5, -.8], [0, 1.9, -1.2], [1.15, 1.4, -.6], [-1.2, .7, .2], [0, 1, -.3], [1.2, .75, .5], [0, 1.45, -2]].map(a => V(a[0], a[1], a[2]));
  const TLX = [-2, -1, 0, 1, 2], TL: Record<number, number> = { 3: 0, 1: 1, 0: 2, 4: 3, 5: 4 }, EVN = ['LOGIN', 'FILE ACCESS', 'MESSAGE', 'DEVICE ACTIVITY', 'TRANSFER'];
  const EDG = [[0, 6], [6, 1], [1, 4], [4, 3], [2, 4], [5, 4], [0, 3]], cEnd = (i: number) => 5.4 + .4 * i, eStart = (e: number[]) => Math.max(cEnd(e[0]), cEnd(e[1])) + .2;
  const elines = EDG.map(() => line(3));
  // case file, container, containment
  const caseG = new THREE.Group(), caseBase = solid(new THREE.BoxGeometry(.5, .1, .36), mat(0xcfcfca)), caseLidP = new THREE.Group(), caseLid = solid(new THREE.BoxGeometry(.5, .04, .36), mat(0xe9e9e4)); caseLid.position.set(0, .02, .18); caseLidP.position.set(0, .05, -.18); caseLidP.add(caseLid); caseG.add(caseBase, caseLidP); scene.add(caseG);
  const contG = new THREE.Group(), contBase = solid(new THREE.BoxGeometry(.55, .22, .38), mat(0x1c1c1c, 0x0a0a0a)), contLidP = new THREE.Group(), contLid = solid(new THREE.BoxGeometry(.55, .04, .38), mat(0x1c1c1c, 0x0a0a0a)); contLid.position.set(0, .02, .19); contLidP.position.set(0, .11, -.19); contLidP.add(contLid); contG.add(contBase, contLidP); contG.position.set(-1.7, .11, 1.3); scene.add(contG);
  const isoG = edges(new THREE.BoxGeometry(.7, .5, .7), 0x8a8a8a, .9); isoG.position.set(2.3, .25, -1.8); scene.add(isoG);
  const orb = new THREE.Mesh(new THREE.OctahedronGeometry(.07), new THREE.MeshBasicMaterial({ color: 0xff5a1f, fog: false })); orb.visible = false; scene.add(orb);
  // records
  const REC = [V(-1.25, .6, .1), V(1.25, .6, .1)], recs = ['09:18 — FILE ACCESS', '09:17 — DEVICE OFFLINE'].map((s, i) => { const g = solid(new THREE.BoxGeometry(1, .3, .03), mat(0x161616, 0x0a0a0a)); g.position.copy(REC[i]); g.scale.setScalar(0); const lb = label(s, .86); lb.position.copy(REC[i]).add(V(0, 0, .03)); scene.add(g); return { g, lb } });
  const confl = line(25, 0xff5a1f);
  // labels
  const vt = ['HASH VERIFIED', 'SOURCE CONFIRMED', 'CHAIN OF CUSTODY'].map((s, i) => { const l = label(s, .95); l.position.set(1.05, 1.5 - i * .15, -.1); const d = new THREE.Mesh(new THREE.SphereGeometry(.022, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff5a1f, fog: false })); d.position.set(.62, 1.5 - i * .15, -.1); d.scale.setScalar(0); scene.add(d); return { l, d } });
  const sLab = label('SUSPICIOUS', .8, '#ff5a1f'), iLab = label('ISOLATED', .7, '#ff5a1f'), cLab = label('CONFLICT', .8, '#ff5a1f'), tag = label('FROM DIGITAL TRACES TO INVESTIGATIVE CLARITY.', 2.8, '#8a8a8a');
  const tlG = TLX.map((x, j) => { const a = label(EVN[j], .7, '#8a8a8a'), b = label(EVN[j], .7, '#ff5a1f'); [a, b].forEach(s => s.position.set(x, .98, .6)); return { a, b } });
  const axis = line(2), stems = TLX.map(() => line(2));
  // 3D logo traced from the supplied PNG (vector contours -> ExtrudeGeometry)
  const LS = 3.6 / 2000, logoG = new THREE.Group(), pieces: any[] = [], uni = { uS: { value: -9 }, uI: { value: 0 } };
  logoG.position.set(0, 1.55, 0); logoG.visible = false; scene.add(logoG);
  const logoM = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: .42, metalness: .2, emissive: 0x161616, transparent: true, opacity: 0 });
  logoM.onBeforeCompile = (sh: any) => { sh.uniforms.uS = uni.uS; sh.uniforms.uI = uni.uI;
    sh.vertexShader = 'varying vec3 vCP;varying vec3 vCN;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvCP=position;vCN=normal;');
    sh.fragmentShader = 'uniform float uS;uniform float uI;varying vec3 vCP;varying vec3 vCN;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n{float b=exp(-pow((vCP.x-uS)*2.4,2.0));float sd=1.0-abs(vCN.z);totalEmissiveRadiance+=vec3(1.0,.35,.1)*b*uI*(.08+sd*1.6);}') };
  LOGO_DATA.forEach(([outer, holes], i) => {
    const pt = (a: number[]) => { const r: any[] = []; for (let k = 0; k < a.length; k += 2) r.push(new THREE.Vector2((a[k] - 1000) * LS, (1000 - a[k + 1]) * LS)); return r };
    const sh = new THREE.Shape(pt(outer)); holes.forEach((h: number[]) => sh.holes.push(new THREE.Path(pt(h))));
    const g = new THREE.ExtrudeGeometry(sh, { depth: .09, bevelEnabled: true, bevelThickness: .008, bevelSize: .004, bevelOffset: -.004, bevelSegments: 1, curveSegments: 1 }); g.translate(0, 0, -.045); g.computeBoundingBox();
    const m = new THREE.Mesh(g, logoM), c = g.boundingBox!.getCenter(new THREE.Vector3()); logoG.add(m); pieces.push({ m, c, i, j: Math.max(0, Math.min(4, Math.round((c.x + 1) * 2))) }) });

  // ---------- timelines ----------
  const CK = [[0, -4.4, 1.6], [2.2, -.9, 1.6], [3.4, -.7, 1.6], [4.2, -.7, 1.6], [5.2, -1.4, .7], [6.3, -.4, .4], [7.4, .9, .4], [8.2, .3, .7], [9, .3, .7], [10.4, -1.5, 1.3], [11.4, -1.5, 1.3], [12.4, -.6, 1], [12.9, -.6, 1], [13.7, 1.2, .5], [14.4, 1.4, .4], [15.4, 1.7, -.9], [16.2, -.5, .9], [17, -.5, .9], [18, .3, .9], [18.3, .35, .9], [19.3, .1, 1.2], [20.4, 0, 1.2], [21.2, -2, 1.4], [22, -2, 1.4], [22.8, -1, 1.4], [23.6, 0, 1.4], [24.4, 1, 1.4], [25.2, 2, 1.4], [26.6, -2, .8], [29.2, -2, .8], [30, -4.4, 1.6]];
  const FK = [[12, 4.4, -.4], [12.9, 1.4, -.35], [14.1, 1.4, -.35], [14.7, 2.1, -.4], [15.9, 4.6, -.4]], OK = [[12.4, 4, 1, -.5], [13, 2.9, .95, -.45], [13.8, 2.3, .95, -.4], [14.4, 2.3, .95, -.4], [15.4, 2.3, .3, -1.8], [30, 2.3, .3, -1.8]];
  const CAM = [[0, 0, 2.4, 8.6, 0, .8, 0], [3.5, .3, 2, 7.2, 0, .7, .8], [6, -.7, 2.2, 7.4, 0, .9, -.4], [8, 0, 1.9, 6.8, 0, 1, -.2], [11, 0, 2, 6.8, .1, .9, .2], [12.5, .5, 1.6, 6.9, .8, .8, -.3], [15.5, .8, 1.5, 6.7, 1, .8, -.6], [17, 0, 1.9, 6.8, 0, .9, 0], [18.4, 0, 1.7, 5.9, 0, .95, .2], [19.5, 0, 1.9, 6.6, 0, .9, .1], [22, 0, 3, 10.5, 0, 1, .8], [25, 0, 3, 10.5, 0, 1.1, .5], [27.5, 0, 1.8, 9.6, 0, 1.55, 0], [29.2, 0, 1.8, 9.6, 0, 1.55, 0], [30, 0, 2.4, 8.6, 0, .8, 0]];
  const D = [0]; { let p = kf(CK, 0); for (let i = 1; i <= 900; i++) { const q = kf(CK, i / 30); D.push(D[i - 1] + Math.hypot(q[0] - p[0], q[1] - p[1])); p = q } }
  let psi = Math.PI / 2, psi2 = -Math.PI / 2, evPos = evs.map(() => V(0, 0, 0)), seen = false;
  const slotP = (j: number) => V(TLX[j], .55, .6);
  function update(t: number) {
    const out = 1 - seg(t, 25.6, 27), c = ez(seg(t, 25.6, 27.2)), win = (a: number, b: number, r = .3) => ez(seg(t, a, a + r)) * (1 - ez(seg(t, b - r, b)));
    const fv = t > 12 && t < 16.3, pull = ez(seg(t, 12.9, 13.6)) * (1 - ez(seg(t, 13.9, 14.2))), gm = evPos[2].clone().lerp(evPos[4], .5);
    // case
    const cs = t < 5 ? 1 - ez(seg(t, 4.4, 5.2)) : ez(seg(t, 28.6, 29.6)); caseG.scale.setScalar(cs);
    const carry = ez(seg(t, 2.8, 3.2)) * (1 - ez(seg(t, 4, 4.4))), cp = lp3(CASEP, hero.hand.clone().add(V(0, .1, 0)), carry); if (t < 5) caseG.position.copy(cp); else caseG.position.copy(CASEP.clone().add(V(-.7, 0, -.3)));
    caseLidP.rotation.x = ez(seg(t, 3.1, 3.9)) * 1.9 * (t < 10 ? 1 : 0);
    // evidence
    const dev = evs[4], hl = evs.map(() => 0);
    EDG.forEach(e => { const s = eStart(e), k = (1 - seg(t, s + .3, s + 1.6)) * seg(t, s, s + .2); hl[e[0]] = Math.max(hl[e[0]], k); hl[e[1]] = Math.max(hl[e[1]], k) });
    const mx = kf(CK, t)[0], ac = t > 21.3 && t < 25.4;
    evs.forEach((e, i) => {
      let p = lp3(CASEP.clone().add(V(0, .3, 0)), SC[i], ez(seg(t, 3.3 + .12 * i, 4.6 + .12 * i))); p.lerp(GR[i], ez(seg(t, 4.4 + .4 * i, 5.4 + .4 * i)));
      if (i == 4) { p.lerp(hero.hand, ez(seg(t, 8.5, 8.9))); p.lerp(CONT.clone().add(V(0, .05, 0)), ez(seg(t, 10.3, 10.8))) }
      if (i in TL) { const j = TL[i]; p.lerp(slotP(j), ez(seg(t, 20.2 + .3 * j, 21.4 + .3 * j))); if (ac && Math.abs(mx - TLX[j]) < .45) hl[i] = 1 }
      if (seg(t, 5.5, 20) > 0 && t < 20.2) p.y += Math.sin(t * 1.2 + i * 2) * .03;
      p.lerp(CENTER, c); e.position.copy(p); evPos[i].copy(p);
      e.rotation.y = (1 - c) * Math.sin(t * .5 + i) * .3; if (e.userData.h) { e.userData.h[0].rotation.z = -t * .6; e.userData.h[1].rotation.z = -t * .05 }
      let s = ez(seg(t, 3.3 + .12 * i, 3.9 + .12 * i)) * (1 - c) * (i in TL ? 1 : 1 - ez(seg(t, 20, 21))); if (t > 28) s = 0; e.scale.setScalar(s);
      const u = e.userData, k = hl[i]; u.m.color.copy(WHT).lerp(ORG, k); u.m.emissive.setHex(0x1a1a1a).lerp(new THREE.Color(0x5a1a00), k);
      (u.eds || []).forEach((d: any) => d.material.color.copy(WHT).lerp(ORG, k)) });
    // edges
    EDG.forEach((e, k) => { const s = eStart(e), pr = ez(seg(t, s, s + .7)), A = evPos[e[0]], B = evPos[e[1]], act = 1 - seg(t, s + .3, s + 1.6);
      const E = A.clone().lerp(B, pr), M = A.clone().lerp(E, .5); let col = WHT.clone().lerp(ORG, act);
      if (k == 4 && pull > 0) { M.lerp(foe.hand, pull); M.y += Math.sin(t * 38) * .012 * pull; col = WHT.clone().lerp(ORG, pull) }
      setLine(elines[k], [A, M, E], pr > 0 ? .85 * out * (1 - ez(seg(t, 20.2, 21.2))) : 0, col) });
    // container
    contG.scale.setScalar(ez(seg(t, 8.3, 8.9)) * (1 - ez(seg(t, 21.4, 22.2)))); contLidP.rotation.x = cl(1 - ez(seg(t, 10.5, 11)) + ez(seg(t, 20.1, 20.8))) * 1.8;
    // verification + dim
    const dim = ez(seg(t, 8.4, 9)) * (1 - ez(seg(t, 10.8, 11.4)));
    key.intensity = lp(1.4, .35, dim) * LI; amb.intensity = lp(.25, .06, dim) * LI; spot.intensity = dim * 3 * LI; spot.position.copy(dev.position).add(V(0, 3, 1.5)); spot.target.position.copy(dev.position);
    vt.forEach((v, i) => { const a = ez(seg(t, 9 + i * .7, 9.5 + i * .7)) * (1 - seg(t, 11.2, 11.8)); v.l.material.opacity = a; v.d.scale.setScalar(a) });
    // intruder
    foe.show(fv);
    const oc = ez(seg(t, 14.2, 14.6)), od = ez(seg(t, 15.2, 15.7)), OP = gm.clone().lerp(foe.hand, .6 * (1 - ez(seg(t, 14, 14.3)))).lerp(hero.hand, oc).lerp(V(2.3, .3, -1.8), od);
    orb.visible = t > 13.9 && t < 20.3; orb.position.copy(OP); orb.rotation.y = t * 2; orb.scale.setScalar(ez(seg(t, 13.9, 14.2)) * (1 - ez(seg(t, 19.8, 20.3))));
    isoG.scale.setScalar(ez(seg(t, 14.2, 14.8)) * (1 - ez(seg(t, 20, 20.8)))); isoG.material.color.copy(GRY).lerp(ORG, seg(t, 15.3, 15.7));
    sLab.position.copy(OP).add(V(0, .32, 0)); sLab.material.opacity = seg(t, 13.4, 13.8) * (1 - seg(t, 14.8, 15.2)); iLab.position.set(2.3, .85, -1.8); iLab.material.opacity = seg(t, 15.6, 16.1) * (1 - seg(t, 20, 20.6));
    // records + conflict
    recs.forEach((r, i) => { const a = ez(seg(t, 15.9 + i * 1.6, 16.5 + i * 1.6)) * (1 - ez(seg(t, 20, 20.6))); r.g.scale.setScalar(a); r.lb.material.opacity = a; const jo = win(18.3, 18.9, .1) * .025; r.g.position.copy(REC[i]).add(V(Math.sin(t * 60 + i) * jo, Math.cos(t * 47) * jo, 0)); r.lb.position.copy(r.g.position).add(V(0, 0, .03)); const cf = seg(t, 18.9, 19.5); r.g.userData.ed.material.color.copy(WHT).lerp(ORG, cf) });
    const cpg = ez(seg(t, 18.9, 19.6)), pts: any[] = []; for (let i = 0; i <= 24; i++) { const u = i / 24 * cpg, x = lp(-.75, .75, u); pts.push(V(x, .85 + Math.sin(u * Math.PI) * .45, .1)) }
    setLine(confl, pts, cpg > 0 ? 1 - seg(t, 20, 20.6) : 0); confl.geometry.setDrawRange(0, Math.max(2, Math.floor(25 * (cpg || .08))));
    cLab.position.set(0, 1.55, .1); cLab.material.opacity = seg(t, 19.3, 19.7) * (1 - seg(t, 20, 20.6));
    // timeline
    const ta = ez(seg(t, 20.6, 22)) * out, ax = ez(seg(t, 20.8, 22));
    setLine(axis, [V(-2.4, 0, .6), V(lp(-2.4, 2.4, ax), 0, .6)], ta * .7);
    TLX.forEach((x, j) => { const on = ac && Math.abs(mx - x) < .45; setLine(stems[j], [V(x, 0, .6), V(x, .38, .6)], ta * .6); tlG[j].a.material.opacity = ta * (on ? 0 : 1); tlG[j].b.material.opacity = ta * (on ? 1 : 0) });
    // characters
    const q = kf(CK, t), q2 = kf(CK, t + .04), sp = Math.hypot(q2[0] - q[0], q2[1] - q[1]) / .04, mv = sp > .25, ph = D[Math.min(900, Math.floor(Math.max(0, t) * 30))] * 5.2;
    const RW: [number, number, () => any][] = [[3, 4, () => caseG.position], [4.7, 5.7, () => evPos[0]], [5.9, 6.9, () => evPos[6]], [7, 8, () => evPos[1]], [8.4, 10.6, () => evPos[4]], [10.4, 10.9, () => CONT], [13.6, 15.3, () => OP], [16, 17.2, () => REC[0]], [17.6, 18.6, () => REC[1]], [21.3, 25.4, () => V(TLX.reduce((m, x) => Math.abs(x - q[0]) < Math.abs(m - q[0]) ? x : m, -2), .6, .6)]];
    let tgt = null, amt = 0; for (const [a, b, f] of RW) { const k = ez(seg(t, a, a + .35)) * (1 - ez(seg(t, b - .3, b))); if (k > 0) { amt = k; tgt = f() } }
    const LW: [number, number, () => any][] = [[3.4, 4.2, () => caseG.position], [5.2, 5.9, () => evPos[0]], [6, 6.9, () => evPos[6]], [7.1, 8, () => evPos[1]], [9, 10.3, () => evPos[4]], [16.1, 17.2, () => REC[0]], [17.7, 18.5, () => REC[1]], [21.3, 25.4, () => RW[9][2]()]];
    let look = null, loup = 0; for (const [a, b, f] of LW) { const k = win(a, b); if (k > 0) { loup = k; look = f() } }
    const st = win(12.4, 13.3, .2) + win(18.3, 19.1, .15) * .8, chin = win(19.2, 20.3), lean = .14 * win(2.3, 3) + .12 * loup - .22 * st + .06 * win(10.8, 11.6);
    let want = psi; if (mv) want = Math.atan2(q2[0] - q[0], q2[1] - q[1]);
    else if (t > 12.4 && t < 13.4) want = Math.atan2(1.4 - q[0], -.35 - q[1]);
    else if (t > 18.3 && t < 19.4) { const R = REC[Math.sin(t * 9) > 0 ? 0 : 1]; want = Math.atan2(R.x - q[0], R.z - q[1]) }
    else if (t > 4.3 && t < 5.1) want = -.2 + Math.sin((t - 4.3) * 4) * .9;
    else if (look) want = Math.atan2(look.x - q[0], look.z - q[1]); else if (tgt) want = Math.atan2(tgt.x - q[0], tgt.z - q[1]); else if (t > 25.5) want = .35;
    let dd = want - psi; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); psi += dd * .12;
    hero.pose(q[0], q[1], psi, ph, mv, { tgt, amt, look, loupe: loup, lean, chin, start: st, tilt: chin * .25 });
    heroPool.position.x = q[0]; heroPool.position.z = q[1]; heroPool.material.opacity = .3 * (1 - seg(t, 29.2, 29.9)) * seg(t, 1.5, 2.2); casePool.position.set(0, .004, 1.6); casePool.material.opacity = .4 * cs;
    if (fv) { const f = kf(FK, t), f2 = kf(FK, t + .04), fm = Math.hypot(f2[0] - f[0], f2[1] - f[1]) / .04 > .25; const w2 = fm ? Math.atan2(f2[0] - f[0], f2[1] - f[1]) : Math.atan2(gm.x - f[0], gm.z - f[1]); let d2 = w2 - psi2; d2 = Math.atan2(Math.sin(d2), Math.cos(d2)); psi2 += d2 * .12;
      foe.pose(f[0], f[1], psi2, t * 5.5, fm, { tgt: gm, amt: win(12.8, 13.9, .25), lean: .5 * win(12.8, 13.9, .25) - .5 * win(14.1, 15.2, .2) }) }
    // logo forms from the evidence, then a restrained 3D reveal
    const lop = ez(seg(t, 25.9, 26.8)) * (1 - seg(t, 29.3, 29.9)); logoM.opacity = lop; logoM.transparent = lop < .999; logoG.visible = t > 25.8 && t < 29.95;
    pieces.forEach(p => { const k = ez(seg(t, 25.8 + (p.i % 9) * .06, 27.1 + (p.i % 9) * .06)), s = lp(.04, 1, k), st = V(TLX[p.j], -1, .6); p.m.visible = k > 0; p.m.scale.setScalar(s); p.m.position.copy(lp3(st, p.c, k)).addScaledVector(p.c, -s) });
    logoG.rotation.y = -(1 - ez(seg(t, 26, 27.8))) * .9 + ez(seg(t, 27.6, 28.2)) * Math.sin((t - 27.6) * .85) * .3; logoG.rotation.x = -.03 + Math.sin((t - 27) * .6) * .035;
    uni.uS.value = lp(-1.6, 1.6, ez(seg(t, 28.1, 29.4))); uni.uI.value = Math.sin(Math.PI * seg(t, 28.1, 29.4));
    logoL.intensity = ez(seg(t, 26, 27.4)) * (1 - seg(t, 29.3, 29.9)) * LI;
    tag.position.set(0, .12, .1); tag.material.opacity = ez(seg(t, 27.8, 28.8)) * (1 - seg(t, 29, 29.6));
    // camera
    const K = kf(CAM, t), tn = seg(t, 12, 13) * (1 - seg(t, 16, 17)); cam.position.set(K[0] + Math.sin(t * .3) * .08 + Math.sin(t * 31) * .004 * tn, K[1] + Math.cos(t * .25) * .04, K[2]); cam.lookAt(K[3], K[4], K[5]);
    key.target.position.set(0, 0, 0);
  }
  let T = o.startAt || 0, last = performance.now(), paused = false, vis = true, raf = 0, api: any = null;
  const reduce = o.reducedMotion || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function draw() { update(T); renderer.render(scene, cam); if (o.onTime) o.onTime(T) }
  function frame(n: number) { raf = requestAnimationFrame(frame); const dt = Math.min(.1, (n - last) / 1000); last = n; if (paused || !vis) return; T = (T + dt) % 30; draw() }
  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting }); io.observe(host);
  if (reduce) { T = 27.8; draw() } else raf = requestAnimationFrame(frame);
  api = {
    seek(t: number) { T = t; draw() },
    setPaused(p: boolean) { paused = p },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      try {
        renderer.dispose();
        renderer.forceContextLoss();
      } catch {}
      try {
        if (el && el.parentNode === host) host.removeChild(el);
        if (ov && ov.parentNode === host) host.removeChild(ov);
      } catch {}
    }
  };
  return api;
}

/**
 * 2D Canvas Fallback in case WebGL context is blocked or unavailable
 */
function createCaseTrace2DFallback(host: HTMLElement, opts: any) {
  const o = opts || {};
  host.style.position = 'relative';
  host.style.overflow = 'hidden';
  host.style.background = '#080808';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;

  const ov = document.createElement('div');
  ov.style.cssText =
    'position:absolute;inset:0;pointer-events:none;opacity:.55;background:radial-gradient(ellipse at 50% 50%,transparent 45%,rgba(0,0,0,.75))';
  host.appendChild(ov);

  let w = 400;
  let h = 500;
  function resize() {
    w = host.clientWidth || 400;
    h = host.clientHeight || 500;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const NODES = [
    { label: 'LOGIN', x: 0.22, y: 0.28 },
    { label: 'FILE ACCESS', x: 0.48, y: 0.24 },
    { label: 'MESSAGE', x: 0.74, y: 0.32 },
    { label: 'NETWORK TRACE', x: 0.3, y: 0.52 },
    { label: 'DEVICE LOG', x: 0.52, y: 0.48 },
    { label: 'ARTIFACT #6', x: 0.76, y: 0.58 },
    { label: 'TRANSFER', x: 0.48, y: 0.72 },
  ];

  const EDGES = [
    [0, 1],
    [1, 2],
    [0, 3],
    [3, 4],
    [1, 4],
    [4, 5],
    [4, 6],
  ];

  let T = o.startAt || 0;
  let last = performance.now();
  let paused = false;
  let vis = true;
  let raf = 0;

  function render(time: number) {
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const isLogoPhase = time >= 26;

    if (!isLogoPhase) {
      EDGES.forEach(([i, j], idx) => {
        const n1 = NODES[i], n2 = NODES[j];
        const appear = Math.min(1, Math.max(0, (time - (3 + idx * 0.8)) / 1.2));
        if (appear <= 0) return;

        const x1 = n1.x * w, y1 = n1.y * h, x2 = n2.x * w, y2 = n2.y * h;
        ctx.strokeStyle = `rgba(255, 90, 31, ${0.45 * appear})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + (x2 - x1) * appear, y1 + (y2 - y1) * appear);
        ctx.stroke();

        if (appear >= 1) {
          const pt = ((time * 0.6 + idx * 0.3) % 1);
          ctx.fillStyle = '#ff5a1f';
          ctx.beginPath();
          ctx.arc(x1 + (x2 - x1) * pt, y1 + (y2 - y1) * pt, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      NODES.forEach((n, i) => {
        const appear = Math.min(1, Math.max(0, (time - (2 + i * 0.6)) / 1.0));
        if (appear <= 0) return;

        const nx = n.x * w, ny = n.y * h, isVerified = time > 8 + i * 0.8;
        ctx.strokeStyle = isVerified ? '#ff5a1f' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(nx, ny, 10 * appear, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isVerified ? '#ff5a1f' : '#f5f5f0';
        ctx.beginPath();
        ctx.arc(nx, ny, 4 * appear, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '600 10px monospace';
        ctx.fillStyle = isVerified ? '#f5f5f0' : 'rgba(255,255,255,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, nx, ny + 22);
      });

      ctx.font = '600 11px monospace';
      ctx.fillStyle = '#ff5a1f';
      ctx.textAlign = 'left';
      if (time > 3 && time <= 8) {
        ctx.fillText('● PARSING MULTI-DEVICE ARTIFACTS...', 24, 36);
      } else if (time > 8 && time <= 14) {
        ctx.fillText('● VERIFYING TIMELINE HASH INTEGRITY', 24, 36);
        ctx.fillStyle = '#8a8a8a';
        ctx.fillText('09:18 — CLOUD ACCESS VERIFIED', 24, 54);
        ctx.fillText('09:17 — ENDPOINT DISCONNECT CONFIRMED', 24, 70);
      } else if (time > 14 && time <= 20) {
        ctx.fillText('● CONFLICT RESOLVED: TIME DRIFT NORMALIZED', 24, 36);
      } else if (time >= 20 && time < 26) {
        ctx.fillText('● UNIFIED CHRONOLOGICAL SEQUENCE ESTABLISHED', 24, 36);
      }
    } else {
      const logoProgress = Math.min(1, (time - 26) / 1.5);
      const cx = w / 2, cy = h / 2 - 20;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(logoProgress, logoProgress);

      ctx.fillStyle = '#f5f5f0';
      ctx.beginPath();
      ctx.moveTo(-45, -60);
      ctx.lineTo(45, -60);
      ctx.lineTo(60, -45);
      ctx.lineTo(60, -20);
      ctx.lineTo(15, -20);
      ctx.lineTo(15, -35);
      ctx.lineTo(-20, -35);
      ctx.lineTo(-35, -20);
      ctx.lineTo(-35, 20);
      ctx.lineTo(-20, 35);
      ctx.lineTo(15, 35);
      ctx.lineTo(15, 20);
      ctx.lineTo(60, 20);
      ctx.lineTo(60, 45);
      ctx.lineTo(45, 60);
      ctx.lineTo(-45, 60);
      ctx.lineTo(-60, 45);
      ctx.lineTo(-60, -45);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff5a1f';
      ctx.beginPath();
      ctx.ellipse(35, 0, 4, 8, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(48, 5, 4, 8, Math.PI / 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      if (time > 27) {
        const textFade = Math.min(1, (time - 27) / 1.0);
        ctx.fillStyle = `rgba(245, 245, 240, ${textFade})`;
        ctx.font = '700 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CASETRACE', cx, cy + 90);

        ctx.fillStyle = `rgba(138, 138, 138, ${textFade})`;
        ctx.font = '500 10.5px monospace';
        ctx.fillText('FROM DIGITAL TRACES TO INVESTIGATIVE CLARITY', cx, cy + 114);
      }
    }
  }

  function loop(n: number) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (n - last) / 1000);
    last = n;
    if (paused || !vis) return;
    T = (T + dt) % 30;
    render(T);
  }
  raf = requestAnimationFrame(loop);

  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting });
  io.observe(host);

  return {
    seek(t: number) { T = t; render(t) },
    setPaused(p: boolean) { paused = p },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      try {
        if (canvas.parentNode === host) host.removeChild(canvas);
        if (ov.parentNode === host) host.removeChild(ov);
      } catch {}
    }
  };
}
