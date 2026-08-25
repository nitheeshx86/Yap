/* YAP — base styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const CSS = `
.grdn{--mist:#EAF8FB;--foam:#D6F0F6;--ocean:#7EC8E3;--ocean-deep:#5FAECB;--sand:#F8F2E7;--sand-warm:#EEDBB8;--coral:#FF9F7F;--coral-deep:#E8674A;--ink:#1F4F5B;--ink2:#45636B;--ink3:#7A939A;--line:rgba(31,79,91,.14);--good:#7BAE8F;--warn:#C99A4B;--bad:#E8674A;--surf1:rgba(255,255,255,.55);--surf2:rgba(255,255,255,.8);--dis:"Fraunces","Baloo 2",Georgia,serif;--bod:"Manrope",system-ui,-apple-system,"Segoe UI",sans-serif;background:linear-gradient(180deg,var(--mist) 0%,var(--foam) 38%,var(--sand) 100%);color:var(--ink);font-family:var(--bod);font-optical-sizing:auto;font-weight:400;min-height:100%;padding-bottom:150px;position:relative;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.grdn *{box-sizing:border-box}
.grdn button{font-family:var(--bod)}
/* Two faces: Fraunces (--dis) for titles, headings and display numbers;
   Manrope (--bod) for body copy, labels and controls.
   Fraunces is a variable font, so each display register gets its own point on
   the SOFT/WONK/ital/wght axes rather than one flat heading treatment.
   - wordmark: max character — italic, wonky, soft, heavy.
   - .h1 (page headings): italic + wonky, gentle softness.
   - .big (celebratory numbers): wonky + heavy, upright (digits read badly italic).
   - .topic/.word (content the user reads aloud): upright, no wonk, soft touch —
     stays calm and legible since it's read under time pressure.
   - mid-register labels (dial/stage/report stats/etc.): wonky, upright, light soft.
   Body text is Manrope and ignores these axes entirely. */
