(function(){
  var d=document, root=d.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}

  /* ---- menu HP ---- */
  var nav=$('.nav'), tg=$('.nav-toggle');
  function setMenu(o){
    if(!nav||!tg)return;
    nav.classList.toggle('open',o);
    tg.setAttribute('aria-expanded',o);
    tg.setAttribute('aria-label',o?'Tutup menu':'Buka menu');
  }
  if(tg){
    tg.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
    d.addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
    d.addEventListener('click',function(e){if(nav.classList.contains('open')&&!nav.contains(e.target))setMenu(false)});
    $$('.nav ul a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
    matchMedia('(min-width:761px)').addEventListener('change',function(){setMenu(false)});
  }

  /* ---- progres scroll, menu sembunyi saat scroll turun, tombol ke atas ---- */
  var bar=d.createElement('div');bar.className='progress';d.body.appendChild(bar);
  var up=d.createElement('button');up.className='totop';up.type='button';up.setAttribute('aria-label','Kembali ke atas');up.textContent='↑';
  d.body.appendChild(up);
  up.addEventListener('click',function(){scrollTo({top:0,behavior:reduce?'auto':'smooth'})});
  var lastY=0,tick=false;
  function onScroll(){
    var y=scrollY,h=root.scrollHeight-innerHeight;
    bar.style.transform='scaleX('+(h>0?Math.min(y/h,1):0)+')';
    up.classList.toggle('show',y>500);
    if(nav&&innerWidth<=760&&!nav.classList.contains('open')){
      if(y>lastY+6&&y>120)nav.classList.add('hide');
      else if(y<lastY-6||y<60)nav.classList.remove('hide');
    }else if(nav)nav.classList.remove('hide');
    lastY=y;tick=false;
  }
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});
  onScroll();

  /* ---- muncul bertahap saat di-scroll ---- */
  var targets=$$('.kat,.tl li,.links a,main details,.facts div,.about>div:last-child>*,.frame,.tbl-title,.tbl-wrap,.hint');
  targets=targets.filter(function(el){return !el.closest('details:not([open])>.body')||el.matches('details')});
  if(!reduce&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
    },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    var seen=new Map();
    targets.forEach(function(el){
      var p=el.parentElement,i=(seen.get(p)||0);seen.set(p,i+1);
      el.classList.add('rv');
      if(el.matches('.tl li'))el.classList.add('tl-item');
      el.style.setProperty('--d',Math.min(i,5)*.07+'s');
      io.observe(el);
    });
  }

  /* ---- judul halaman: bungkus supaya bisa meluncur ---- */
  var t=$('.title');
  if(t&&!$('.ln',t)){t.innerHTML='<span class="ln">'+t.innerHTML+'</span>'}

  /* ---- buka-tutup kartu dengan animasi halus ---- */
  d.addEventListener('click',function(e){
    var s=e.target.closest('summary');
    if(!s||reduce)return;
    var el=s.parentElement;
    if(!el||el.tagName!=='DETAILS')return;
    e.preventDefault();
    if(el._a){el._a.cancel();el._a=null}
    var from=el.offsetHeight,opening=!el.open,to;
    if(opening){el.open=true;to=el.offsetHeight}
    else{el.open=false;to=el.offsetHeight;el.open=true}
    el.style.overflow='hidden';
    var a=el._a=el.animate({height:[from+'px',to+'px']},{duration:opening?450:330,easing:'cubic-bezier(.22,.8,.24,1)'});
    var body=$(':scope>.body,:scope>.shots',el);
    if(body)body.animate({opacity:opening?[0,1]:[1,0],transform:opening?['translateY(-8px)','none']:['none','translateY(-8px)']},{duration:opening?450:250,easing:'ease-out'});
    a.onfinish=a.oncancel=function(){
      el._a=null;el.style.overflow='';
      if(!opening)el.open=false;
    };
  });

  /* ---- HOME ---- */
  var big=$('.big');
  if(big&&!$('.ch',big)){
    var txt=big.textContent.trim();big.setAttribute('aria-label',txt);
    big.innerHTML=txt.split('').map(function(c,i){return '<span class="ch" aria-hidden="true" style="--i:'+i+'">'+c+'</span>'}).join('');
  }
  var cover=$('.cover');
  if(cover){
    var photo=$('.cover-photo'),stars=$$('.star');
    if(fine&&!reduce){
      cover.addEventListener('pointermove',function(e){
        var r=cover.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        cover.style.setProperty('--mx',(x+.5)*100+'%');cover.style.setProperty('--my',(y+.5)*100+'%');
        if(photo){photo.style.setProperty('--px',(x*-22)+'px');photo.style.setProperty('--py',(y*-12)+'px')}
        stars.forEach(function(s,i){var k=(i%2?1:-1)*(18+i*6);s.style.setProperty('--px',x*k+'px');s.style.setProperty('--py',y*k+'px')});
      });
      cover.addEventListener('pointerleave',function(){
        if(photo){photo.style.setProperty('--px','0px');photo.style.setProperty('--py','0px')}
      });
    }else if(!reduce&&photo){
      addEventListener('scroll',function(){photo.style.setProperty('--py',Math.min(scrollY*.12,30)+'px')},{passive:true});
    }
    stars.forEach(function(s){s.addEventListener('click',function(){s.classList.remove('spin');void s.offsetWidth;s.classList.add('spin')})});

    /* kata berganti dengan efek mengetik */
    var role=$('#role');
    if(role){
      var words=['Analisis Sistem','Pengembangan Web','Pengujian Perangkat Lunak','Dokumentasi Teknis'],wi=0,ci=0,del=false;
      if(reduce){role.textContent=words[0]}
      else(function type(){
        var w=words[wi];
        role.textContent=w.slice(0,ci);
        if(!del&&ci<w.length){ci++;setTimeout(type,70)}
        else if(!del){del=true;setTimeout(type,1500)}
        else if(ci>0){ci--;setTimeout(type,35)}
        else{del=false;wi=(wi+1)%words.length;setTimeout(type,300)}
      })();
    }
  }

  /* ---- ripple di tombol ---- */
  d.addEventListener('pointerdown',function(e){
    var b=e.target.closest('.btn');if(!b||reduce)return;
    var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2,sp=d.createElement('span');
    sp.className='rp';sp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';
    b.appendChild(sp);setTimeout(function(){sp.remove()},650);
  });

  /* ---- foto miring mengikuti kursor (halaman Tentang) ---- */
  var fr=$('.frame');
  if(fr&&fine&&!reduce){
    fr.addEventListener('pointermove',function(e){
      var r=fr.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      fr.style.transform='perspective(700px) rotateY('+x*12+'deg) rotateX('+(-y*12)+'deg) scale(1.02)';
    });
    fr.addEventListener('pointerleave',function(){fr.style.transform=''});
  }
})();