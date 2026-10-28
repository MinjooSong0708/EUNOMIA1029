import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
export function helmet(stage){
 const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));stage.append(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('white');const camera=new T.PerspectiveCamera(36,1,.01,100);camera.position.set(3,1,8);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2;controls.maxDistance=19;controls.target.set(0,-.15,0);
 const person=new T.Group(),modules=new T.Group();scene.add(person,modules);scene.add(new T.HemisphereLight(0xffffff,0x999999,3));const light=new T.DirectionalLight(0xffffff,2);light.position.set(3,5,4);scene.add(light);
 const paper=new T.MeshStandardMaterial({color:0xf5f4f0,roughness:1}),ink=new T.LineBasicMaterial({color:0x303030}),hardware=new T.MeshStandardMaterial({color:0x777777,roughness:.7});
 function line(points,parent=person,color=ink){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const m=new T.Line(g,color);parent.add(m);return m;}
 function solid(geo,pos,scale,mat=paper,parent=person){const m=new T.Mesh(geo,mat);m.position.set(...pos);m.scale.set(...scale);parent.add(m);const edges=new T.LineSegments(new T.EdgesGeometry(geo,28),ink);m.add(edges);return m;}
 const sphere=new T.SphereGeometry(1,24,18);
 solid(sphere,[0,0,0],[.55,.76,.52]); // Head: +Z is always the face.
 solid(new T.CylinderGeometry(.20,.25,.35,12),[0,-.86,0],[1,1,1]);
 solid(new T.CylinderGeometry(.72,.59,1.65,9),[0,-1.83,0],[1,1,.51]);
 for(const s of [-1,1]){
  solid(sphere,[s*.55,-.02,0],[.10,.19,.10]);
  const arm=solid(new T.CylinderGeometry(.17,.13,1.6,7),[s*.82,-1.92,0],[1,1,1]);arm.rotation.z=s*.12;
  solid(sphere,[s*.91,-2.78,.02],[.14,.23,.12]);
  const leg=solid(new T.CylinderGeometry(.25,.14,2.1,8),[s*.31,-3.65,0],[1,1,1]);leg.rotation.z=s*.035;
  solid(sphere,[s*.35,-4.76,.13],[.20,.12,.37]);
  line([[s*.10,.14,.493],[s*.23,.16,.47],[s*.34,.12,.43]]);
  line([[s*.12,.27,.47],[s*.25,.30,.45],[s*.35,.24,.40]]);
 }
 solid(new T.ConeGeometry(.10,.29,4),[0,-.03,.57],[1,1,1]).rotation.x=Math.PI/2;
 line([[-.17,-.30,.45],[0,-.33,.50],[.17,-.30,.45]]);
 // Sparse contours and cross-hatching keep the figure closer to a drawn study than a mannequin.
 for(let i=0;i<15;i++){const y=-1.17-i*.09;line([[-.56,y,.29],[-.25,y-.18,.35]],person,new T.LineBasicMaterial({color:0x777777}));}
 for(let i=0;i<8;i++)line([[-.42,-2.8-i*.21,.20],[-.18,-2.94-i*.21,.22]]);
 const ring=solid(new T.TorusGeometry(.43,.07,10,60),[0,-.84,0],[1,1,1],hardware);ring.rotation.x=Math.PI/2;
 solid(new T.BoxGeometry(.72,1,.30),[0,-1.7,-.53],[1,1,1],hardware);
 const hose=new T.CatmullRomCurve3([new T.Vector3(.30,-1.9,-.67),new T.Vector3(.75,-1.6,-.4),new T.Vector3(.5,-.9,0)]);person.add(new T.Mesh(new T.TubeGeometry(hose,40,.045,8,false),hardware));
 function update(state){
  for(const obj of [...modules.children]){obj.traverse(o=>{o.geometry?.dispose();if(o.material&&o.material!==ink&&o.material!==hardware)o.material.dispose();});modules.remove(obj);}
  for(const b of state.bubbles){
   const az=b.az*Math.PI/180,el=b.el*Math.PI/180;
   const anchor=b.anchor?new T.Vector3(...b.anchor):new T.Vector3(Math.sin(az)*Math.cos(el)*.55,Math.sin(el)*.76,Math.cos(az)*Math.cos(el)*.52);
   const outward=anchor.clone().normalize();const r=b.size;
   const center=anchor.clone().addScaledVector(outward,r*(.32-(b.overlap??.4)*.25));
   const mat=new T.MeshPhysicalMaterial({color:0xe8e8e5,metalness:0,roughness:.32,transparent:true,opacity:.08+.72*(state.opacity??.2),side:T.FrontSide,depthWrite:false});
   const bubble=new T.Mesh(new T.SphereGeometry(r,48,32),mat);bubble.position.copy(center);modules.add(bubble);
   // Fresnel contour: independent overlapping shells, no central sphere or clipping planes.
   const rim=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{},vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;void main(){float a=pow(1.-abs(dot(normalize(n),normalize(v))),3.);float h=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);gl_FragColor=vec4(vec3(.19),a*(.25+.35*h));}'});
   const skin=new T.Mesh(new T.SphereGeometry(r*1.001,48,32),rim);skin.position.copy(center);modules.add(skin);
   const pad=new T.Mesh(new T.SphereGeometry(.10,16,12),hardware);pad.position.copy(anchor);pad.scale.set(1,.65,.5);pad.lookAt(anchor.clone().add(outward));modules.add(pad);
   const end=center.clone().addScaledVector(outward,r*.73);line([anchor.toArray(),end.toArray()],modules);
  }
 }
 function view(v){const direction=camera.position.clone().sub(controls.target).normalize();const full=v==='body';controls.target.set(0,full?-2:0,0);camera.position.copy(controls.target).addScaledVector(direction,full?15:6);controls.update();}
 new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}).observe(stage);
 renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
 return {update,view,zoom(v){const d=camera.position.clone().sub(controls.target).normalize();controls.target.set(0,-2*(1-v),0);camera.position.copy(controls.target).addScaledVector(d,15-11*v);controls.update();},front(){camera.position.set(0,0,6);controls.target.set(0,0,0);controls.update();},side(){camera.position.set(6,0,0);controls.target.set(0,0,0);controls.update();},spin(){controls.autoRotate=!controls.autoRotate;return controls.autoRotate;},png(){renderer.render(scene,camera);renderer.domElement.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='eunomia-helmet.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});}};
}
