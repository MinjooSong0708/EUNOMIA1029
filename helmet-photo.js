import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
export function helmet(stage){
 const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));stage.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','360-degree photographic fitting view');
 const scene=new T.Scene();scene.background=new T.Color(0xffffff);const camera=new T.PerspectiveCamera(36,1,.01,100);camera.position.set(0,0,6);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2.4;controls.maxDistance=20;controls.minPolarAngle=Math.PI/2;controls.maxPolarAngle=Math.PI/2;controls.autoRotateSpeed=.5;
 scene.add(new T.HemisphereLight(0xffffff,0x999999,2));const light=new T.DirectionalLight(0xffffff,2);light.position.set(-2,4,5);scene.add(light);
 const modules=new T.Group(),equipment=new T.Group();scene.add(modules,equipment);
 const hardware=new T.MeshStandardMaterial({color:0x666666,roughness:.8}),wire=new T.MeshStandardMaterial({color:0x333333,roughness:1});
 const texture=new T.TextureLoader().load('./assets/person-turntable.png');texture.colorSpace=T.SRGBColorSpace;
 // Sample the original turntable sheet as an atlas; the source image is not altered.
 const uniforms={sheet:{value:texture},crop:{value:new T.Vector4(0,0,1,1)}};
 const personMat=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:true,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D sheet;uniform vec4 crop;varying vec2 vUv;void main(){vec3 c=texture2D(sheet,crop.xy+vUv*crop.zw).rgb;float hi=max(c.r,max(c.g,c.b));float lo=min(c.r,min(c.g,c.b));float lum=dot(c,vec3(.299,.587,.114));float skin=smoothstep(.045,.095,hi-lo);float dark=1.-smoothstep(.34,.59,lum);float a=max(skin,dark);a*=smoothstep(0.,.03,vUv.x)*smoothstep(0.,.03,1.-vUv.x);if(a<.08)discard;gl_FragColor=vec4(c,a);}`});
 const person=new T.Mesh(new T.PlaneGeometry(2.02,6),personMat);person.position.set(0,-2.45,0);scene.add(person);
 const columns=[0,137,276,415,553,692,831,974,1086,1168];
 const frames=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];let lastFrame=-1;
 function photo(){let angle=Math.atan2(camera.position.x-controls.target.x,camera.position.z-controls.target.z);let n=((Math.round(angle/(Math.PI/9))%18)+18)%18;if(n!==lastFrame){lastFrame=n;const col=n%9,row=n>=9?1:0;const left=columns[col]+3,right=columns[col+1]-3,top=row?482:23,bottom=row?891:414;uniforms.crop.value.set(left/1168,1-bottom/1346,(right-left)/1168,(bottom-top)/1346);person.scale.x=(right-left)/(bottom-top)*6/2.02;}person.quaternion.copy(camera.quaternion);}
 function tube(points,r=.012,mat=wire,parent=equipment){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(curve,32,r,7,false),mat);parent.add(m);return m;}
 function pad(p,parent=equipment){const m=new T.Mesh(new T.BoxGeometry(.12,.06,.09),hardware);m.position.copy(p);m.lookAt(p.clone().multiplyScalar(2));parent.add(m);}
 // Flexible crown spine and circumferential harness, based on the supplied contact-cap reference.
 for(const a of [-.65,0,.65]){const pts=[];for(let k=0;k<=20;k++){const t=k/20*Math.PI;pts.push([Math.sin(a)*.34,.43*Math.cos(a)*Math.sin(t)+.04,.34*Math.cos(a)*Math.cos(t)]);}tube(pts,.014);}
 const band=[];for(let k=0;k<=48;k++){const a=k/48*Math.PI*2;band.push([Math.sin(a)*.38,.08,Math.cos(a)*.35]);}tube(band,.018);
 const ring=new T.Mesh(new T.TorusGeometry(.26,.035,8,64),hardware);ring.rotation.x=Math.PI/2;ring.position.y=-.50;equipment.add(ring);
 // Soft two-lobed upper-back supply pack, smaller than a spacesuit PLSS.
 for(const s of [-1,1]){const pack=new T.Mesh(new T.SphereGeometry(1,24,20),hardware);pack.scale.set(.27,.50,.13);pack.position.set(s*.22,-1.18,-.24);pack.rotation.z=s*-.2;equipment.add(pack);tube([[s*.29,-1.6,-.22],[s*.45,-.95,-.15],[s*.34,-.59,-.04]],.025);}
 tube([[0,-.42,-.22],[0,-.74,-.31],[0,-1.12,-.39]],.035);
 const vertex='varying vec3 wp;varying vec3 wn;void main(){vec4 p=modelMatrix*vec4(position,1.);wp=p.xyz;wn=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*p;}';
 const fragment=`varying vec3 wp;varying vec3 wn;uniform float opacity;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec3 n=normalize(wn);float facing=abs(dot(n,normalize(cameraPosition-wp)));float rim=pow(1.-facing,3.2);float broad=pow(1.-facing,1.15);float light=pow(max(dot(n,normalize(vec3(-.5,.8,1.))),0.),8.);float signal=clamp((.018+.56*rim+.09*broad+.10*light)*.85,0.,.9);float noise=hash(floor(gl_FragCoord.xy));float stipple=smoothstep(1.-signal*1.8-.035,1.-signal*1.8+.035,noise)*.58;float alpha=mix(signal,stipple,.65);alpha=max(alpha,pow(1.-facing,20.)*.72);gl_FragColor=vec4(vec3(.18),alpha);}`;
 function update(state){for(const m of [...modules.children]){m.traverse(o=>{o.geometry?.dispose();if(o.material!==hardware&&o.material!==wire)o.material?.dispose();});modules.remove(m);}
 for(const b of state.bubbles){if(!Number.isFinite(b.size))continue;const az=b.az*Math.PI/180,el=b.el*Math.PI/180;const anchor=new T.Vector3(Math.sin(az)*Math.cos(el)*.38,Math.sin(el)*.52,Math.cos(az)*Math.cos(el)*.36);const outward=anchor.clone().normalize();const r=b.size;const center=anchor.clone().addScaledVector(outward,r*(.45-(b.overlap??.4)*.25));
 const shell=new T.Mesh(new T.SphereGeometry(r,48,32),new T.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{opacity:{value:state.opacity??.2}},transparent:true,depthWrite:false,side:T.DoubleSide}));shell.position.copy(center);shell.renderOrder=3;modules.add(shell);
 const milk=new T.Mesh(new T.SphereGeometry(r*.998,40,24),new T.MeshBasicMaterial({color:0xefefeb,transparent:true,opacity:(state.opacity??.2)*.92,depthWrite:false}));milk.position.copy(center);milk.renderOrder=2;modules.add(milk);pad(anchor,modules);
 // Each contact has one wire to the module centre and a separate wire to the back supply unit.
 tube([anchor.toArray(),anchor.clone().lerp(center,.5).add(new T.Vector3(0,.08,0)).toArray(),center.toArray()],.009,wire,modules);
 const sign=anchor.x<0?-1:1;tube([anchor.toArray(),[sign*.42,.10,-.25],[sign*.35,-.45,-.38],[sign*.18,-1.0,-.40]],.009,wire,modules);
 }}
 function zoom(v){const dir=camera.position.clone().sub(controls.target).normalize();controls.target.set(0,-2.55*(1-v),0);camera.position.copy(controls.target).addScaledVector(dir,15-11.8*v);controls.update();}
 new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}).observe(stage);
 renderer.setAnimationLoop(()=>{controls.update();photo();renderer.render(scene,camera);});
 function capture(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}
 return {update,zoom,capture,focus(degrees){const r=camera.position.distanceTo(controls.target),a=degrees*Math.PI/180;camera.position.set(Math.sin(a)*r,controls.target.y,Math.cos(a)*r);controls.update();},front(){camera.position.set(0,controls.target.y,6);controls.update();},side(){camera.position.set(6,controls.target.y,0);controls.update();},spin(){controls.autoRotate=!controls.autoRotate;return controls.autoRotate;},png(){const a=document.createElement('a');a.href=capture();a.download='eunomia-helmet.png';a.click();}};
}