.grdn h1,.grdn h2,.grdn h3,.grdn .h1,.grdn .big{font-optical-sizing:auto;font-variation-settings:"SOFT" 0,"WONK" 1;}
.h1{font-style:italic;font-variation-settings:"SOFT" 22,"WONK" 1}
.big{font-variation-settings:"SOFT" 0,"WONK" 1;font-style:normal}
.topic,.word{font-variation-settings:"SOFT" 35,"WONK" 0;font-style:normal}
.dial b,.rname{font-variation-settings:"SOFT" 12,"WONK" 1;font-style:normal}
.wordmark-text,.mark{font-style:italic;font-variation-settings:"SOFT" 30,"WONK" 1;font-weight:800}
.grdn::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.5;background-image:radial-gradient(760px 420px at 12% 0%,rgba(126,200,227,.14),transparent 62%),radial-gradient(680px 460px at 92% 18%,rgba(255,159,127,.08),transparent 60%),radial-gradient(700px 520px at 45% 110%,rgba(238,219,184,.35),transparent 62%)}
.wrap{max-width:720px;margin:0 auto;padding:0 24px;position:relative;z-index:1}
.top{display:flex;align-items:center;justify-content:space-between;padding:24px 0 16px;gap:16px}
.pot{display:flex;align-items:center;gap:8px;background:var(--surf1);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--line);border-radius:999px;padding:6px 14px 6px 10px;box-shadow:0 8px 22px rgba(31,79,91,.08)}
.pot b{font-family:var(--bod);font-weight:800;font-size:14px;font-variant-numeric:tabular-nums}
.pot small{font-size:10.5px;color:var(--ink3);letter-spacing:.06em;text-transform:uppercase}
.navdock{position:fixed;left:0;right:0;bottom:0;z-index:90;display:flex;justify-content:center;padding:0 16px calc(14px + env(safe-area-inset-bottom));pointer-events:none;transition:transform .38s cubic-bezier(.4,0,.2,1),opacity .3s}
.navdock[data-hidden="1"]{transform:translateY(calc(100% + 24px));opacity:0}
.navdock .nav{pointer-events:auto;width:100%;max-width:560px;margin-bottom:0}
@media (prefers-reduced-motion:reduce){.navdock{transition:none}}
.nav{display:flex;gap:6px;overflow-x:auto;padding:7px;background:rgba(255,255,255,.72);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);border:1px solid rgba(255,255,255,.8);border-radius:999px;margin-bottom:20px;scrollbar-width:none;position:relative;box-shadow:0 10px 34px rgba(31,79,91,.18),inset 0 1px 0 rgba(255,255,255,.9)}
.nav::-webkit-scrollbar{display:none}
.nav-slider{position:absolute;top:7px;bottom:7px;background:linear-gradient(145deg,var(--slide-c,var(--ocean)),color-mix(in srgb,var(--slide-c,var(--ocean)) 78%,#000));border-radius:999px;transition:left .42s cubic-bezier(.34,1.56,.5,1),width .42s cubic-bezier(.34,1.56,.5,1),background .3s;box-shadow:0 4px 14px rgba(var(--slide-g,126,200,227),.45),inset 0 1px 0 rgba(255,255,255,.35);pointer-events:none;z-index:0}
.tab{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;white-space:nowrap;border:none;background:transparent;color:var(--ink2);font-size:14px;font-weight:700;padding:10px 16px;border-radius:999px;cursor:pointer;transition:color .25s,transform .25s cubic-bezier(.34,1.56,.5,1);text-align:center;position:relative;z-index:1}
.tab .tab-ico{font-size:16px;line-height:1;display:inline-block;transition:transform .35s cubic-bezier(.34,1.56,.5,1);filter:saturate(1.1)}
.tab:hover{color:var(--ink)}
.tab:hover .tab-ico{transform:translateY(-2px) rotate(-8deg) scale(1.12)}
.tab:active{transform:scale(.95)}
.tab[data-on="1"]{color:#fff;text-shadow:0 1px 2px rgba(31,79,91,.25)}
.tab[data-on="1"] .tab-ico{animation:tabpop .5s cubic-bezier(.34,1.56,.5,1)}
.tab:focus-visible{outline:3px solid var(--ocean);outline-offset:2px}
@keyframes tabpop{0%{transform:scale(.6) rotate(-18deg)}55%{transform:scale(1.3) rotate(8deg)}100%{transform:scale(1) rotate(0)}}
@media (max-width:560px){.tab{font-size:0;gap:0;padding:10px 12px}.tab .tab-ico{font-size:20px}}
@media (prefers-reduced-motion:reduce){.tab[data-on="1"] .tab-ico{animation:none}.nav-slider{transition:left .2s,width .2s}}
.h1{font-family:var(--dis);font-weight:700;font-size:clamp(30px,7.6vw,44px);line-height:1.05;letter-spacing:-.02em;margin:16px 0 10px;text-wrap:balance;color:var(--ink)}
.h1 em{font-style:normal;color:var(--ink);position:relative;display:inline-block;z-index:0}
.h1 em::after{content:"";position:absolute;left:-6px;right:-6px;bottom:.06em;height:.4em;background:var(--sand-warm);border-radius:99px;z-index:-1}
.sub{color:var(--ink2);font-size:15.5px;line-height:1.6;max-width:56ch;margin:0 0 24px}
.eye{font-family:var(--bod);font-weight:700;font-size:10.5px;letter-spacing:.14em;color:var(--ink3);text-transform:uppercase}
.big{font-family:var(--dis);font-weight:700;letter-spacing:-.02em;display:inline-block;animation:thump .6s cubic-bezier(.2,1,.4,1) both}
.ex{font-size:14px;color:var(--ink3);line-height:1.6}
.card{background:var(--surf1);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--line);border-radius:28px;padding:24px;margin-bottom:20px;box-shadow:0 16px 40px rgba(31,79,91,.08);position:relative;animation:cardin .5s cubic-bezier(.2,.9,.3,1) both;transition:transform .3s cubic-bezier(.2,.9,.3,1),box-shadow .3s}
.card.tight{padding:18px 20px}
.card.focus-card{padding:26px;box-shadow:0 18px 44px rgba(255,159,127,.2)}
.hero-greeting{margin-bottom:24px}
.journey-container{padding:20px;background:var(--surf1);backdrop-filter:blur(14px);border:1px solid var(--line);border-radius:24px;margin-bottom:24px}
.journey-track{animation:cardin .6s cubic-bezier(.2,.9,.3,1) both}
.journey-step{animation:rise .5s cubic-bezier(.2,.9,.3,1) both}
.progress-mascot{animation:mascpop .7s cubic-bezier(.2,1,.35,1) both}
.stat-card{animation:rise .5s cubic-bezier(.2,.9,.3,1) both;transition:transform .25s cubic-bezier(.2,.9,.3,1)}
.stat-card:hover{transform:translateY(-2px)}
.streak-growth{padding:16px;background:var(--surf2);border-radius:18px}
.streak-stats>div{transition:transform .25s}
.streak-stats>div:hover{transform:translateY(-2px)}
.taskrow{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px dashed var(--line)}
.taskrow:last-child{border-bottom:none}
.taskbox{flex:0 0 28px;height:28px;border-radius:10px;border:1px solid var(--line);display:grid;place-items:center;font-family:var(--bod);font-weight:700;font-size:12px;background:var(--sand);color:var(--ink3)}
.taskrow[data-done="1"] .taskbox{background:var(--good);border-color:var(--good);color:#fff}
.taskrow b{font-size:14.5px;color:var(--ink2);font-weight:600}
.taskrow[data-done="1"] b{color:var(--ink3);text-decoration:line-through;text-decoration-color:var(--line)}
/* the wotd badge sits at the card's top-right, so the row it shares needs to
   start left of it and never run underneath */
.wcard-top{display:flex;justify-content:flex-end;margin:-4px 0 10px;position:relative;z-index:4}
.card.sun .wcard-top{padding-right:96px}
@media (max-width:420px){.card.sun .wcard-top{padding-right:0;margin-top:6px}}
.ghostlink{background:none;border:none;color:var(--ink3);font-family:var(--bod);font-weight:600;font-size:13px;cursor:pointer;padding:8px 4px;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
.ghostlink:hover{color:var(--ink2)}
.seg2{display:flex;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surf1)}
.seg2 button{flex:1;border:none;background:none;padding:11px 4px;font-family:var(--bod);font-weight:700;font-size:14px;color:var(--ink2);cursor:pointer;border-right:1px solid var(--line);transition:.2s}
.seg2 button:last-child{border-right:none}
.seg2 button[data-on="1"]{background:var(--ocean);color:#fff}
.card.moss{box-shadow:0 16px 40px rgba(126,200,227,.16)}
.card.coral{box-shadow:0 16px 40px rgba(255,159,127,.18)}
.card.sky{box-shadow:0 16px 40px rgba(126,200,227,.18)}
.card.sun{box-shadow:0 16px 40px rgba(238,219,184,.3)}
.tag{position:absolute;top:-13px;right:20px;z-index:3;background:var(--coral);color:#fff;font-family:var(--bod);font-weight:700;font-size:10.5px;padding:5px 12px;border-radius:999px;letter-spacing:.08em;box-shadow:0 6px 14px rgba(255,159,127,.35);transition:transform .3s cubic-bezier(.2,.9,.3,1)}
.btn{font-weight:700;font-size:15px;border:1px solid var(--line);border-radius:999px;padding:13px 24px;cursor:pointer;background:var(--surf1);backdrop-filter:blur(10px);color:var(--ink);transition:.18s cubic-bezier(.2,.9,.3,1);position:relative;box-shadow:0 8px 20px rgba(31,79,91,.07)}
.btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 26px rgba(31,79,91,.1)}
.btn:active:not(:disabled){transform:translateY(0);box-shadow:0 4px 12px rgba(31,79,91,.08)}
.btn:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.btn.go{background:var(--coral);color:#fff;border-color:var(--coral);box-shadow:0 10px 26px rgba(255,159,127,.35)}
.btn.leaf{background:var(--surf1);color:var(--ocean-deep);border-color:var(--ocean);box-shadow:0 8px 20px rgba(126,200,227,.16)}
.btn.gold{background:var(--sand-warm);color:var(--ink);border-color:var(--sand-warm);box-shadow:0 8px 20px rgba(238,219,184,.4)}
.btn.sm{padding:9px 16px;font-size:13px}
.btn:focus-visible{outline:3px solid var(--ocean);outline-offset:3px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.chip{border:1px solid var(--line);background:var(--surf1);color:var(--ink2);border-radius:999px;padding:8px 15px;font-size:13.5px;font-weight:600;cursor:pointer;transition:transform .22s cubic-bezier(.2,.9,.3,1),background .22s,color .22s,border-color .22s}
.chip:focus-visible,.slot:focus-visible,.aitem:focus-visible,.cell:focus-visible,.iv-opt:focus-visible,.x:focus-visible,.seg button:focus-visible{outline:3px solid var(--ocean);outline-offset:2px}
.chip[data-on="1"]{background:var(--ocean);border-color:var(--ocean);color:#fff;transform:translateY(-1px)}
.slot{border:1px solid var(--line);background:var(--surf1);border-radius:18px;padding:12px 8px;cursor:pointer;flex:1 1 68px;text-align:center;transition:.18s cubic-bezier(.2,.9,.3,1)}
.slot[data-on="1"]{background:var(--ocean);border-color:var(--ocean);color:#fff}
.slot b{display:block;font-family:var(--bod);font-weight:800;font-size:16px;font-variant-numeric:tabular-nums}
.slot span{font-size:10px;opacity:.75}
/* grass meter — the growing-plant metaphor stays, just retinted */
.grass{display:flex;gap:4px;align-items:flex-end;height:74px;justify-content:center;border-bottom:2px solid var(--line);margin:16px 0 0}
.blade{width:7px;border-radius:99px 99px 2px 2px;background:linear-gradient(180deg,#BFE3CF,var(--good));transition:height .1s ease-out;transform-origin:bottom center}
.blade.idle{background:var(--line)}
.soil{height:9px;background:repeating-linear-gradient(90deg,var(--sand-warm) 0 7px,var(--sand) 7px 14px);border-radius:0 0 10px 10px;margin-bottom:16px}
/* SIGNATURE: the timer's signal card — soft pebbles, not hard blocks */
.signal{display:flex;gap:10px;justify-content:center;align-items:center;margin:16px 0 4px}
.lamp{width:32px;height:32px;border-radius:50%;border:1px solid var(--line);background:var(--sand);transition:.3s ease}
.lamp[data-on="1"]{box-shadow:0 0 0 6px rgba(31,79,91,.05)}
.lamp.g[data-on="1"]{background:var(--good)}
.lamp.a[data-on="1"]{background:var(--warn)}
.lamp.r[data-on="1"]{background:var(--bad);animation:breathe-warn 1.6s ease-in-out infinite}
@keyframes breathe-warn{50%{opacity:.55}}
.signlbl{font-family:var(--bod);font-weight:700;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);text-align:center;margin-top:4px}
.clock{font-family:var(--bod);font-weight:800;font-size:34px;text-align:center;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:var(--ink)}
.clock small{font-size:13px;color:var(--ink3);font-weight:500}
.clock.over{color:var(--bad)}
.vine{height:9px;border-radius:99px;background:var(--foam);overflow:hidden;margin:14px 0}
.vine i{display:block;height:100%;background:var(--good);transition:width .35s ease;position:relative;overflow:hidden}
.vine i.a{background:var(--warn)}
.vine i.r{background:var(--bad)}
.topic{font-family:var(--dis);font-weight:600;font-size:clamp(20px,5vw,27px);line-height:1.25;letter-spacing:-.01em;min-height:2.2em;display:flex;align-items:center;color:var(--ink)}
.fade{opacity:.3}
.script{font-size:17px;line-height:1.9;white-space:pre-wrap;min-height:52px}
.fil{background:rgba(255,159,127,.22);border-bottom:2px solid var(--coral);border-radius:4px;padding:0 3px;font-weight:600}
.hed{background:rgba(238,219,184,.5);border-bottom:2px solid var(--sand-warm);border-radius:4px;padding:0 3px;font-style:italic}
.interim{color:var(--ink3)}
.stat{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px dashed var(--line)}
.stat:last-child{border-bottom:none}
.stat span{font-size:14.5px;color:var(--ink2)}
.stat b{font-family:var(--bod);font-weight:800;font-size:18px;font-variant-numeric:tabular-nums}
.ok{color:var(--good)}
.warn{color:var(--warn)}
.bad{color:var(--bad)}
.dials{display:flex;gap:10px;flex-wrap:wrap}
.dial{flex:1 1 84px;text-align:center;border:1px solid var(--line);border-radius:20px;padding:15px 6px;background:var(--surf2);transition:transform .3s cubic-bezier(.2,.9,.3,1)}
.dial b{display:block;font-family:var(--dis);font-weight:700;font-size:28px;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:var(--ink)}
@keyframes rise{from{opacity:0;transform:translateY(14px) scale(.97)}}
.rbadge svg{opacity:.85}
.btn>span{display:inline-flex;align-items:center;gap:7px}
.dial span{font-family:var(--bod);font-weight:700;font-size:9.5px;color:var(--ink3);letter-spacing:.1em;text-transform:uppercase}
/* role-player report cards */
.role{display:flex;gap:14px;align-items:flex-start;margin-bottom:8px}
.rbadge{flex:0 0 46px;height:46px;border-radius:16px;border:1px solid var(--line);display:grid;place-items:center;font-size:21px;animation:badgein .5s cubic-bezier(.2,1.1,.35,1) both;overflow:hidden;padding:0;background:var(--sand)}
.rname{font-family:var(--dis);font-weight:700;font-size:18px;letter-spacing:-.01em;line-height:1.1;color:var(--ink)}
.rrole{font-family:var(--bod);font-weight:600;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3)}
.tally{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.tchip{font-family:var(--bod);font-weight:600;font-size:12px;border:1px solid var(--line);border-radius:999px;padding:6px 12px;background:var(--sand)}
.tchip b{color:var(--coral-deep)}
.verdict{display:inline-block;font-family:var(--bod);font-weight:700;font-size:10px;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;padding:4px 12px;margin-top:10px}
.verdict.q{background:var(--good);color:#fff}
.verdict.u{background:var(--warn);color:#fff}
.verdict.o{background:var(--bad);color:#fff}
.fixrow{border:1px solid var(--line);border-radius:18px;padding:15px 16px;margin-bottom:12px;background:var(--surf2)}
.fixrow .was{color:var(--bad);text-decoration:line-through;text-decoration-thickness:2px}
.fixrow .now{color:var(--good);font-weight:700}
.fixrow p{margin:8px 0 0;font-size:13px;color:var(--ink2);line-height:1.5}
.fixrow .ctx{font-family:var(--bod);font-size:11.5px;color:var(--ink3);margin-top:6px;display:block}
.badge{display:inline-block;font-family:var(--bod);font-weight:700;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;padding:3px 10px;margin-bottom:8px;color:var(--ink)}
.badge.g{background:rgba(255,159,127,.3)}
.badge.r{background:var(--foam)}
.badge.v{background:rgba(238,219,184,.6)}
.note{border-left:4px solid var(--ocean);padding:10px 0 10px 16px;font-size:15.5px;line-height:1.65}
.note.warnl{border-color:var(--warn)}
.note.badl{border-color:var(--bad)}
.warnbox{background:rgba(255,159,127,.12);border:1px solid rgba(255,159,127,.4);border-radius:18px;padding:16px;font-size:14px;line-height:1.6;margin-bottom:16px}
.tip{background:rgba(238,219,184,.28);border:1px dashed var(--sand-warm);border-radius:18px;padding:15px;font-size:13.5px;line-height:1.6}
.word{font-family:var(--dis);font-weight:700;font-size:clamp(32px,8vw,46px);letter-spacing:-.02em;line-height:1;color:var(--ink)}
.pos{font-family:var(--bod);font-weight:700;font-size:11px;color:var(--coral-deep);letter-spacing:.1em}
.def{font-size:16px;line-height:1.6;margin:12px 0;color:var(--ink2)}
.bank{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.seed{font-family:var(--bod);font-weight:600;font-size:11.5px;padding:7px 12px;border-radius:999px;background:var(--foam);border:1px solid var(--ocean);color:var(--ocean-deep)}
.said{display:flex;gap:12px;padding:13px 0;border-bottom:1px dashed var(--line)}
.said:last-child{border-bottom:none}
.av{flex:0 0 40px;height:40px;border-radius:14px;border:1px solid var(--line);display:grid;place-items:center;font-family:var(--dis);font-weight:700;font-size:16px}
.who{font-size:12.5px;font-weight:700;margin-bottom:3px;color:var(--ink)}
.line{font-size:15.5px;line-height:1.6;color:var(--ink2)}
.me .line{color:var(--ocean-deep);font-weight:600}
.feed{max-height:330px;overflow-y:auto;padding-right:4px}
.nowspeak{border:1px solid var(--line);border-radius:20px;padding:16px;background:var(--surf2);margin-bottom:14px}
.turnbar{height:6px;border-radius:99px;background:var(--foam);overflow:hidden;margin-top:10px}
.turnbar i{display:block;height:100%;transition:width .15s linear}
.queue{font-family:var(--bod);font-weight:600;font-size:11px;color:var(--ink3);margin-top:8px}
.ribbon{display:flex;height:16px;border-radius:99px;overflow:hidden;margin:14px 0 8px;background:var(--foam)}
.key{display:flex;gap:12px;flex-wrap:wrap;font-family:var(--bod);font-weight:600;font-size:10.5px;color:var(--ink3)}
.dot{width:9px;height:9px;border-radius:3px;display:inline-block;margin-right:5px}
.mini{display:flex;gap:10px;overflow-x:auto;padding:4px 0;scrollbar-width:none}
.mini::-webkit-scrollbar{display:none}
.pc{flex:0 0 auto;text-align:center;width:66px}
.pc .av{width:46px;height:46px;margin:0 auto 5px;border-radius:16px;transition:.25s;opacity:.55}
.pc[data-live="1"] .av{opacity:1;transform:translateY(-2px)}
.pc small{font-size:10.5px;color:var(--ink3);display:block}
.pc i{font-family:var(--bod);font-size:9px;font-style:normal;color:var(--ink3)}
/* agenda */
.agenda{display:flex;flex-direction:column;gap:0}
.aitem{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed var(--line);cursor:pointer;background:none;border-left:none;border-right:none;border-top:none;width:100%;text-align:left}
.aitem:last-child{border-bottom:none}
.abox{flex:0 0 30px;height:30px;border:1px solid var(--line);border-radius:10px;display:grid;place-items:center;font-family:var(--bod);font-size:14px;background:var(--sand)}
.aitem[data-done="1"] .abox{background:var(--good);color:#fff;border-color:var(--good)}
.aitem b{font-size:15.5px;display:block;color:var(--ink)}
.aitem span{font-size:12.5px;color:var(--ink3)}
.plot{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin:16px 0;padding:14px 10px 6px;background:var(--surf2);border:1px solid var(--line);border-radius:18px}
.cell{aspect-ratio:1;border:none;background:none;cursor:pointer;display:grid;place-items:end center;padding:0 0 6px;transition:transform .3s cubic-bezier(.2,.9,.3,1)}
.cell span{font-family:var(--bod);font-size:10px;color:var(--ink3)}
.cell[data-s="today"] span{color:var(--coral-deep);font-weight:700}
.plan{border:1px solid var(--line);border-radius:22px;padding:18px;flex:1 1 200px;background:var(--surf1);box-shadow:0 8px 22px rgba(31,79,91,.07)}
.plan[data-on="1"]{background:var(--sand-warm);border-color:var(--sand-warm);box-shadow:0 8px 22px rgba(238,219,184,.5)}
.plan h4{font-family:var(--dis);font-weight:700;font-size:20px;margin:3px 0 5px;letter-spacing:-.02em;color:var(--ink)}
.typebox{width:100%;background:var(--sand);border:1px solid var(--line);border-radius:18px;color:var(--ink);font-family:var(--bod);font-size:16px;line-height:1.7;padding:14px 15px;resize:vertical;margin-top:14px}
.typebox:focus{outline:none;border-color:var(--ocean);box-shadow:0 0 0 4px rgba(126,200,227,.18)}
.spin{display:inline-block;width:14px;height:14px;border:2px solid var(--foam);border-top-color:var(--ocean);border-radius:50%;animation:sp .8s linear infinite;vertical-align:-2px;margin-right:8px}
@keyframes sp{to{transform:rotate(360deg)}}
.petal{position:fixed;width:10px;height:10px;border-radius:60% 0 60% 0;pointer-events:none;z-index:60;animation:drift linear forwards}
@keyframes drift{to{transform:translateY(102vh) rotate(220deg);opacity:0}}
.hl-empty{background:rgba(122,147,154,.14);border-bottom:2px solid var(--ink3);border-radius:4px;padding:0 3px}
.hl-wordy{background:rgba(201,154,75,.16);border-bottom:2px solid var(--warn);border-radius:4px;padding:0 3px}
.hl-repeat{background:rgba(126,200,227,.16);border-bottom:2px dashed var(--ocean);border-radius:4px;padding:0 3px}
.legend{display:flex;flex-wrap:wrap;gap:10px;font-family:var(--bod);font-weight:600;font-size:10px;color:var(--ink3);margin-top:12px}
.legend i{width:12px;height:12px;border-radius:3px;display:inline-block;margin-right:5px;vertical-align:-2px}
.rw{border:1px solid var(--line);border-radius:18px;padding:15px;margin-bottom:12px;background:var(--surf2)}
.rw .lbl{font-family:var(--bod);font-weight:700;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);display:block;margin-bottom:5px}
.rw .orig{display:block;font-size:14.5px;line-height:1.6;color:var(--ink3)}
.rw .tight{font-size:15.5px;line-height:1.6;font-weight:600;color:var(--good);display:block;margin-top:8px}
.rw .cutlist{font-family:var(--bod);font-size:11px;color:var(--coral-deep);margin-top:8px;line-height:1.7}
.rw .save{font-family:var(--bod);font-weight:700;font-size:11px;background:var(--sand-warm);border-radius:999px;padding:2px 10px;display:inline-block;margin-top:8px}
.libitem{display:flex;gap:10px;align-items:flex-start;padding:12px 0;border-bottom:1px dashed var(--line)}
.libitem:last-child{border-bottom:none}
.libitem p{margin:0;font-size:14.5px;line-height:1.5;flex:1;color:var(--ink2)}
.libitem small{font-family:var(--bod);font-size:10px;color:var(--ink3);display:block;margin-top:3px}
.x{border:1px solid var(--line);background:var(--sand);border-radius:10px;width:28px;height:28px;flex:0 0 28px;cursor:pointer;font-size:14px;line-height:1;padding:0;color:var(--ink2)}
.x:hover{background:var(--coral);color:#fff;border-color:var(--coral)}
.seg{display:flex;gap:6px;margin-bottom:16px}
.seg button{flex:1;border:1px solid var(--line);background:var(--surf1);border-radius:14px;padding:9px;font-size:13px;font-weight:600;cursor:pointer;color:var(--ink2)}
.seg button[data-on="1"]{background:var(--ocean);border-color:var(--ocean);color:#fff}
.gddial{display:flex;gap:8px;flex-wrap:wrap}
.gddial>div{flex:1 1 76px;border:1px solid var(--line);border-radius:16px;padding:11px 5px;text-align:center;background:var(--surf2);transition:transform .3s cubic-bezier(.2,.9,.3,1)}
.gddial b{display:block;font-family:var(--dis);font-weight:700;font-size:22px;line-height:1;color:var(--ink)}
.gddial span{font-family:var(--bod);font-weight:700;font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}
.plantwrap{display:flex;align-items:flex-end;justify-content:center;gap:16px;padding:8px 0 2px}
.stagelbl{font-family:var(--dis);font-weight:700;font-size:19px;letter-spacing:-.01em;color:var(--ink)}
/* ---------- soft lift, not hard extrusion ---------- */
@keyframes cardin{from{opacity:0;transform:translateY(18px) scale(.98)}}
.card:hover{transform:translateY(-2px)}
.chip:hover{transform:translateY(-1px)}
.chip:active{transform:scale(.96)}
.tab:active{transform:scale(.97)}
@keyframes thump{0%{opacity:0;transform:scale(.7)}100%{opacity:1;transform:none}}
.popring{position:relative}
.popring::before{content:"";position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;border:2px solid var(--ocean);animation:ringpop 1.1s .2s cubic-bezier(.2,.7,.2,1) both}
@keyframes ringpop{to{width:230px;height:230px;margin:-115px 0 0 -115px;opacity:0;border-width:1px}}
.dial:hover{transform:translateY(-2px)}
.gddial>div:hover{transform:translateY(-2px)}
@keyframes badgein{from{opacity:0;transform:scale(.7)}}
.mark svg,.pot svg{animation:sway 5s ease-in-out infinite;transform-origin:bottom center}
@keyframes sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
/* VOCABULARY: a card you actually flip over */
.flip{perspective:1100px;cursor:pointer}
/* grid-stacking both faces means the taller one sets the height, so a long
   definition grows the card instead of overflowing a fixed 158px box */
.flip-in{display:grid;min-height:158px;transform-style:preserve-3d;transition:transform .6s cubic-bezier(.3,.9,.35,1)}
.flip-face,.flip-back{grid-area:1/1}
.flip[data-flip="1"] .flip-in{transform:rotateY(180deg)}
.flip-face,.flip-back{backface-visibility:hidden;-webkit-backface-visibility:hidden}
.flip-back{transform:rotateY(180deg);-webkit-transform:rotateY(180deg);display:flex;flex-direction:column;justify-content:center;opacity:0;transition:opacity .18s .3s}
.flip-face{transform:rotateY(0deg);-webkit-transform:rotateY(0deg);opacity:1;transition:opacity .18s .3s}
.flip[data-flip="1"] .flip-face{opacity:0}
.flip[data-flip="1"] .flip-back{opacity:1}
.flip-hint{font-family:var(--bod);font-weight:600;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3);margin-top:16px;display:flex;align-items:center;gap:6px}
.flip-hint i{display:inline-block;animation:nudge 2s ease-in-out infinite;font-style:normal}
@keyframes nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}
.panel{animation:panelin .4s cubic-bezier(.2,.9,.3,1) both}
@keyframes panelin{from{opacity:0;transform:translateY(10px)}}
.seed,.tchip,.ftag{transition:transform .22s cubic-bezier(.2,.9,.3,1)}
.seed:hover,.tchip:hover{transform:translateY(-1px)}
.vine i::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);animation:shimmer 2.2s linear infinite}
@keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(200%)}}
.grass:hover .blade{animation:bladewave 1.6s ease-in-out infinite}
@keyframes bladewave{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
.cell:hover{transform:translateY(-3px)}
.onb .masc{filter:drop-shadow(0 6px 14px rgba(31,79,91,.18))}
.av,.iv-av,.pc .av{background:var(--sand);padding:0;overflow:hidden;position:relative;display:grid;place-items:center}
.av .masc,.pc .av .masc,.iv-av .masc{width:100%;height:100%;object-fit:cover;transform:scale(1.08)}
.avtint{position:absolute;inset:0;opacity:.18;z-index:0}
.av .masc,.iv-av .masc{position:relative;z-index:1}
.rbadge .masc{width:100%;height:100%;object-fit:cover;transform:scale(1.1)}
.said .av{width:46px;height:46px;flex:0 0 46px;border-radius:16px}
.wordmark{height:26px;width:auto;display:block}
.wordmark-text{font-family:var(--dis);font-weight:700;font-size:24px;line-height:1;letter-spacing:-.02em;color:var(--ink)}
.wordmark-text i{font-style:normal;color:var(--coral)}
.mark{font-family:var(--dis);letter-spacing:-.02em;font-weight:700;font-size:24px;line-height:1;display:flex;align-items:center;gap:10px;color:var(--ink)}
.tagline{font-family:var(--bod);font-weight:700;font-size:8.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--ink3);margin-top:3px}
.brandwrap{display:flex;flex-direction:column}
.masc{filter:drop-shadow(0 6px 16px rgba(31,79,91,.14));display:block;image-rendering:auto;user-select:none;-webkit-user-drag:none}
.masc-bob{animation:bob 3.6s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-5px) rotate(1deg)}}
.masc-pop{animation:mascpop .6s cubic-bezier(.2,1,.35,1) both}
@keyframes mascpop{from{opacity:0;transform:scale(.7)}}
.masc-peek{animation:peek .8s cubic-bezier(.2,.9,.35,1) both}
@keyframes peek{from{opacity:0;transform:translateY(24px)}}
.mascrow{display:flex;align-items:center;gap:14px}
.onb .mascrow .bubble{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.22);color:inherit}
.onb .mascrow .bubble::before{background:#1B3A42;border-color:rgba(255,255,255,.22)}
.mascrow .bubble{flex:1;background:var(--surf2);border:1px solid var(--line);border-radius:20px;padding:13px 16px;font-size:15px;line-height:1.55;position:relative}
.mascrow .bubble::before{content:"";position:absolute;left:-8px;top:22px;width:14px;height:14px;background:var(--surf2);border-left:1px solid var(--line);border-bottom:1px solid var(--line);transform:rotate(45deg)}
.mark .masc{margin-right:2px}
.pot .masc{margin:0}
.emptystate{text-align:center;padding:10px 0 4px}
.emptystate .masc{margin:0 auto 10px}
@media (prefers-reduced-motion:reduce){.grdn *{animation:none!important;transition:none!important}}

/* Carousel Styles */
.carousel-container {
  position: relative;
  width: 100%;
}
.carousel-viewport {
  overflow: hidden;
  width: 100%;
  padding: 20px 0;
  margin: -20px 0;
}
.carousel-track {
  display: flex;
  transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);
  width: 100%;
}
.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  margin-bottom: 0 !important;
}
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--surf2);
  border: 1px solid var(--line);
  color: var(--ink);
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(31,79,91,.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  opacity: 0.75;
}
.carousel-arrow:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 16px rgba(31,79,91,.15);
}
.carousel-arrow:active {
  transform: translateY(-50%) scale(0.95);
}
.carousel-arrow.prev {
  left: -18px;
}
.carousel-arrow.next {
  right: -18px;
}
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}
.carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  border: none;
  background: var(--ink3);
  opacity: 0.4;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);
  padding: 0;
}
.carousel-dot.active {
  width: 24px;
  opacity: 1;
  background: var(--coral) !important;
}
.carousel-dot.done {
  background: var(--good);
  opacity: 0.7;
}
.carousel-dot.done.active {
  background: var(--good) !important;
  opacity: 1;
}
.focus-icon-circle {
  flex: 0 0 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
}
.focus-icon-circle.sun {
  background: rgba(238, 219, 184, 0.4);
}
.focus-icon-circle.coral {
  background: rgba(255, 159, 127, 0.2);
}
.focus-icon-circle.sky {
  background: rgba(126, 200, 227, 0.25);
}
@media (max-width: 768px) {
  .carousel-arrow.prev {
    left: 8px;
  }
  .carousel-arrow.next {
    right: 8px;
  }
}
`;
