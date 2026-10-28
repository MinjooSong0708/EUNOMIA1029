import * as T from './vendor/three.module.js';
// Concept hardware: mechanically detailed, not a certified medical device.
export function createEquipment(parent){
 const metal=new T.MeshStandardMaterial({color:0x8b8e90,metalness:.75,roughness:.32});
 const polymer=new T.MeshStandardMaterial({color:0x272a2b,roughness:.67});
 const rubber=new T.MeshStandardMaterial({color:0x111315,roughness:.94});
 const fabric=new T.MeshStandardMaterial({color:0x373a3b,roughness:1});
 function mesh(g,m,p,root=parent){const o=new T.Mesh(g,m);o.position.set(...p);root.add(o);return o;}
 function tube(points,r=.01,mat=rubber,root=parent){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,40,r,8,false),mat,[0,0,0],root);}
 function ellipsoid(p,s,m=polymer,root=parent){const o=mesh(new T.SphereGeometry(1,24,16),m,p,root);o.scale.set(...s);return o;}
 function ring(p,r,t,m=metal,root=parent){const o=mesh(new T.TorusGeometry(r,t,12,64),m,p,root);o.rotation.x=Math.PI/2;return o;}
 // Segmented spring cap. Each node includes a spring-loaded skin contact and a locking collar.
 for(let row=0;row<5;row++){
  const a=-1.05+row*.525,pts=[];
  for(let j=0;j<=24;j++){const t=.34+j/24*(Math.PI-.68);pts.push([Math.sin(a)*.37,.51*Math.cos(a)*Math.sin(t)+.015,.355*Math.cos(a)*Math.cos(t)]);}
  tube(pts,.014,polymer);
  for(let j=2;j<24;j+=4){const p=new T.Vector3(...pts[j]);contact(p,parent,.72);}
 }
 const band=[];for(let j=0;j<=64;j++){const a=j/64*Math.PI*2;band.push([Math.sin(a)*.36,.15,Math.cos(a)*.345]);}tube(band,.018,polymer);
 // Occipital adjustment dial and captive fasteners.
 const dial=mesh(new T.CylinderGeometry(.085,.085,.045,32),polymer,[0,.015,-.39]);dial.rotation.x=Math.PI/2;
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;ellipsoid([Math.sin(a)*.08,.015+Math.cos(a)*.08,-.418],[.008,.008,.01],metal);}
 for(const y of [-.48,-.52,-.56])ring([0,y,0],.285,y===-.52?.028:.012,y===-.52?rubber:metal);
 for(const s of [-1,1]){
  // Side latches and restrained harness to the rear collar; no strap across the eyes.
  const latch=mesh(new T.BoxGeometry(.065,.11,.085),polymer,[s*.28,-.51,.02]);latch.rotation.z=s*.08;
  tube([[s*.35,-.02,-.12],[s*.33,-.27,-.20],[s*.26,-.51,-.12]],.018,fabric);
  ellipsoid([s*.285,-.5,.065],[.018,.025,.012],metal);
  // Paired soft supply lobes with stitched perimeter and rigid service cartridge.
  const pack=ellipsoid([s*.25,-1.12,-.43],[.27,.51,.15],fabric);pack.rotation.z=-s*.18;
  const seam=[];for(let j=0;j<=48;j++){const a=j/48*Math.PI*2;seam.push([s*.25+Math.cos(a)*.235,-1.12+Math.sin(a)*.46,-.555]);}tube(seam,.006,polymer);
  const cartridge=mesh(new T.CylinderGeometry(.075,.075,.40,24),metal,[s*.29,-1.15,-.57]);cartridge.rotation.z=-s*.1;
  for(const y of [-.95,-1.35])ring([s*.29,y,-.57],.079,.011,polymer);
  tube([[s*.32,-1.6,-.42],[s*.50,-1.05,-.25],[s*.45,-.67,.03],[s*.29,-.59,.13]],.035,fabric);
  mesh(new T.BoxGeometry(.09,.13,.05),metal,[s*.46,-.80,-.03]);
  // Ribbed breathing/service hose ending in a threaded bulkhead fitting.
  const hose=new T.CatmullRomCurve3([[s*.22,-.54,-.16],[s*.42,-.63,-.29],[s*.44,-.78,-.50],[s*.25,-.88,-.58]].map(p=>new T.Vector3(...p)));
  const h=mesh(new T.TubeGeometry(hose,40,.027,10,false),rubber,[0,0,0]);
  for(let j=0;j<24;j++){const t=j/23,p=hose.getPoint(t);const rib=mesh(new T.TorusGeometry(.029,.005,5,12),polymer,p.toArray());rib.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),hose.getTangent(t));}
 }
 const control=mesh(new T.BoxGeometry(.20,.25,.09),polymer,[0,-.92,-.59]);
 for(let j=0;j<5;j++)mesh(new T.BoxGeometry(.13,.008,.006),rubber,[0,-.85-j*.025,-.64]);
 for(const x of [-.075,.075])for(const y of [-.82,-1.02])ellipsoid([x,y,-.644],[.009,.009,.004],metal);
 function contact(p,root,scale=1){
  const g=new T.Group();g.position.copy(p);g.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),p.clone().normalize());g.scale.setScalar(scale);root.add(g);
  mesh(new T.CylinderGeometry(.042,.05,.025,20),rubber,[0,-.012,0],g);
  mesh(new T.CylinderGeometry(.035,.035,.038,20),metal,[0,.016,0],g);
  ring([0,.037,0],.036,.006,polymer,g);
  mesh(new T.CylinderGeometry(.024,.024,.025,6),polymer,[0,.05,0],g);
  return g;
 }
 function module(anchor,center,root,index){
  contact(anchor,root);
  const n=anchor.clone().normalize();const start=anchor.clone().addScaledVector(n,.075);
  tube([start.toArray(),start.clone().lerp(center,.5).add(new T.Vector3(0,.055,0)).toArray(),center.toArray()],.009,rubber,root);
  // Internal signal hub and three insulated termination rings.
  ellipsoid(center.toArray(),[.034,.034,.034],polymer,root);
  for(let j=0;j<3;j++){const r=ring(center.toArray(),.036+j*.006,.003,metal,root);r.rotation.z=j*.65;}
  const s=anchor.x<0?-1:1,offset=(index%6)*.012;
  tube([start.toArray(),[s*(.41+offset),.02,-.26],[s*(.34+offset),-.42,-.40],[s*.18,-.85,-.62]],.008,rubber,root);
  ellipsoid([s*.18,-.85,-.62],[.022,.032,.022],metal,root);
 }
 return {module,materials:new Set([metal,polymer,rubber,fabric])};
}
