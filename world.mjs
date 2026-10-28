import plan from './map-paths.mjs';
export function assignment(answers){
 const scores=answers.map(a=>a[1]??0),avg=scores.reduce((a,b)=>a+b,0)/6;
 const spread=Math.max(...scores)-Math.min(...scores);
 const domain=scores.indexOf(Math.max(...scores));
 const zone=spread<18&&avg>=40?8:avg<25&&Math.max(...scores)<50?7:domain;
 const names=[['Observer','관찰형'],['Gatekeeper','연락 조절형'],['Mediator','대화 조율형'],['Wayfinder','거리 조절형'],['Private resident','사생활 보호형'],['Coordinator','참여 조율형'],['Companion','교류형'],['Independent','자율형'],['Steward','균형 조율형']];
 const districts=['A1','A2','B1','B2','C1','C2','D1','D2','C0'];
 const component=['VISOR','CCA','HELMET','PLSS','VISOR','DCM','CCA','HELMET','PLSS'][zone];
 const seed=answers.flat().reduce((s,v,i)=>s+(v??0)*(i+1),0);
 return {zone,type:names[zone],district:districts[zone],helmet:`${component}-${String(Math.round(avg)).padStart(2,'0')}`,address:`${districts[zone]} / ${String(seed%12+1).padStart(2,'0')} / ${String(seed%40+1).padStart(3,'0')}`,domain,avg};
}
export function districtMap(zone){return `<svg viewBox="0 0 ${plan.width} ${plan.height}" role="img" aria-label="Eunomia district map"><rect width="100%" height="100%" fill="white"/>${plan.regions.map(r=>`<path d="${r.path}" fill="${r.zone===zone?'#111':r.kind===2?'#e8e8e8':'#bcbcbc'}"/>`).join('')}</svg>`;}
export function schematicMap(zone){
 // The supplied plan remains the base. Vector masks select only residential lobes.
 const corner='M 48 228 C 8 220 25 75 112 29 C 176 -10 255 6 260 43 C 261 54 236 60 226 91 C 210 131 208 160 216 176 C 184 167 114 184 77 205 C 63 213 55 223 48 228 Z';
 const cardinal='M 264 53 Q 270 43 277 53 C 282 85 313 130 319 166 Q 325 180 313 181 C 292 180 281 197 274 215 Q 268 220 263 211 C 253 191 238 179 225 181 Q 215 182 219 165 C 228 128 257 84 264 53 Z';
 let shapes='';for(let i=0;i<4;i++)shapes+=`<path d="${corner}" transform="rotate(${i*90} 270 250)" fill="${zone===i?'#111':'#c9c9c9'}"/>`;
 for(let i=0;i<4;i++)shapes+=`<path d="${cardinal}" transform="rotate(${i*90} 270 250)" fill="${zone===i+4?'#111':'#c9c9c9'}"/>`;
 shapes+=`<path d="M267 218 Q270 240 244 247 Q265 251 267 279 Q274 254 295 250 Q274 244 273 218Z" fill="${zone===8?'#111':'#c9c9c9'}"/>`;
 return `<svg viewBox="0 0 540 500" role="img" aria-label="Residential district ${zone+1}"><rect width="540" height="500" fill="white"/>${shapes}</svg>`;
}
