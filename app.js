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

/* ---- foto pop-up (lightbox) ---- */
(function(){
  var d=document,btns=[].slice.call(d.querySelectorAll('.foto-btn[data-fotos]'));
  if(!btns.length)return;
  var lb=d.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Galeri foto');
  lb.innerHTML='<div class="lb-top"><div><div class="lb-title"></div><div class="lb-count"></div></div><button class="lb-x" type="button" aria-label="Tutup">✕</button></div>'+
    '<div class="lb-stage"><button class="lb-nav lb-prev" type="button" aria-label="Foto sebelumnya">←</button><img alt=""><button class="lb-nav lb-next" type="button" aria-label="Foto berikutnya">→</button></div><div class="lb-cap"></div>';
  d.body.appendChild(lb);
  var img=lb.querySelector('img'),ttl=lb.querySelector('.lb-title'),cnt=lb.querySelector('.lb-count'),cap=lb.querySelector('.lb-cap'),prev=lb.querySelector('.lb-prev'),next=lb.querySelector('.lb-next'),x=lb.querySelector('.lb-x');
  var list=[],i=0,opener=null;
  function show(n,dir){
    i=(n+list.length)%list.length;
    img.classList.remove('ready','slide-l','slide-r');
    img.onload=function(){img.classList.add('ready');if(dir)img.classList.add(dir>0?'slide-l':'slide-r')};
    img.src=list[i];img.alt=ttl.textContent+' foto '+(i+1);
    cnt.textContent=(i+1)+' / '+list.length;
    prev.hidden=next.hidden=list.length<2;
  }
  function open(b){
    list=b.fotos;opener=b;ttl.textContent=b.judul;cap.textContent=b.judul;
    show(0);lb.classList.add('open');d.body.classList.add('lb-lock');x.focus();
  }
  function close(){lb.classList.remove('open');d.body.classList.remove('lb-lock');if(opener)opener.focus()}
  x.addEventListener('click',close);
  prev.addEventListener('click',function(){show(i-1,-1)});
  next.addEventListener('click',function(){show(i+1,1)});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lb-stage')||e.target===cap)close()});
  d.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    else if(e.key==='ArrowLeft'&&list.length>1)show(i-1,-1);
    else if(e.key==='ArrowRight'&&list.length>1)show(i+1,1);
    else if(e.key==='Tab'){var f=[x,prev,next].filter(function(el){return !el.hidden});var k=f.indexOf(d.activeElement);e.preventDefault();f[(k+(e.shiftKey?-1:1)+f.length)%f.length].focus()}
  });
  var sx=null;
  lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){
    if(sx===null||list.length<2)return;var dx=e.changedTouches[0].clientX-sx;sx=null;
    if(Math.abs(dx)>50)show(i+(dx<0?1:-1),dx<0?1:-1);
  },{passive:true});
  /* tombol hanya muncul bila fotonya benar-benar ada */
  btns.forEach(function(b){
    var urls=b.getAttribute('data-fotos').split(',').map(function(s){return s.trim()}).filter(Boolean);
    var ok=[],left=urls.length;
    urls.forEach(function(u,k){
      var t=new Image();
      t.onload=function(){ok[k]=u;done()};t.onerror=done;t.src=u;
    });
    function done(){
      if(--left)return;
      b.fotos=ok.filter(Boolean);
      var li=b.closest('li'),h=li&&li.querySelector('h3');
      b.judul=h?h.textContent:'Foto';
      if(b.fotos.length){b.hidden=false;b.addEventListener('click',function(){open(b)})}
    }
  });
})();