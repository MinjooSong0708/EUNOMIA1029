import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {outline,paper,ink} from './outline.js';
import {loadPerson} from './person.js';
import {createEquipment} from './equipment.js';
export function helmet(stage){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;stage.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Continuous 3D human and helmet fitting view');
 stage.style.background='radial-gradient(ellipse at 48% 115%,#4678c7 0%,transparent 43%),linear-gradient(180deg,#fafafa 0%,#d9d9d7 46%,#e4eb69 73%,#705945 87%,#031750 100%)';
 const scene=new T.Scene();const camera=new T.PerspectiveCamera(36,1,.01,100);camera.position.set(0,0,6);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2.4;controls.maxDistance=20;controls.minPolarAngle=.08;controls.maxPolarAngle=Math.PI-.08;controls.autoRotateSpeed=.5;
 scene.add(new T.HemisphereLight(0xffffff,0x62656b,2));
 for(const [p,intensity] of [[[-3,5,4],2.5],[[3,1,-3],1.7]]){const light=new T.DirectionalLight(0xffffff,intensity);light.position.set(...p);scene.add(light);}
 const modules=new T.Group(),equipment=new T.Group();scene.add(modules,equipment);const details=createEquipment(equipment);outline(equipment);details.materials.add(paper);details.materials.add(ink);
 const status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='position:absolute;top:12px;left:16px;font-size:12px';status.textContent='Loading 3D figure…';stage.append(status);
 let ready=false;loadPerson(scene).then(()=>{ready=true;status.remove();}).catch(()=>{status.textContent='3D figure could not load. Please reload. / 인물을 불러오지 못했습니다. 새로고침해 주세요.';});
 const vertex='varying vec3 wp;varying vec3 wn;void main(){vec4 p=modelMatrix*vec4(position,1.);wp=p.xyz;wn=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*p;}';
 const fragment=`varying vec3 wp;varying vec3 wn;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec3 n=normalize(wn);float facing=abs(dot(n,normalize(cameraPosition-wp)));float rim=pow(1.-facing,3.2);float broad=pow(1.-facing,1.15);float light=pow(max(dot(n,normalize(vec3(-.5,.8,1.))),0.),8.);float signal=clamp((.018+.56*rim+.09*broad+.10*light)*.85,0.,.9);float noise=hash(floor(gl_FragCoord.xy));float stipple=smoothstep(1.-signal*1.8-.035,1.-signal*1.8+.035,noise)*.58;float alpha=mix(signal,stipple,.65);alpha=max(alpha,pow(1.-facing,20.)*.72);gl_FragColor=vec4(vec3(.18),alpha);}`;
 const sphere=new T.SphereGeometry(1,32,24);
 const shellMaterial=new T.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,side:T.DoubleSide});
 const milkMaterial=new T.MeshBasicMaterial({color:0xfafafa,transparent:true,opacity:.18,depthWrite:false});
 let bubbleBounds=[];
 function fitBubbles(){
  if(!bubbleBounds.length)return;
  const radius=Math.max(...bubbleBounds.map(b=>b.center.distanceTo(controls.target)+b.radius));
  const half=Math.atan(Math.tan(camera.fov*Math.PI/360)*Math.min(1,camera.aspect));
  const needed=radius/Math.sin(half)*1.06;
  if(camera.position.distanceTo(controls.target)<needed){const direction=camera.position.clone().sub(controls.target).normalize();camera.position.copy(controls.target).addScaledVector(direction,needed);controls.update();}
 }
 function update(state){
  bubbleBounds=[];
  for(const m of [...modules.children]){m.traverse(o=>{if(o.geometry&&o.geometry!==sphere)o.geometry.dispose();if(o.material&&!details.materials.has(o.material)&&o.material!==shellMaterial&&o.material!==milkMaterial)o.material.dispose();});modules.remove(m);}
  milkMaterial.opacity=Math.max(0,Math.min(1,state.opacity??.2))*.92;
  for(const [i,b] of [{base:true,size:.60},...state.bubbles].entries()){
   if(!Number.isFinite(b.size))continue;
   const az=(b.az??0)*Math.PI/180,el=(b.el??0)*Math.PI/180,anchor=new T.Vector3(Math.sin(az)*Math.cos(el)*.38,Math.sin(el)*.52,Math.cos(az)*Math.cos(el)*.36);
   const r=b.size,center=b.base?new T.Vector3(0,-.02,0):Array.isArray(b.center)&&b.center.length===3&&b.center.every(Number.isFinite)?new T.Vector3(...b.center):anchor.clone().addScaledVector(anchor.clone().normalize(),r*(.45-(b.overlap??.4)*.25));
   bubbleBounds.push({center,radius:r});
   const tint=typeof b.color==='string'&&/^#[0-9a-f]{6}$/i.test(b.color)?b.color:null;
   const surface=tint?new T.ShaderMaterial({vertexShader:vertex,fragmentShader:'uniform vec3 tint;'+fragment.replace('vec4(vec3(.18),alpha)','vec4(tint,alpha)'),uniforms:{tint:{value:new T.Color(tint)}},transparent:true,depthWrite:false,side:T.DoubleSide}):shellMaterial;
   const filling=tint?new T.MeshBasicMaterial({color:tint,transparent:true,opacity:.12+milkMaterial.opacity*.32,depthWrite:false}):milkMaterial;
   const shell=new T.Mesh(sphere,surface);shell.scale.setScalar(r);shell.position.copy(center);shell.renderOrder=3;modules.add(shell);
   const milk=new T.Mesh(sphere,filling);milk.scale.setScalar(r*.998);milk.position.copy(center);milk.renderOrder=2;modules.add(milk);
   if(!b.base&&b.root!==false){const assembly=new T.Group();modules.add(assembly);details.module(anchor,center,assembly,i);outline(assembly);}
  }
  fitBubbles();
 }
 function zoom(v){v=Math.max(0,Math.min(1,v));const dir=camera.position.clone().sub(controls.target).normalize();controls.target.set(0,-1.2*(1-v),0);camera.position.copy(controls.target).addScaledVector(dir,15-11.8*v);controls.update();}
 function focus(degrees){const r=camera.position.distanceTo(controls.target),a=degrees*Math.PI/180;camera.position.set(Math.sin(a)*r,controls.target.y,Math.cos(a)*r);controls.update();}
 const observer=new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();fitBubbles();});observer.observe(stage);
 renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
 function capture(){if(!ready)return null;renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}
 return {update,zoom,capture,focus,front(){focus(0);},side(){focus(90);},spin(){controls.autoRotate=!controls.autoRotate;return controls.autoRotate;},png(){const data=capture();if(!data)return;const a=document.createElement('a');a.href=data;a.download='eunomia-helmet.png';a.click();}};
}
