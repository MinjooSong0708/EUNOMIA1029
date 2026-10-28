export const domains=[
{name:'정보',sub:'정보와 알림',az:-65,el:32,pairs:[['알림과 새로운 정보를 계속 확인하다 보면 집중력이 소모된다.','알림의 중요도를 가리고 확인할 순서를 정하는 일을 맡기고 싶다.'],['선택에 필요한 정보를 검색하고 비교하는 과정이 버겁다.','내가 정한 기준에 맞는 정보와 선택지를 먼저 추려주는 일을 맡기고 싶다.']]},
{name:'관계',sub:'대화와 관계',az:65,el:30,pairs:[['메시지에 언제, 어떻게 답할지 생각하는 일이 피곤하다.','답장할 시점을 조율하고 답변 초안을 제안하는 일을 맡기고 싶다.'],['서로 다른 요구 사이에서 약속이나 의견을 조율하는 일이 부담스럽다.','내가 정한 관계의 경계 안에서 일정과 요청을 중재하는 일을 맡기고 싶다.']]},
{name:'일정',sub:'시간과 일정',az:-100,el:-12,pairs:[['해야 할 일의 우선순위를 계속 다시 정하는 일이 지친다.','내가 정한 목표 안에서 할 일의 순서를 배치하는 일을 맡기고 싶다.'],['일정이 바뀔 때마다 하루 계획을 다시 맞추는 것이 부담스럽다.','예상치 못한 일정 변경에 맞춰 대안을 구성하는 일을 맡기고 싶다.']]},
{name:'이동',sub:'이동과 동선',az:100,el:-12,pairs:[['목적지까지 갈 방법과 경로를 비교하는 일이 번거롭다.','시간·비용·혼잡도에 대한 내 기준으로 이동 경로를 고르는 일을 맡기고 싶다.'],['이동 중 혼잡이나 지연에 대응해 계획을 바꾸는 일이 피곤하다.','이동 상황이 달라졌을 때 대체 경로를 조정하는 일을 맡기고 싶다.']]},
{name:'소비',sub:'소비와 생활 선택',az:-38,el:-58,pairs:[['일상용품의 가격과 종류를 비교하는 데 에너지가 많이 든다.','내 예산과 선호 안에서 일상용품 후보를 추리는 일을 맡기고 싶다.'],['무엇을 먹고 무엇을 준비할지 반복해서 결정하는 일이 지친다.','내가 허용한 범위에서 식사와 생활 준비 계획을 제안하는 일을 맡기고 싶다.']]},
{name:'휴식',sub:'휴식과 자극',az:38,el:-58,pairs:[['쉬는 동안에도 연락과 해야 할 일이 신경 쓰여 쉬기 어렵다.','내가 정한 시간에 불필요한 알림과 요청을 잠시 막아주는 일을 맡기고 싶다.'],['일을 멈추고 쉬어야 할 시점을 스스로 정하는 것이 어렵다.','내가 정한 생활 리듬에 맞춰 휴식 시점을 제안하는 일을 맡기고 싶다.']]}
];
export const questions=domains.flatMap((d,di)=>d.pairs.flatMap((p,pi)=>p.map((text,k)=>({text,domain:di,pair:pi,kind:k?'delegate':'fatigue'}))));
export function scores(answers){return domains.map((d,di)=>{const values=kind=>questions.flatMap((q,i)=>q.domain===di&&q.kind===kind&&Number.isInteger(answers[i])?[answers[i]]:[]);const f=values('fatigue'),w=values('delegate');const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;return {...d,fatigue:mean(f),delegation:mean(w),answered:f.length+w.length,complete:f.length+w.length===4};});}
export function bubbleState(answers){return {base:1.45,grain:.65,strength:.8,bg:'#ec4c50',bubbles:scores(answers).filter(d=>d.delegation!==null&&d.delegation>0).map(d=>({az:d.az,el:d.el,size:.18+.8*d.delegation/4,overlap:.36}))};}
