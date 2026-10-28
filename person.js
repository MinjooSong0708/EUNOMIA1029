import * as T from './vendor/three.module.js';
import {outline} from './outline.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
export async function loadPerson(scene){
 const {scene:person}=await new GLTFLoader().loadAsync('./assets/person.glb');
 const bounds=new T.Box3().setFromObject(person),height=bounds.max.y-bounds.min.y;
 const scale=6/height;person.scale.setScalar(scale);
 person.position.set(.045,.49-bounds.max.y*scale,-.125);
 person.traverse(o=>{if(!o.isMesh)return;if(/bob01|eyebrow|eyelash|low-poly|teeth/i.test(o.name))o.visible=false;o.castShadow=true;o.receiveShadow=true;
  const mats=Array.isArray(o.material)?o.material:[o.material];
  for(const m of mats){
   if(/casualsuit|cotton|shoes/i.test(m.name)){m.color.set(0x17191b);m.roughness=.93;}
   if(/bob01/i.test(m.name)){m.color.set(0x29211e);m.roughness=.85;}
  }
 });
 person.name='Continuous 3D fitting figure';scene.add(person);
 // Pulled-back hair leaves the face and contact harness readable from every angle.
 const hair=new T.MeshStandardMaterial({color:0x151313,roughness:.86});
 const positions=[],indices=[],N=64,M=24;
 function scalp(a,t){const end=1.27+.72*(1-Math.cos(a))/2,theta=t*end;return [Math.sin(theta)*Math.sin(a)*.325,.12+Math.cos(theta)*.335,-.045+Math.sin(theta)*Math.cos(a)*.33];}
 for(let j=0;j<=M;j++)for(let i=0;i<=N;i++)positions.push(...scalp(i/N*Math.PI*2,j/M));
 for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();const cap=new T.Mesh(g,hair);person.parent.add(cap);outline(cap);
 const bun=new T.Mesh(new T.SphereGeometry(1,32,24),hair);bun.position.set(0,.11,-.40);bun.scale.set(.16,.14,.12);scene.add(bun);outline(bun);outline(person);
 return person;
}
