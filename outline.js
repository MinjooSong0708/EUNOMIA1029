import * as T from './vendor/three.module.js';
export const paper=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false});
export const ink=new T.ShaderMaterial({side:T.BackSide,vertexShader:`void main(){vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*normal);p.xy+=n.xy*.0022*p.w;gl_Position=p;}`,fragmentShader:'void main(){gl_FragColor=vec4(.035,.035,.035,1.);}'});
export function outline(root){
 const meshes=[];root.traverse(o=>{if(o.isMesh&&o.visible&&!o.userData.outlined)meshes.push(o);});
 for(const o of meshes){o.userData.outlined=true;o.material=paper;const edge=new T.Mesh(o.geometry,ink);edge.userData.outlined=true;edge.name='Contour';o.add(edge);}
}
