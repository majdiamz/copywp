const challengePatterns=[
 /one moment[, …\.]*please/i,/just a moment/i,/checking your browser/i,/verify you are human/i,
 /attention required/i,/cloudflare/i,/captcha/i,/security check/i,/browser verification/i,
 /enable javascript and cookies/i,/ddos protection/i,/access denied/i
];
export async function waitForUsablePage(page,{timeout=15000}={}){
 const started=Date.now();let last=null;
 while(Date.now()-started<timeout){
  last=await page.evaluate(()=>({title:document.title||'',text:(document.body?.innerText||'').replace(/\s+/g,' ').trim().slice(0,5000),elements:document.body?.querySelectorAll('*').length||0,links:document.querySelectorAll('a[href]').length,images:document.images.length}));
  const hay=`${last.title} ${last.text}`;
  const challenge=challengePatterns.some(r=>r.test(hay));
  if(!challenge&&last.text.length>=120&&last.elements>=12)return last;
  await page.waitForTimeout(1000);
 }
 return last;
}
export function validatePageSnapshot(snapshot,analysis){
 const hay=`${snapshot?.title||''} ${snapshot?.text||''}`;
 const challenge=challengePatterns.find(r=>r.test(hay));
 if(challenge)return{ok:false,code:'anti_bot',message:'Protection anti-bot détectée : la page réelle n’a pas pu être analysée.'};
 if(!snapshot||snapshot.text.length<120||snapshot.elements<12)return{ok:false,code:'empty_page',message:'Page trop vide ou incomplète pour générer un template fiable.'};
 const sections=analysis?.sections?.length||0;
 if(sections<2)return{ok:false,code:'insufficient_structure',message:'Structure insuffisante : moins de deux sections exploitables détectées.'};
 return{ok:true,code:'usable',metrics:{textLength:snapshot.text.length,elements:snapshot.elements,links:snapshot.links,images:snapshot.images,sections}};
}
