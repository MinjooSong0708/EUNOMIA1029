const masthead=document.createElement('header');masthead.className='masthead';
masthead.innerHTML='<a href="index.html" aria-label="Eunomia home"><img src="assets/logo-revised.png" alt="Eunomia"></a><p id="site-purpose"></p><span class="edition">RESIDENCE OFFICE<br>REGISTRATION / 01</span>';
document.body.prepend(masthead);
const footer=document.createElement('footer');footer.className='site-footer';footer.innerHTML='<img src="assets/footer-revised.png" alt="Eunomia produce ataraxia — ATARAXIA SHELL"><small id="footer-purpose"></small>';document.body.append(footer);
function language(){const ko=document.documentElement.lang==='ko';document.querySelector('#site-purpose').textContent=ko?'직접 결정할 일과 맡길 일을 살펴봅니다. 당신의 답변을 바탕으로 거주 구역과 개인용 셸을 배정합니다.':'Decide what to keep in your hands, and what to entrust to Eunomia. Your answers shape your residence and personal shell.';document.querySelector('#footer-purpose').textContent=ko?'입주 등록 · 개인 장비 배정':'RESIDENT REGISTRATION · PERSONAL EQUIPMENT';}
new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});language();
function fitViewerStrip(){
 const main=document.querySelector('main'),bottom=document.querySelector('.visual-bottom'),frame=document.querySelector('.visual iframe');
 if(!frame||!bottom||main?.classList.contains('manual')||document.body.classList.contains('report-mode'))return;
 frame.style.height=Math.max(160,bottom.offsetTop-12)+'px';
}
const fittingBottom=document.querySelector('.visual-bottom');
if(fittingBottom){new ResizeObserver(fitViewerStrip).observe(fittingBottom);window.addEventListener('resize',fitViewerStrip);requestAnimationFrame(fitViewerStrip);}

