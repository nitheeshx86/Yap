"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ============================================================================
   YAP — speak · practice · evolve
   Run a meeting: Word of the Day → Table Topic → Group Discussion.
   Four role-players evaluate you: Timer, Ah-Counter, Grammarian, Evaluator.
   ========================================================================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
.grdn{--paper:#0b0a1f;--paper2:#161334;--ink:#f4f1ff;--ink60:#a79fd4;--moss:#9d80ff;--sun:#ffc857;--coral:#ff7a63;--sky:#56c8f5;--berry:#e56ad0;--line:#2a2352;--green:#7ee0a8;--amber:#ffc857;--red:#ff7a63;--dis:Fredoka,Outfit,system-ui,sans-serif;--bod:Outfit,system-ui,sans-serif;--mon:"Space Mono",monospace;background:var(--paper);color:var(--ink);font-family:var(--bod);min-height:100%;padding-bottom:100px;position:relative;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.grdn *{box-sizing:border-box}
.grdn button{font-family:var(--bod)}
.grdn::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.32;background-image:radial-gradient(rgba(157,128,255,.16) 1px,transparent 1px);background-size:22px 22px}
.wrap{max-width:720px;margin:0 auto;padding:0 18px;position:relative;z-index:1;perspective:1400px}
.top{display:flex;align-items:center;justify-content:space-between;padding:20px 0 12px;gap:12px}
.pot{display:flex;align-items:center;gap:8px;background:var(--paper2);border:2.5px solid var(--line);border-radius:999px;padding:5px 13px 5px 9px;box-shadow:0 6px 18px rgba(0,0,0,.45)}
.pot b{font-family:var(--mon);font-size:13px}
.pot small{font-size:10px;color:var(--ink60);letter-spacing:.06em;text-transform:uppercase}
.nav{display:flex;gap:7px;overflow-x:auto;padding:4px 0 16px;scrollbar-width:none}
.nav::-webkit-scrollbar{display:none}
.tab{flex:0 0 auto;border:2.5px solid var(--line);background:var(--paper2);color:var(--ink);font-size:13.5px;font-weight:600;padding:9px 15px;border-radius:999px;cursor:pointer;transition:transform .22s cubic-bezier(.2,1.4,.4,1),background .2s,box-shadow .2s}
.tab:hover{transform:translateY(-2px)}
.tab[data-on="1"]{background:var(--ink);color:var(--paper);transform:translateY(-2px) scale(1.03);box-shadow:0 5px 0 #4a35a8}
.tab:focus-visible{outline:3px solid var(--sky);outline-offset:2px}
.h1{font-family:var(--dis);font-weight:900;font-size:clamp(31px,8.2vw,46px);line-height:.95;letter-spacing:-.035em;margin:16px 0 10px;text-wrap:balance}
.h1 em{font-style:normal;color:var(--ink);position:relative;display:inline-block;z-index:0}
.h1 em::after{content:"";position:absolute;left:-6px;right:-6px;bottom:.04em;height:.42em;background:var(--sun);border-radius:99px;z-index:-1;transform:rotate(-1.2deg)}
.sub{color:var(--ink60);font-size:15px;line-height:1.6;max-width:56ch;margin:0 0 20px}
.eye{font-family:var(--mon);font-size:10px;letter-spacing:.17em;color:var(--ink60);text-transform:uppercase}
.big{font-family:var(--dis);font-weight:700;letter-spacing:-.03em;display:inline-block;animation:thump .7s cubic-bezier(.2,1.5,.35,1) both}
.ex{font-size:14px;color:var(--ink60);line-height:1.6}
.card{background:var(--paper2);border:2.5px solid var(--line);border-radius:22px;padding:20px;margin-bottom:14px;box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 0 1px rgba(157,128,255,.14);position:relative;transform-style:preserve-3d;animation:cardin .55s cubic-bezier(.22,1.3,.36,1) both;transition:transform .25s cubic-bezier(.2,.9,.3,1),box-shadow .25s}
.card.moss{box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 0 1px rgba(157,128,255,.35)}
.card.coral{box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 0 1px rgba(255,122,99,.35)}
.card.sky{box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 0 1px rgba(86,200,245,.32)}
.card.sun{box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 0 1px rgba(255,200,87,.32)}
.tag{position:absolute;top:-14px;right:16px;z-index:3;background:var(--sun);color:var(--ink);font-family:var(--mon);font-size:10px;padding:4px 10px;border-radius:999px;border:2.5px solid var(--line);letter-spacing:.1em;transform:rotate(2.5deg);transition:transform .25s cubic-bezier(.2,1.5,.4,1)}
.btn{font-weight:700;font-size:15px;border:2.5px solid var(--line);border-radius:999px;padding:12px 22px;cursor:pointer;background:var(--paper2);color:var(--ink);transition:.11s;position:relative;transform-style:preserve-3d;box-shadow:0 5px 0 #3a2f70,0 10px 22px rgba(0,0,0,.5)}
.btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 7px 0 #3a2f70,0 14px 26px rgba(0,0,0,.55)}
.btn:active:not(:disabled){transform:translateY(4px);box-shadow:0 1px 0 #3a2f70,0 2px 8px rgba(0,0,0,.45)}
.btn:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.btn.go{background:var(--coral);color:#fff;box-shadow:0 5px 0 #8a3a2c,0 9px 18px rgba(255,122,99,.3)}
.btn.leaf{background:var(--moss);color:#fff;box-shadow:0 5px 0 #4a35a8,0 9px 18px rgba(157,128,255,.32)}
.btn.gold{background:var(--sun);box-shadow:0 5px 0 #a37a1d,0 9px 18px rgba(255,200,87,.3)}
.btn.sm{padding:8px 15px;font-size:13px;box-shadow:0 4px 0 #3a2f70}
.btn:focus-visible{outline:3px solid var(--sky);outline-offset:3px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.chip{border:2.5px solid var(--line);background:var(--paper2);color:var(--ink);border-radius:999px;padding:7px 14px;font-size:13px;font-weight:500;cursor:pointer;transition:transform .2s cubic-bezier(.2,1.5,.4,1),background .2s,color .2s}
.chip:focus-visible,.slot:focus-visible,.aitem:focus-visible,.cell:focus-visible,.iv-opt:focus-visible,.x:focus-visible,.seg button:focus-visible{outline:3px solid var(--sky);outline-offset:2px}
.chip[data-on="1"]{background:var(--moss);color:#fff;transform:rotate(-1deg) scale(1.04);box-shadow:0 4px 0 #4a35a8}
.slot{border:2.5px solid var(--line);background:var(--paper2);border-radius:16px;padding:11px 8px;cursor:pointer;flex:1 1 68px;text-align:center;transition:.12s}
.slot[data-on="1"]{background:var(--ink);color:var(--paper)}
.slot b{display:block;font-family:var(--mon);font-size:16px}
.slot span{font-size:10px;opacity:.75}
/* grass meter */
.grass{display:flex;gap:4px;align-items:flex-end;height:74px;justify-content:center;border-bottom:3px solid var(--line);margin:16px 0 0}
.blade{width:7px;border-radius:99px 99px 2px 2px;background:linear-gradient(180deg,#c7b3ff,var(--moss));transition:height .09s ease-out;transform-origin:bottom center}
.blade.idle{background:#2a2352}
.soil{height:9px;background:repeating-linear-gradient(90deg,#2a2352 0 7px,#332a63 7px 14px);border-radius:0 0 8px 8px;margin-bottom:14px}
/* SIGNATURE: the timer's signal card */
.signal{display:flex;gap:8px;justify-content:center;align-items:center;margin:14px 0 4px}
.lamp{width:34px;height:34px;border-radius:9px;border:2.5px solid var(--line);background:#241e4d;transition:.25s}
.lamp[data-on="1"]{box-shadow:0 0 0 4px rgba(22,50,31,.09)}
.lamp.g[data-on="1"]{background:var(--green)}
.lamp.a[data-on="1"]{background:var(--amber)}
.lamp.r[data-on="1"]{background:var(--red);animation:flash 1s infinite}
@keyframes flash{50%{opacity:.45}}
.signlbl{font-family:var(--mon);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink60);text-align:center;margin-top:2px}
.clock{font-family:var(--mon);font-size:34px;font-weight:700;text-align:center;letter-spacing:-.02em}
.clock small{font-size:13px;color:var(--ink60);font-weight:400}
.clock.over{color:var(--red)}
.vine{height:10px;border:2.5px solid var(--line);border-radius:99px;background:var(--paper);overflow:hidden;margin:12px 0}
.vine i{display:block;height:100%;background:var(--moss);transition:width .3s;position:relative;overflow:hidden}
.vine i.a{background:var(--amber)}
.vine i.r{background:var(--red)}
.topic{font-family:var(--dis);font-weight:600;font-size:clamp(21px,5.4vw,28px);line-height:1.2;letter-spacing:-.02em;min-height:2.2em;display:flex;align-items:center}
.fade{opacity:.25}
.script{font-size:17px;line-height:1.9;white-space:pre-wrap;min-height:52px}
.fil{background:rgba(255,122,99,.2);border-bottom:2.5px solid var(--coral);border-radius:4px;padding:0 3px;font-weight:600}
.hed{background:rgba(255,200,87,.18);border-bottom:2.5px solid var(--sun);border-radius:4px;padding:0 3px;font-style:italic}
.interim{color:var(--ink60)}
.caret{border-left:3px solid var(--moss);animation:bl 1.05s steps(1) infinite}
@keyframes bl{50%{opacity:0}}
.stat{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:2px dotted var(--line)}
.stat:last-child{border-bottom:none}
.stat span{font-size:14.5px;color:var(--ink60)}
.stat b{font-family:var(--mon);font-size:18px}
.ok{color:var(--moss)}
.warn{color:#ffc857}
.bad{color:var(--coral)}
.dials{display:flex;gap:9px;flex-wrap:wrap}
.dial{flex:1 1 84px;text-align:center;border:2.5px solid var(--line);border-radius:16px;padding:13px 6px;background:var(--paper);transform-style:preserve-3d;transition:transform .25s cubic-bezier(.2,1.3,.4,1)}
.dial b{display:block;font-family:var(--dis);font-weight:700;font-size:29px;line-height:1;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
@keyframes rise{from{opacity:0;transform:translateY(14px) scale(.95)}}
.rbadge svg{opacity:.85}
.btn>span{display:inline-flex;align-items:center;gap:7px}
.dial span{font-family:var(--mon);font-size:9.5px;color:var(--ink60);letter-spacing:.12em;text-transform:uppercase}
/* role-player report cards */
.role{display:flex;gap:13px;align-items:flex-start;margin-bottom:6px}
.rbadge{flex:0 0 46px;height:46px;border-radius:14px;border:2.5px solid var(--line);display:grid;place-items:center;font-size:21px;animation:badgein .6s cubic-bezier(.2,1.6,.35,1) both;overflow:hidden;padding:0;background:var(--paper)}
.rname{font-family:var(--dis);font-weight:700;font-size:19px;letter-spacing:-.02em;line-height:1.1}
.rrole{font-family:var(--mon);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink60)}
.tally{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.tchip{font-family:var(--mon);font-size:11.5px;border:2.5px solid var(--line);border-radius:999px;padding:5px 11px;background:var(--paper)}
.tchip b{color:var(--coral)}
.verdict{display:inline-block;font-family:var(--mon);font-size:10px;letter-spacing:.12em;text-transform:uppercase;border:2.5px solid var(--line);border-radius:999px;padding:3px 11px;margin-top:8px}
.verdict.q{background:var(--green);color:#fff}
.verdict.u{background:var(--sun)}
.verdict.o{background:var(--red);color:#fff}
.fixrow{border:2.5px solid var(--line);border-radius:16px;padding:13px 15px;margin-bottom:10px;background:var(--paper)}
.fixrow .was{color:var(--coral);text-decoration:line-through;text-decoration-thickness:2px}
.fixrow .now{color:var(--moss);font-weight:700}
.fixrow p{margin:7px 0 0;font-size:13px;color:var(--ink60);line-height:1.5}
.fixrow .ctx{font-family:var(--mon);font-size:11.5px;color:var(--ink60);margin-top:6px;display:block}
.badge{display:inline-block;font-family:var(--mon);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;border:2px solid var(--line);border-radius:999px;padding:2px 8px;margin-bottom:8px}
.badge.g{background:rgba(255,122,99,.22)}
.badge.r{background:var(--sky)}
.badge.v{background:rgba(229,106,208,.22)}
.note{border-left:5px solid var(--moss);padding:10px 0 10px 15px;font-size:15.5px;line-height:1.65}
.note.warnl{border-color:var(--sun)}
.note.badl{border-color:var(--coral)}
.warnbox{background:rgba(255,122,99,.12);border:2.5px solid var(--coral);border-radius:16px;padding:14px;font-size:14px;line-height:1.6;margin-bottom:14px}
.tip{background:rgba(255,200,87,.1);border:2.5px dashed var(--line);border-radius:16px;padding:13px;font-size:13.5px;line-height:1.6}
.word{font-family:var(--dis);font-weight:900;font-size:clamp(34px,9vw,50px);letter-spacing:-.04em;line-height:1}
.pos{font-family:var(--mon);font-size:11px;color:var(--berry);letter-spacing:.14em}
.def{font-size:16px;line-height:1.6;margin:10px 0}
.bank{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.seed{font-family:var(--mon);font-size:11px;padding:6px 11px;border-radius:999px;background:var(--paper);border:2.5px solid var(--moss);color:var(--moss)}
/* group discussion */
.said{display:flex;gap:11px;padding:12px 0;border-bottom:2px dotted var(--line)}
.said:last-child{border-bottom:none}
.av{flex:0 0 40px;height:40px;border-radius:13px;border:2.5px solid var(--line);display:grid;place-items:center;font-family:var(--dis);font-weight:700;font-size:17px}
.who{font-size:12.5px;font-weight:700;margin-bottom:3px}
.line{font-size:15.5px;line-height:1.6}
.me .line{color:var(--moss);font-weight:600}
.feed{max-height:330px;overflow-y:auto;padding-right:4px}
.nowspeak{border:2.5px solid var(--line);border-radius:18px;padding:14px;background:var(--paper);margin-bottom:12px}
.turnbar{height:7px;border-radius:99px;background:#241e4d;overflow:hidden;margin-top:10px}
.turnbar i{display:block;height:100%;transition:width .12s linear}
.queue{font-family:var(--mon);font-size:11px;color:var(--ink60);margin-top:8px}
.ribbon{display:flex;height:18px;border:2.5px solid var(--line);border-radius:99px;overflow:hidden;margin:12px 0 8px}
.key{display:flex;gap:12px;flex-wrap:wrap;font-family:var(--mon);font-size:10.5px;color:var(--ink60)}
.dot{width:9px;height:9px;border-radius:3px;display:inline-block;margin-right:5px;border:1.5px solid var(--line)}
.mini{display:flex;gap:10px;overflow-x:auto;padding:4px 0;scrollbar-width:none}
.mini::-webkit-scrollbar{display:none}
.pc{flex:0 0 auto;text-align:center;width:66px}
.pc .av{width:46px;height:46px;margin:0 auto 5px;border-radius:15px;transition:.2s;opacity:.55}
.pc[data-live="1"] .av{opacity:1;transform:translateY(-3px);box-shadow:0 4px 0 #3a2f70}
.pc small{font-size:10.5px;color:var(--ink60);display:block}
.pc i{font-family:var(--mon);font-size:9px;font-style:normal;color:var(--ink60)}
/* agenda */
.agenda{display:flex;flex-direction:column;gap:0}
.aitem{display:flex;align-items:center;gap:13px;padding:13px 0;border-bottom:2px dotted var(--line);cursor:pointer;background:none;border-left:none;border-right:none;border-top:none;width:100%;text-align:left}
.aitem:last-child{border-bottom:none}
.abox{flex:0 0 30px;height:30px;border:2.5px solid var(--line);border-radius:9px;display:grid;place-items:center;font-family:var(--mon);font-size:14px;background:var(--paper)}
.aitem[data-done="1"] .abox{background:var(--moss);color:#fff}
.aitem b{font-size:15.5px;display:block}
.aitem span{font-size:12.5px;color:var(--ink60)}
.plot{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin:14px 0;padding:12px 10px 0;background:var(--paper);border:2.5px solid var(--line);border-radius:16px}
.cell{aspect-ratio:1;border:none;background:none;cursor:pointer;display:grid;place-items:end center;padding:0 0 6px;transition:transform .25s cubic-bezier(.2,1.5,.4,1)}
.cell span{font-family:var(--mon);font-size:10px;color:var(--ink60)}
.cell[data-s="today"] span{color:var(--coral);font-weight:700}
.plan{border:2.5px solid var(--line);border-radius:20px;padding:17px;flex:1 1 200px;background:var(--paper2);box-shadow:0 6px 18px rgba(0,0,0,.45)}
.plan[data-on="1"]{background:var(--sun);box-shadow:0 6px 20px rgba(157,128,255,.35)}
.plan h4{font-family:var(--dis);font-weight:700;font-size:21px;margin:3px 0 5px;letter-spacing:-.03em}
.typebox{width:100%;background:var(--paper);border:2.5px solid var(--line);border-radius:16px;color:var(--ink);font-family:var(--bod);font-size:16px;line-height:1.7;padding:13px 14px;resize:vertical;margin-top:12px}
.typebox:focus{outline:none;box-shadow:0 6px 20px rgba(157,128,255,.35)}
.spin{display:inline-block;width:14px;height:14px;border:2.5px solid #2a2352;border-top-color:var(--moss);border-radius:50%;animation:sp .7s linear infinite;vertical-align:-2px;margin-right:8px}
@keyframes sp{to{transform:rotate(360deg)}}
.petal{position:fixed;width:11px;height:11px;border-radius:60% 0 60% 0;pointer-events:none;z-index:60;animation:drift linear forwards}
@keyframes drift{to{transform:translateY(102vh) rotate(540deg);opacity:0}}
.hl-empty{background:rgba(167,159,212,.16);border-bottom:2.5px solid #a79fd4;border-radius:4px;padding:0 3px}
.hl-wordy{background:rgba(255,159,69,.16);border-bottom:2.5px solid #ff9f45;border-radius:4px;padding:0 3px}
.hl-repeat{background:rgba(157,128,255,.16);border-bottom:2.5px dashed var(--moss);border-radius:4px;padding:0 3px}
.legend{display:flex;flex-wrap:wrap;gap:10px;font-family:var(--mon);font-size:10px;color:var(--ink60);margin-top:12px}
.legend i{width:12px;height:12px;border-radius:3px;display:inline-block;margin-right:5px;vertical-align:-2px;border:1.5px solid var(--line)}
.rw{border:2.5px solid var(--line);border-radius:16px;padding:14px;margin-bottom:11px;background:var(--paper)}
.rw .lbl{font-family:var(--mon);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink60);display:block;margin-bottom:5px}
.rw .orig{display:block;font-size:14.5px;line-height:1.6;color:var(--ink60)}
.rw .tight{font-size:15.5px;line-height:1.6;font-weight:600;color:var(--moss);display:block;margin-top:8px}
.rw .cutlist{font-family:var(--mon);font-size:11px;color:var(--coral);margin-top:8px;line-height:1.7}
.rw .save{font-family:var(--mon);font-size:11px;background:var(--sun);border:2px solid var(--line);border-radius:999px;padding:2px 9px;display:inline-block;margin-top:8px}
.libitem{display:flex;gap:10px;align-items:flex-start;padding:11px 0;border-bottom:2px dotted var(--line)}
.libitem:last-child{border-bottom:none}
.libitem p{margin:0;font-size:14.5px;line-height:1.5;flex:1}
.libitem small{font-family:var(--mon);font-size:10px;color:var(--ink60);display:block;margin-top:3px}
.x{border:2px solid var(--line);background:var(--paper);border-radius:8px;width:28px;height:28px;flex:0 0 28px;cursor:pointer;font-size:14px;line-height:1;padding:0}
.x:hover{background:var(--coral);color:#fff}
.seg{display:flex;gap:6px;margin-bottom:14px}
.seg button{flex:1;border:2.5px solid var(--line);background:var(--paper2);border-radius:12px;padding:8px;font-size:13px;font-weight:600;cursor:pointer}
.seg button[data-on="1"]{background:var(--ink);color:var(--paper)}
.gddial{display:flex;gap:8px;flex-wrap:wrap}
.gddial>div{flex:1 1 76px;border:2.5px solid var(--line);border-radius:14px;padding:10px 5px;text-align:center;background:var(--paper);transition:transform .25s cubic-bezier(.2,1.3,.4,1)}
.gddial b{display:block;font-family:var(--dis);font-weight:700;font-size:23px;line-height:1}
.gddial span{font-family:var(--mon);font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink60)}
.plantwrap{display:flex;align-items:flex-end;justify-content:center;gap:14px;padding:6px 0 2px}
.stagelbl{font-family:var(--dis);font-weight:700;font-size:20px;letter-spacing:-.02em}
/* ---------- 3D: everything sits on a surface and can be pressed ---------- */
@keyframes cardin{from{opacity:0;transform:translateY(22px) rotateX(-7deg) scale(.97)}}
.card:hover{transform:translateY(-2px)}
/* chunky extruded buttons — real depth, real travel */
.btn.go:hover:not(:disabled){box-shadow:0 7px 0 #8a3a2c,0 13px 22px rgba(255,122,99,.35)}
.btn.go:active:not(:disabled){box-shadow:0 1px 0 #8a3a2c}
.btn.leaf:active:not(:disabled){box-shadow:0 1px 0 #4a35a8}
.btn.gold:active:not(:disabled){box-shadow:0 1px 0 #a37a1d}
.btn.sm:active:not(:disabled){transform:translateY(3px);box-shadow:0 1px 0 #3a2f70}
/* chips wobble when you grab them */
.chip:hover{transform:translateY(-2px) rotate(-1.5deg)}
.chip:active{transform:scale(.94)}
/* tabs pop forward when active */
.tab:active{transform:scale(.94)}
/* the big score lands with a thump and rings out */
@keyframes thump{0%{opacity:0;transform:scale(.4) rotate(-8deg)}60%{transform:scale(1.12) rotate(2deg)}100%{opacity:1;transform:none}}
.popring{position:relative}
.popring::before{content:"";position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;border:3px solid var(--sun);animation:ringpop 1s .25s cubic-bezier(.2,.8,.2,1) both}
@keyframes ringpop{to{width:230px;height:230px;margin:-115px 0 0 -115px;opacity:0;border-width:1px}}
/* dials tilt in like cards on a table */
.dial:hover{transform:translateY(-3px) rotateX(8deg) scale(1.03)}
.gddial>div:hover{transform:translateY(-3px) scale(1.04)}
/* stickers sit slightly askew, like they were stuck on */
.card:hover .tag{transform:rotate(-2deg) scale(1.06)}
/* role badges bounce on arrival */
@keyframes badgein{from{opacity:0;transform:scale(.4) rotate(-20deg)}}
/* the plant sways */
.mark svg,.pot svg{animation:sway 4.5s ease-in-out infinite;transform-origin:bottom center}
@keyframes sway{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
/* VOCABULARY: a card you actually flip over */
.flip{perspective:1100px;cursor:pointer}
.flip-in{position:relative;min-height:158px;transform-style:preserve-3d;transition:transform .66s cubic-bezier(.3,1.05,.35,1)}
.flip[data-flip="1"] .flip-in{transform:rotateY(180deg)}
/* BOTH faces must hide their back, or the reverse side shows through mirrored */
.flip-face,.flip-back{backface-visibility:hidden;-webkit-backface-visibility:hidden}
.flip-back{position:absolute;inset:0;transform:rotateY(180deg);-webkit-transform:rotateY(180deg);display:flex;flex-direction:column;justify-content:center;overflow:auto;opacity:0;transition:opacity .18s .3s}
/* belt and braces: if a browser ignores backface-visibility, opacity still hides it */
.flip-face{transform:rotateY(0deg);-webkit-transform:rotateY(0deg);opacity:1;transition:opacity .18s .3s}
.flip[data-flip="1"] .flip-face{opacity:0}
.flip[data-flip="1"] .flip-back{opacity:1}
.flip-hint{font-family:var(--mon);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink60);margin-top:14px;display:flex;align-items:center;gap:6px}
.flip-hint i{display:inline-block;animation:nudge 1.8s ease-in-out infinite;font-style:normal}
@keyframes nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}
/* tab content arrives with a little lift */
.panel{animation:panelin .42s cubic-bezier(.22,1.1,.36,1) both}
@keyframes panelin{from{opacity:0;transform:translateY(14px) scale(.99)}}
/* headline words drop in */
.seed,.tchip,.ftag{transition:transform .2s cubic-bezier(.2,1.5,.4,1)}
.seed:hover,.tchip:hover{transform:translateY(-2px) rotate(-2deg) scale(1.06)}
/* progress vines get a shimmer */
.vine i::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);animation:shimmer 1.9s linear infinite}
@keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(200%)}}
/* grass sways while it listens */
.grass:hover .blade{animation:bladewave 1.4s ease-in-out infinite}
@keyframes bladewave{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
.cell:hover{transform:translateY(-4px) scale(1.1)}
.onb .masc{filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))}
.av,.iv-av,.pc .av{background:var(--paper);padding:0;overflow:hidden;position:relative;display:grid;place-items:center}
.av .masc,.pc .av .masc,.iv-av .masc{width:100%;height:100%;object-fit:cover;transform:scale(1.08)}
.avtint{position:absolute;inset:0;opacity:.24;z-index:0}
.av .masc,.iv-av .masc{position:relative;z-index:1}
.rbadge .masc{width:100%;height:100%;object-fit:cover;transform:scale(1.1)}
.said .av{width:46px;height:46px;flex:0 0 46px;border-radius:15px}
.wordmark{height:26px;width:auto;display:block;filter:drop-shadow(0 2px 8px rgba(157,128,255,.35))}
.wordmark-text{font-family:var(--dis);font-weight:800;font-size:25px;line-height:1;letter-spacing:-.03em;color:var(--ink);filter:drop-shadow(0 2px 8px rgba(157,128,255,.35))}
.wordmark-text i{font-style:normal;color:var(--moss)}
.mark{font-family:var(--dis);letter-spacing:-.03em;font-weight:700;font-size:25px;line-height:1;display:flex;align-items:center;gap:10px}
.tagline{font-family:var(--mon);font-size:8.5px;letter-spacing:.28em;text-transform:uppercase;color:var(--ink60);margin-top:3px}
.brandwrap{display:flex;flex-direction:column}
/* the dark ground wants a little atmosphere behind everything */
.grdn::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(900px 460px at 10% -6%,rgba(157,128,255,.16),transparent 60%),
             radial-gradient(700px 420px at 92% 8%,rgba(229,106,208,.10),transparent 62%),
             radial-gradient(700px 500px at 50% 106%,rgba(86,200,245,.08),transparent 60%)}
.masc{filter:drop-shadow(0 8px 20px rgba(0,0,0,.55));display:block;image-rendering:auto;user-select:none;-webkit-user-drag:none}
.masc-bob{animation:bob 3.2s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-6px) rotate(1.5deg)}}
.masc-pop{animation:mascpop .6s cubic-bezier(.2,1.6,.35,1) both}
@keyframes mascpop{from{opacity:0;transform:scale(.4) rotate(-14deg)}}
.masc-peek{animation:peek .8s cubic-bezier(.2,1.4,.35,1) both}
@keyframes peek{from{opacity:0;transform:translateY(28px)}}
.mascrow{display:flex;align-items:center;gap:14px}
.onb .mascrow .bubble{background:rgba(242,247,234,.06);border-color:rgba(242,247,234,.22);color:inherit}
.onb .mascrow .bubble::before{background:#141032;border-color:rgba(242,247,234,.22)}
.mascrow .bubble{flex:1;background:var(--paper);border:2.5px solid var(--line);border-radius:18px;padding:12px 15px;font-size:15px;line-height:1.55;position:relative}
.mascrow .bubble::before{content:"";position:absolute;left:-9px;top:22px;width:14px;height:14px;background:var(--paper);border-left:2.5px solid var(--line);border-bottom:2.5px solid var(--line);transform:rotate(45deg)}
.mark .masc{margin-right:2px}
.pot .masc{margin:0}
.emptystate{text-align:center;padding:10px 0 4px}
.emptystate .masc{margin:0 auto 10px}
@media (prefers-reduced-motion:reduce){.grdn *{animation:none!important;transition:none!important}}`;
/* ------------------------------- CONTENT --------------------------------- */

const SLOTS = [
  { id: 60, label: "1 min", name: "Table Topic", green: 30, amber: 45, red: 60, blurb: "Classic Table Topics. Answer, don't ramble." },
  { id: 90, label: "90 sec", name: "Extended topic", green: 45, amber: 65, red: 90, blurb: "Room for a reason and an example." },
  { id: 120, label: "2 min", name: "Opinion piece", green: 60, amber: 90, red: 120, blurb: "Take a side and defend it properly." },
  { id: 300, label: "5 min", name: "Prepared speech", green: 240, amber: 270, red: 300, blurb: "Full speech shape: open, body, close." },
];

const TOPICS = {
  "Table Topics": [
    "The best advice you completely ignored.",
    "Something you changed your mind about this year.",
    "A rule at home you never understood.",
    "The last time you were genuinely nervous.",
    "What your hometown gets wrong about itself.",
    "A skill you'd bring back if you could.",
    "The most useless thing you're excellent at.",
    "Describe your week as a weather report.",
    "Something everyone praises that you find overrated.",
    "The compliment you never know how to accept.",
    "A small thing that ruins your day.",
    "What you'd put on a billboard outside your college.",
    "The subject you'd make compulsory for everyone.",
    "A time being wrong worked out well.",
    "What you're saving for and why.",
  ],
  "Placement & GD": [
    "Reservation in the private sector — a correction, or a step backwards?",
    "AI will destroy more Indian jobs than it creates.",
    "Coaching culture has replaced actual education.",
    "Moonlighting is theft, not freedom.",
    "Work from home made juniors worse at their jobs.",
    "Should engineering seats be cut rather than expanded?",
    "Startups have made failure fashionable and that's dangerous.",
    "English fluency is unfairly used as a proxy for intelligence.",
    "Campus placements reward the wrong things.",
    "A four-day work week would work in India.",
    "Internships should be paid by law.",
    "Reskilling is the employee's problem, not the employer's.",
    "Should India cap working hours in the tech industry?",
    "Degrees will matter less than portfolios in ten years.",
    "Group discussions are a poor way to judge a candidate.",
  ],
  "Tech & AI": [
    "Quick commerce is burning cash for a habit nobody asked for.",
    "Social media should require age verification.",
    "Gig platforms owe their riders employee status.",
    "Your phone knows you better than your closest friend.",
    "India should build its own models rather than licence them.",
    "Data localisation protects citizens more than it slows startups.",
    "Algorithms should be auditable by law.",
    "UPI succeeded because it was boring, not because it was clever.",
    "Screen time limits should be set by parents, not platforms.",
    "Open source is the only sustainable way to build AI.",
    "Electric vehicles are a city solution sold as a national one.",
    "Facial recognition has no place in public policing.",
  ],
  "Society & policy": [
    "Voting should be compulsory in India.",
    "Free electricity is welfare, not vote-buying.",
    "The three-language formula is fair to every state.",
    "Cities should charge for private car use in centres.",
    "Cash transfers beat subsidised goods.",
    "Sports deserve public funding as much as science does.",
    "Public transport should be free for students.",
    "Air pollution is a health emergency we've normalised.",
    "Regional cinema is telling better stories than Bollywood.",
    "Marriage as an institution needs redesigning, not defending.",
    "Migration to metros is a failure of small towns.",
    "Should India have a nationwide rental law?",
  ],
  "Hot takes": [
    "Group projects taught you more about people than about the subject.",
    "Being busy has become a personality.",
    "Streaming killed the album.",
    "Nobody reads the terms and conditions, and that's fine.",
    "The best thing about your generation is also the worst thing about it.",
    "Politeness online is dead and nobody misses it.",
    "Nostalgia is a marketing strategy now.",
    "Productivity advice is mostly a way to avoid working.",
    "Reality shows are more honest than the news.",
    "Cricket has too much cricket.",
    "Every festival has become a shopping event.",
    "Sarcasm is a poor substitute for an argument.",
  ],
  "Interview classics": [
    "Tell me about yourself in sixty seconds.",
    "Why should we hire you over someone with more experience?",
    "Describe a time you disagreed with a teammate.",
    "What's a decision you regret and what did you learn?",
    "Where do you want to be in five years, honestly?",
    "Sell me something on this table.",
    "What would your last manager say is your weakness?",
    "Explain what you studied to someone from another field.",
    "A time you failed and what you did next.",
    "Why this company and not the one next door?",
  ],
};

const VOCAB = [
  { w: "Ostensible", p: "adjective", d: "Given as the reason, but probably not the real one.", e: "The ostensible reason was scale; the real one was talent." },
  { w: "Untenable", p: "adjective", d: "Impossible to defend or keep going.", e: "Holding both positions at once is untenable." },
  { w: "Precedent", p: "noun", d: "An earlier case used as the rule for later ones.", e: "That judgment set the precedent everyone cites now." },
  { w: "Mitigate", p: "verb", d: "To make something bad less severe.", e: "Insurance mitigates the loss; it doesn't prevent it." },
  { w: "Contingent", p: "adjective", d: "Depending on something else happening first.", e: "Funding is contingent on the pilot clearing 60% retention." },
  { w: "Salient", p: "adjective", d: "The part that matters most.", e: "The salient point is cost, not speed." },
  { w: "Corroborate", p: "verb", d: "To back a claim with more evidence.", e: "Two other surveys corroborate that number." },
  { w: "Extrapolate", p: "verb", d: "To stretch a known trend into unknown territory.", e: "You can't extrapolate a decade from one quarter." },
  { w: "Nominal", p: "adjective", d: "In name only, or very small in amount.", e: "The fee is nominal — ten rupees a month." },
  { w: "Prudent", p: "adjective", d: "Careful and sensible about what comes next.", e: "It would be prudent to hold six months of runway." },
  { w: "Tangible", p: "adjective", d: "Real enough to point at or measure.", e: "Give me one tangible outcome from that policy." },
  { w: "Arbitrary", p: "adjective", d: "Chosen with no real reason behind it.", e: "The cut-off is arbitrary — why 75 and not 70?" },
  { w: "Incremental", p: "adjective", d: "Happening in small steps rather than one leap.", e: "The gains are incremental, but they compound." },
  { w: "Disproportionate", p: "adjective", d: "Far bigger or smaller than it should be.", e: "The penalty is disproportionate to the mistake." },
  { w: "Sustainable", p: "adjective", d: "Able to keep going without breaking down.", e: "Discounting isn't a sustainable way to hold a market." },
  { w: "Nuance", p: "noun", d: "A small difference that changes the meaning.", e: "You lose the nuance when you make it a yes-or-no question." },
];

const ROLES = [
  { id: "timer", icon: "timer", name: "The Timer", role: "keeps you honest" },
  { id: "ah", icon: "hand", name: "Ah-Counter", role: "tallies the ums" },
  { id: "gram", icon: "book", name: "Grammarian", role: "catches the slips" },
  { id: "eval", icon: "cap", name: "General Evaluator", role: "the whole picture" },
];

const PANEL = [
  { id: "kavya", name: "Kavya", color: "#ff7a63", mood: "focused", role: "Steamroller", brief: "Interrupts, talks long, hates hearing a point twice.", weight: 1.5 },
  { id: "arjun", name: "Arjun", color: "#ffc857", mood: "thinking", role: "Stat machine", brief: "Quotes numbers and asks you for your denominator.", weight: 1.1 },
  { id: "meera", name: "Meera", color: "#e56ad0", mood: "excited", role: "Tangent", brief: "Pulls the topic sideways to culture and anecdotes.", weight: 1.0 },
  { id: "rohit", name: "Rohit", color: "#56c8f5", mood: "encouraging", role: "Closer", brief: "Quiet, then summarises better than everyone.", weight: 0.7 },
];

const BACKUP = {
  kavya: [
    "Let me start, because I think the framing of this question is off. We keep arguing about the outcome when the real problem sits much earlier in the pipeline.",
    "No, let me finish that point. If we only look at the visible cost we'll miss the part that actually hurts people.",
    "That's more or less what I said two minutes ago, just with different words. Can we move it forward?",
    "I'd push back hard on that. It sounds clean in a discussion but it doesn't survive contact with how things actually run.",
    "Fine, I'll concede that much. But the burden is still on you to explain who pays for it.",
  ],
  arjun: [
    "The 2024 figure I remember is somewhere around thirty-four percent, so the base rate matters a lot before we call this a crisis.",
    "If you look at the growth rate rather than the absolute number, it's been almost flat for six years. That changes the argument.",
    "I'd want to know the denominator before accepting that. A big number without a base is just a big number.",
    "Roughly one point two lakh crore, if I'm remembering the budget line correctly. Someone check me on that.",
    "Numbers aside, I don't think anyone here disputes the direction. We're arguing about the speed.",
  ],
  meera: [
    "This is basically what happened around demonetisation — everybody focused on the announcement and nobody tracked what happened eighteen months later.",
    "Isn't the deeper issue really education though? We keep treating this as an economics question.",
    "Can I bring in a global angle here — the Scandinavian countries handle this completely differently and it's worth asking why.",
    "I think we're missing the cultural dimension entirely. Policy doesn't land in a vacuum.",
    "Slightly tangential, but my cousin works in exactly this sector and what he describes is nothing like what we're discussing.",
  ],
  rohit: [
    "Quick summary of where we are: we're split on cost versus access, and nobody has bridged the two yet.",
    "Nobody has said who actually bears the downside here. That seems like the question worth answering.",
    "I agree with the second half of that, not the first. The evidence supports the outcome, not the mechanism.",
    "Let's put a number on 'soon' before we argue about whether it's realistic.",
    "That's fair, I'll withdraw my earlier point. It doesn't hold given what Arjun just said.",
  ],
};

const MODERATOR = [
  "Let's bring in someone who hasn't spoken yet. Over to you.",
  "You've been quiet — what's your read on this?",
  "Before we move on, let's hear the other side of the table.",
  "Good. Now let's hear from you on this.",
];

const PLANS = [
  { id: 7, name: "Warm-up", tag: "starter", fee: 199, back: 15, blurb: "One meeting a day. Enough to kill the silence habit." },
  { id: 14, name: "Placement sprint", tag: "most picked", fee: 349, back: 20, blurb: "Six solo days, a full group discussion every seventh." },
  { id: 30, name: "Full season", tag: "for finals", fee: 599, back: 22, blurb: "Rotating formats, harder panels, a weekly report card." },
];
const COMMON = new Set(("the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were has had did been being am does says great little own under last long very still might must made find here thing world tell ask try need feel become leave put mean keep let begin seem help talk turn start show hear play run move live believe bring happen write sit stand lose pay meet include continue set learn change lead understand watch follow stop create speak read allow add spend grow open walk win offer remember love consider appear buy wait serve die send expect build stay fall cut reach remain suggest raise pass sell require report decide pull yes okay ok maybe really actually basically money job college student india indian company value point issue problem answer question example reason result system data more many much less fewer better best worse worst always never often sometimes today tomorrow yesterday everyone someone nobody everything something nothing").split(" "));


/* The everyday vocabulary an Indian undergraduate already owns. Using these
   well is fine — but it isn't vocabulary *reach*, so they don't score as range. */
const BASIC = new Set((
"about above across after again against all almost alone along already also always among angry animal answer any anybody anyone anything anyway anywhere apart appear apple area argue arm around arrive ask attack aunt away baby back bad bag ball bank basic beat beautiful because become bed before begin behind believe below best better between big bird birthday bit black blood blue board boat body book bored born borrow both bottle bottom bought box boy bread break breakfast bring brother brought brown build building burn bus business busy but buy call came camera can cannot car card care careful carry case catch cause centre certain chair chance change cheap check child children choose church city class clean clear climb clock close clothes cloud coffee cold college colour come comfortable common company complete computer condition control cook cool copy corner correct cost could country couple course cover crazy create cross cry cup cut dance danger dark date daughter day dead deal dear decide deep depend describe desk detail did die difference different difficult dinner direction dirty discuss do doctor dog done door double doubt down draw dream dress drink drive drop dry during each ear early earth easy eat egg eight either else empty end enjoy enough enter equal especially even evening ever every everybody everyone everything everywhere exact example except excited expect experience explain eye face fact fail fall family famous far fast father fear feel feet few field fight fill film final find fine finger finish fire first fish five fix floor flower fly follow food foot for force forget form found four free fresh friend from front fruit full fun funny future game garden gave general get gift girl give glad glass go god gold gone good got grade great green ground group grow guess guy had hair half hand happen happy hard has hat hate have head health hear heart heavy help her here hers high hill him himself his hit hold hole holiday home honest honestly hope hospital hot hotel hour house how however huge human hundred hungry hurry hurt idea if ill imagine important improve in inside instead interest into introduce it its itself job join joke journey just keep key kid kill kind king kitchen knew know lady land language large last late later laugh law lead learn leave left leg less lesson let letter level library lie life light like line list listen little live local long look lose lost lot loud love low luck lunch machine made magazine main make man many map market marry match matter may maybe me meal mean meat medicine meet member memory men message met middle might mile milk mind mine minute miss mistake mix modern moment money month moon more morning most mother mountain mouth move movie much music must my myself name near nearly necessary need neighbour neither never new news next nice night nine no nobody noise none nor normal north nose not note nothing notice now number obviously ocean of off offer office often oil okay old on once one only open opinion or orange order other our out outside over own page paint pair paper parent park part party pass past pay peace pen pencil people perfect perhaps period person phone photo pick picture piece place plan plant play please pocket point police poor popular position possible post pot power practice prepare present press pretty price print probably problem process produce program promise proper properly protect proud public pull purpose push put quarter question quick quiet quite radio rain raise rather reach read ready real realise really reason receive recent record red remember remove repeat reply report rest result return rich ride right ring rise river road rock room round rule run sad safe said sale same sat save saw say school science sea season seat second see seem sell send sense sentence separate serious serve service set seven several shall shape share sharp she ship shoe shop short should shoulder shout show shut sick side sign silent silver similar simple since sing single sir sister sit six size skill skin sky sleep slow small smell smile smoke snow so soft some somebody somehow someone something sometimes somewhere son song soon sorry sort sound soup south space speak special speed spell spend sport spring stand star start state station stay step stick still stone stop store story straight strange street strong student study stuff stupid subject succeed such sudden suddenly sugar suggest summer sun supper suppose sure surprise sweet swim table take talk tall taste teach teacher team tell ten test than thank that the their them themselves then there these they thick thin thing think third this those though thought three through throw thus ticket tie time tired to today together told tomorrow tonight too took top total touch toward town train travel tree trip trouble true trust try turn twice two type ugly uncle under understand until up upon us use useful usual usually very village visit voice wait wake walk wall want war warm was wash watch water way we wear weather week weight welcome well went were west wet what when where whether which while white who whole whom whose why wide wife will win wind window wine winter wish with within without woman women wonder wood word work world worry worse worst would write wrong year yellow yes yesterday yet you young your yourself"
).split(" "));

/* Suffixes that mark the register a panel notices. */
const ACADEMIC = /(tion|sion|ment|ity|ance|ence|ive|ous|ate|ise|ize|able|ible|ism|ist|logy|graphy|cracy|ary|ory)$/;

const HEDGES = ["kind of", "sort of", "i guess", "i suppose", "maybe", "i think", "probably", "perhaps", "somewhat", "a bit", "a little bit", "i feel like", "or something", "i mean"];
const HARD_FILLERS = ["um", "uh", "erm", "uhh", "umm", "hmm", "er", "ah", "you know", "matlab"];
const SOFT_FILLERS = ["like", "actually", "basically", "literally", "so", "well", "right", "okay", "yeah", "just", "na"];
// the actual non-lexical sounds the Ah-Counter role is named for — everything
// else findFillers tags "filler" (you know, matlab, like, so...) is a crutch
// word, not a hesitation sound, and gets shown as its own group
const AH_SOUNDS = new Set(["um", "umm", "uh", "uhh", "erm", "er", "hmm", "ah"]);

const STANCE = ["i think", "i believe", "in my view", "in my opinion", "i'd argue", "i would argue", "my view is", "i disagree", "i agree", "the answer is", "yes", "no", "personally"];
const CONNECT = ["because", "however", "although", "whereas", "therefore", "for example", "for instance", "on the other hand", "that said", "but", "which means", "as a result", "in contrast", "firstly", "secondly", "moreover"];
const CLOSERS = ["so overall", "to conclude", "in conclusion", "that's why", "in short", "so my point is", "to sum up", "ultimately", "so the answer", "which is why"];

/* -- word sanity -------------------------------------------------------- */

/* Declared before the multilingual layer so the engine can use it; the layer
   itself sits further down with the Sarvam calls. */
/* The language the user said they speak. Read by every analysis call so the
   engine never has to guess when the user has already told us. */
function spokenLangCode() {
  try {
    const raw = window.localStorage.getItem("yap:micLang");
    return raw ? String(JSON.parse(raw)) : "auto";
  } catch (e) { return "auto"; }
}

const INDIC_RANGE = /[\u0900-\u0DFF]/;

/* A token counts as real if it's English *or* written in an Indian script *or*
   a romanised Indic word people actually use. Before this, "बिल्कुल" and
   "bilkul" were both scored as invented words. */
function isRealWord(w) {
  if (INDIC_RANGE.test(w)) return true;
  if (typeof ROMAN_INDIC !== "undefined" && ROMAN_INDIC.has(w)) return true;
  return looksEnglish(w);
}

function looksEnglish(w) {
  if (COMMON.has(w)) return true;
  if (w.length <= 2) return true;
  if (!/[aeiouy]/.test(w)) return false;
  if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(w)) return false;
  if ((w.match(/[aeiouy]/g) || []).length / w.length < 0.18) return false;
  if (/(.)\1\1/.test(w)) return false;
  return true;
}

/* Was [a-z'] only, which silently deleted every Indic word before counting.
   Word counts, WPM and variety were therefore all wrong for those speakers. */
/* \p{L} alone splits Devanagari at its matras, which are combining marks, so
   a word like "बिल्कुल" would count as three. \p{M} keeps them attached. */
const words0 = (t) => (t.toLowerCase().match(/[\p{L}\p{M}']+/gu) || []);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* -- context-aware filler detection ------------------------------------- */
/* "I like this" is not a filler. "it's, like, hard" is. The old version
   counted both, which is why the numbers were wrong. */

const LIKE_VERB_BEFORE = new Set(["i", "we", "you", "they", "he", "she", "it", "people", "everyone", "really", "would", "do", "does", "did", "don't", "doesn't", "didn't", "much", "not", "also", "students"]);
const LIKE_NOUNISH_AFTER = new Set(["this", "that", "it", "them", "him", "her", "us", "me", "you", "to", "a", "an", "the", "my", "your", "our", "their", "his", "any", "some", "what", "how"]);

function findFillers(text, lang) {
  const toks = words0(text);
  // a speaker's crutch words are in their own language: "matlab" is "like"
  const extra = (typeof FILLERS_BY_LANG !== "undefined" && lang && FILLERS_BY_LANG[lang])
    ? FILLERS_BY_LANG[lang]
    : (typeof ALL_INDIC_FILLERS !== "undefined" ? ALL_INDIC_FILLERS : []);
  // words that are only a filler when they're part of a hesitation cluster —
  // see the comment on AMBIGUOUS_FILLERS_BY_LANG for why these can't be
  // matched unconditionally the way "matlab" or "arre" can.
  const ambiguous = (typeof AMBIGUOUS_FILLERS_BY_LANG !== "undefined" && lang && AMBIGUOUS_FILLERS_BY_LANG[lang])
    ? AMBIGUOUS_FILLERS_BY_LANG[lang]
    : (typeof ALL_AMBIGUOUS_INDIC !== "undefined" ? ALL_AMBIGUOUS_INDIC : []);
  const isFillerish = (x) => !!x && (HARD_FILLERS.includes(x) || extra.includes(x) || ambiguous.includes(x) || SOFT_FILLERS.includes(x));
  const found = [];

  const add = (kind, phrase, i, len) => {
    const from = Math.max(0, i - 3), to = Math.min(toks.length, i + len + 3);
    found.push({ kind, phrase, index: i, context: toks.slice(from, to).join(" ") });
  };

  // multi-word phrases first
  const multi = [
    ...HARD_FILLERS.filter((f) => f.includes(" ")).map((f) => ({ f, kind: "filler" })),
    ...extra.filter((f) => f.includes(" ")).map((f) => ({ f, kind: "filler" })),
    ...HEDGES.map((f) => ({ f, kind: "hedge" })),
  ];
  const taken = new Set();
  multi.forEach(({ f, kind }) => {
    const parts = f.split(" ");
    for (let i = 0; i + parts.length <= toks.length; i++) {
      if (parts.every((p, k) => toks[i + k] === p) && !taken.has(i)) {
        for (let k = 0; k < parts.length; k++) taken.add(i + k);
        add(kind, f, i, parts.length);
      }
    }
  });

  toks.forEach((w, i) => {
    if (taken.has(i)) return;
    const prev = toks[i - 1], next = toks[i + 1];

    // "toh" also chains an "agar" ("if") clause as a real conjunction —
    // "agar tum aaoge toh main khush hounga" isn't hesitation, it's grammar.
    if (w === "toh" && lang === "hi-IN") {
      const back = toks.slice(Math.max(0, i - 12), i);
      if (back.some((t) => t === "agar" || t === "yadi" || t === "अगर" || t === "यदि")) return;
      add("filler", w, i, 1); return;
    }

    if (HARD_FILLERS.includes(w) || extra.includes(w)) { add("filler", w, i, 1); return; }

    // an ambiguous particle ("accha" = good/I-see, "haan" = yes, "sari" = okay)
    // only counts once it's next to another filler-type word — the shape of an
    // actual hesitation cluster, not a sentence that happens to use the word.
    if (ambiguous.includes(w)) {
      if (isFillerish(prev) || isFillerish(next)) { add("filler", w, i, 1); }
      return;
    }

    if (!SOFT_FILLERS.includes(w)) return;

    // Each soft word is only a filler in the right position.
    if (w === "like") {
      if (prev && LIKE_VERB_BEFORE.has(prev)) return;       // "people like this"
      if (next && LIKE_NOUNISH_AFTER.has(next)) return;      // "like a wolf", "like this"
      add("filler", "like", i, 1); return;
    }
    if (w === "so" || w === "well" || w === "okay" || w === "yeah") {
      if (i === 0) { add("filler", w, i, 1); return; }        // sentence-opening crutch
      if (w === "so" && next && ["i", "we", "the", "that", "it", "you"].includes(next) && i > 0) {
        add("filler", "so", i, 1); return;                   // "so I think... so we..."
      }
      return;
    }
    if (w === "right" || w === "na") {
      if (!next) { add("filler", w, i, 1); return; }          // tag question at the end
      return;
    }
    if (w === "just") {
      if (next && ["a", "the", "one", "want", "wanted", "think"].includes(next)) { add("hedge", "just", i, 1); }
      return;
    }
    // actually / basically / literally are crutches wherever they land
    add("crutch", w, i, 1);
  });

  return found.sort((a, b) => a.index - b.index);
}

/* -- grammar rules: run locally, no API needed -------------------------- */

const RULES = [
  { re: /\bdiscuss(ed|ing)?\s+about\b/gi, fix: (m) => m.replace(/\s+about\b/i, ""), why: "“Discuss” already means talk about.", kind: "grammar" },
  { re: /\brevert\s+back\b/gi, fix: () => "revert", why: "“Revert” already means go back.", kind: "grammar" },
  { re: /\breturn\s+back\b/gi, fix: () => "return", why: "“Back” is doing no work here.", kind: "grammar" },
  { re: /\brepeat\s+again\b/gi, fix: () => "repeat", why: "Repeating is already doing it again.", kind: "grammar" },
  { re: /\bcope\s+up\s+with\b/gi, fix: () => "cope with", why: "It's “cope with”, no “up”.", kind: "grammar" },
  { re: /\bgood\s+in\s+(?=[a-z])/gi, fix: () => "good at ", why: "You're good *at* something.", kind: "grammar" },
  { re: /\bmarried\s+with\b/gi, fix: () => "married to", why: "Married *to* a person.", kind: "grammar" },
  { re: /\b(informations|advices|equipments|furnitures|feedbacks|softwares|luggages)\b/gi, fix: (m) => m.slice(0, -1), why: "This noun has no plural form.", kind: "grammar" },
  { re: /\b(peoples|childrens|womens|mens)\b/gi, fix: (m) => m.slice(0, -1), why: "Already plural.", kind: "grammar" },
  { re: /\bmore\s+(better|worse|easier|faster|higher|lower|bigger)\b/gi, fix: (m) => m.replace(/more\s+/i, ""), why: "Don't stack two comparatives.", kind: "grammar" },
  { re: /\bmost\s+(easiest|best|worst|biggest|highest)\b/gi, fix: (m) => m.replace(/most\s+/i, "the "), why: "Already a superlative.", kind: "grammar" },
  { re: /\b(didn't|doesn't|don't|did\s+not)\s+(went|came|took|gave|made|said|got|saw|knew|thought)\b/gi, fix: (m) => m.replace(/(went|came|took|gave|made|said|got|saw|knew|thought)$/i, (v) => ({ went: "go", came: "come", took: "take", gave: "give", made: "make", said: "say", got: "get", saw: "see", knew: "know", thought: "think" }[v.toLowerCase()])), why: "After “didn't”, use the base verb.", kind: "grammar" },
  { re: /\b(he|she|it)\s+don't\b/gi, fix: (m) => m.replace(/don't/i, "doesn't"), why: "He/she/it takes “doesn't”.", kind: "grammar" },
  { re: /\b(they|we|you)\s+was\b/gi, fix: (m) => m.replace(/was/i, "were"), why: "Plural subject takes “were”.", kind: "grammar" },
  { re: /\bthere\s+is\s+(many|several|lots\s+of|a\s+lot\s+of|two|three|four|five)\b/gi, fix: (m) => m.replace(/there\s+is/i, "there are"), why: "Plural subject needs “there are”.", kind: "grammar" },
  { re: /\bsince\s+(\d+|two|three|four|five|ten)\s+(years|months|days|hours)\b/gi, fix: (m) => m.replace(/since/i, "for"), why: "“Since” takes a point in time, “for” takes a duration.", kind: "grammar" },
  { re: /\bmyself\s+[A-Z][a-z]+/g, fix: (m) => "I'm " + m.split(/\s+/)[1], why: "Introduce yourself with “I'm”.", kind: "grammar" },
  { re: /\bless\s+(people|students|jobs|companies|opportunities|options)\b/gi, fix: (m) => m.replace(/less/i, "fewer"), why: "“Fewer” for things you can count.", kind: "grammar" },
  { re: /\bdifferent\s+than\b/gi, fix: () => "different from", why: "“Different from” is the safe form.", kind: "grammar" },
  { re: /\b(could|would|should)\s+of\b/gi, fix: (m) => m.replace(/of/i, "have"), why: "It's “have”, not “of”.", kind: "grammar" },
  { re: /\bthe\s+reason\s+is\s+because\b/gi, fix: () => "the reason is that", why: "“Reason” and “because” repeat each other.", kind: "grammar" },
  { re: /\bbetween\s+you\s+and\s+I\b/gi, fix: () => "between you and me", why: "After a preposition, use “me”.", kind: "grammar" },
  { re: /\bvery\s+(unique|perfect|essential)\b/gi, fix: (m) => m.replace(/very\s+/i, ""), why: "It's absolute — no degrees of it.", kind: "grammar" },
  { re: /\banyways\b/gi, fix: () => "anyway", why: "“Anyways” isn't standard in an interview.", kind: "grammar" },
  { re: /\birregardless\b/gi, fix: () => "regardless", why: "Not a word.", kind: "grammar" },
  { re: /\ba\s+(?=[aeiou][a-z]{2,})/gi, fix: () => "an ", why: "Use “an” before a vowel sound.", kind: "grammar" },
  { re: /\ban\s+(?=[bcdfgjklmnpqrstvwxyz][a-z]{2,})/gi, fix: () => "a ", why: "Use “a” before a consonant sound.", kind: "grammar" },
  { re: /\beach\s+of\s+(them|us|the\s+\w+)\s+are\b/gi, fix: (m) => m.replace(/are$/i, "is"), why: "“Each” is singular.", kind: "grammar" },
  { re: /\bone\s+of\s+the\s+(reason|way|thing|problem|factor|issue|point)\b/gi, fix: (m) => m + "s", why: "“One of the…” needs a plural.", kind: "grammar" },
  { re: /\bmuch\s+(people|students|jobs|companies|things|problems)\b/gi, fix: (m) => m.replace(/much/i, "many"), why: "“Many” for countable things.", kind: "grammar" },
  // --- subject-verb agreement ---
  { re: /\b(he|she|it)\s+(go|come|want|need|make|take|think|know|say|work|feel|look|seem|give|get|have)\b(?!\s+to\s+be)/gi, fix: (m) => { const p = m.split(/\s+/); const v = p[1].toLowerCase(); const irr = { have: "has", go: "goes", do: "does" }; return p[0] + " " + (irr[v] || v + "s"); }, why: "He/she/it takes the -s form.", kind: "grammar" },
  { re: /\b(i|we|they|you)\s+(goes|comes|wants|needs|makes|takes|thinks|knows|says|works|has)\b/gi, fix: (m) => { const p = m.split(/\s+/); const v = p[1].toLowerCase(); return p[0] + " " + (v === "has" ? "have" : v.replace(/s$/, "")); }, why: "Plural subject drops the -s.", kind: "grammar" },
  { re: /\b(everyone|everybody|nobody|somebody|someone|each)\s+(are|were|have)\b/gi, fix: (m) => m.replace(/are|were|have/i, (v) => ({ are: "is", were: "was", have: "has" }[v.toLowerCase()])), why: "These are singular.", kind: "grammar" },
  { re: /\bthere\s+was\s+(many|several|lots\s+of|a\s+lot\s+of|two|three|four|five)\b/gi, fix: (m) => m.replace(/there\s+was/i, "there were"), why: "Plural subject needs “there were”.", kind: "grammar" },
  { re: /\bi\s+(are|is)\b/gi, fix: (m) => m.replace(/are|is/i, "am"), why: "It's “I am”.", kind: "grammar" },
  { re: /\b(you|we|they)\s+is\b/gi, fix: (m) => m.replace(/is/i, "are"), why: "Plural subject takes “are”.", kind: "grammar" },
  // --- tense ---
  { re: /\b(have|has)\s+(went|came|did|saw|took|gave|wrote|spoke|broke|chose|drove)\b/gi, fix: (m) => m.replace(/(went|came|did|saw|took|gave|wrote|spoke|broke|chose|drove)$/i, (v) => ({ went: "gone", came: "come", did: "done", saw: "seen", took: "taken", gave: "given", wrote: "written", spoke: "spoken", broke: "broken", chose: "chosen", drove: "driven" }[v.toLowerCase()])), why: "After have/has, use the past participle.", kind: "grammar" },
  { re: /\b(am|is|are)\s+(agree|disagree|belong|know|understand|want|need)\b/gi, fix: (m) => { const p = m.split(/\s+/); return p[1]; }, why: "This verb doesn't take “am/is/are”.", kind: "grammar" },
  { re: /\b(am|is|are)\s+having\s+(a|an|the|two|three|some|many)\b/gi, fix: (m) => m.replace(/(am|is|are)\s+having/i, (x) => (/am/i.test(x) ? "have" : /is/i.test(x) ? "has" : "have")), why: "“Have” for possession, not “having”.", kind: "grammar" },
  { re: /\bwill\s+(went|came|did|saw|took)\b/gi, fix: (m) => m.replace(/(went|came|did|saw|took)$/i, (v) => ({ went: "go", came: "come", did: "do", saw: "see", took: "take" }[v.toLowerCase()])), why: "After “will”, use the base verb.", kind: "grammar" },
  // --- countables and number agreement ---
  { re: /\b(two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(year|month|week|day|hour|minute|rupee|student|person|company|job|time)\b(?!s)/gi, fix: (m) => m + "s", why: "After a number, use the plural.", kind: "grammar" },
  { re: /\bmuch\s+(more\s+)?(?=(people|students|jobs|companies|things|problems|options|reasons))/gi, fix: () => "many ", why: "“Many” for countable things.", kind: "grammar" },
  { re: /\ba\s+(informations?|advice|equipment|furniture|luggage|news|research|homework)\b/gi, fix: (m) => m.replace(/^a\s+/i, "some ").replace(/s$/, ""), why: "Uncountable — no “a”.", kind: "grammar" },
  // --- prepositions ---
  { re: /\bexplain\s+me\b/gi, fix: () => "explain to me", why: "You explain something *to* someone.", kind: "grammar" },
  { re: /\bdiscuss\s+on\b/gi, fix: () => "discuss", why: "“Discuss” takes no preposition.", kind: "grammar" },
  { re: /\bcomprises?\s+of\b/gi, fix: () => "comprises", why: "“Comprise” takes no “of”.", kind: "grammar" },
  { re: /\bemphasi[sz]e\s+on\b/gi, fix: () => "emphasise", why: "You emphasise something, not on it.", kind: "grammar" },
  { re: /\bdepends\s+(?!on|upon)(?=[a-z])/gi, fix: () => "depends on ", why: "It “depends on” something.", kind: "grammar" },
  { re: /\bcapable\s+to\b/gi, fix: () => "capable of", why: "Capable *of* doing.", kind: "grammar" },
  { re: /\binterested\s+about\b/gi, fix: () => "interested in", why: "Interested *in*.", kind: "grammar" },
  { re: /\bconsists\s+(?!of)(?=[a-z])/gi, fix: () => "consists of ", why: "It “consists of”.", kind: "grammar" },
  // --- word confusions that survive transcription ---
  { re: /\bthen\s+(me|him|her|them|us|the\s+other)\b/gi, fix: (m) => m.replace(/^then/i, "than"), why: "Comparison takes “than”.", kind: "grammar" },
  { re: /\b(advice|advise)\s+(me|him|her|them)\s+to\b/gi, fix: (m) => m.replace(/^advice/i, "advise"), why: "“Advise” is the verb.", kind: "grammar" },
  { re: /\bloose\s+(the|a|my|your|their|this)\b/gi, fix: (m) => m.replace(/^loose/i, "lose"), why: "“Lose” is the verb.", kind: "grammar" },
  { re: /\beffect\s+(the|a|my|our|their)\s+/gi, fix: (m) => m.replace(/^effect/i, "affect"), why: "“Affect” is the verb.", kind: "grammar" },
  { re: /\bcan\s+be\s+able\s+to\b/gi, fix: () => "can", why: "“Can” already means able to.", kind: "grammar" },
  { re: /\breturn\s+it\s+back\b/gi, fix: () => "return it", why: "“Back” is redundant.", kind: "grammar" },
  { re: /\bnot\s+(never|nothing|nobody|nowhere)\b/gi, fix: (m) => m.replace(/not\s+/i, "").replace(/never/i, "ever"), why: "Two negatives cancel out.", kind: "grammar" },
  { re: /\bthe\s+both\b/gi, fix: () => "both", why: "No article before “both”.", kind: "grammar" },
  { re: /\baccording\s+to\s+me\b/gi, fix: () => "in my opinion", why: "“According to” is for other sources.", kind: "grammar" },
  { re: /\bas\s+per\s+me\b/gi, fix: () => "in my view", why: "Not idiomatic.", kind: "grammar" },
  { re: /\bsince\s+long\b/gi, fix: () => "for a long time", why: "Not idiomatic.", kind: "grammar" },
  { re: /\b(years?|months?|days?)\s+back\b/gi, fix: (m) => m.replace(/back$/i, "ago"), why: "“Ago” for time past.", kind: "grammar" },
  { re: /\bupdation|upgradation\b/gi, fix: (m) => (/^upd/i.test(m) ? "update" : "upgrade"), why: "Not a standard word.", kind: "grammar" },
  { re: /\bcolleague'?s?\s+of\s+mine\b/gi, fix: () => "a colleague of mine", why: "Fixed phrase.", kind: "grammar" },
  // --- more regional usage ---
  { re: /\btoday\s+(morning|evening|night|afternoon)\b/gi, fix: (m) => "this " + m.split(/\s+/)[1], why: "Indian English. “This morning” elsewhere.", kind: "regional" },
  { re: /\bcousin\s+(brother|sister)\b/gi, fix: () => "cousin", why: "Indian English. Just “cousin” abroad.", kind: "regional" },
  { re: /\bi\s+have\s+a\s+doubt\b/gi, fix: () => "I have a question", why: "“Doubt” means suspicion outside India.", kind: "regional" },
  { re: /\b(give|gave|giving)\s+(an?\s+)?exam\b/gi, fix: (m) => m.replace(/give|gave|giving/i, (v) => ({ give: "take", gave: "took", giving: "taking" }[v.toLowerCase()])), why: "Abroad you take an exam.", kind: "regional" },
  { re: /\bsame\s+to\s+same\b/gi, fix: () => "identical", why: "Indian English.", kind: "regional" },
  { re: /\b(yesterday|tomorrow|now)\s+itself\b/gi, fix: (m) => m.split(/\s+/)[0], why: "The emphatic “itself” is regional.", kind: "regional" },
  { re: /\bclose\s+the\s+(light|fan|tv)\b/gi, fix: (m) => m.replace(/close/i, "turn off"), why: "You turn a light off.", kind: "regional" },
  // regional: correct in India, worth knowing for a global room
  { re: /\bdo\s+the\s+needful\b/gi, fix: () => "please take care of it", why: "Standard in India, opaque to a global panel.", kind: "regional" },
  { re: /\bprepone\b/gi, fix: () => "bring forward", why: "Indian English. Fine here, unknown abroad.", kind: "regional" },
  { re: /\bout\s+of\s+station\b/gi, fix: () => "out of town", why: "Indian English. Fine here, unusual abroad.", kind: "regional" },
  { re: /\bpass\s+out\s+(of|from)\b/gi, fix: () => "graduate from", why: "Abroad, “pass out” means faint.", kind: "regional" },
  { re: /\bkindly\s+(do|note|check|revert|inform)\b/gi, fix: (m) => "please " + m.split(/\s+/)[1], why: "“Kindly” reads formal and dated outside India.", kind: "regional" },
];

function checkGrammar(text) {
  const out = [];
  const seen = new Set();
  RULES.forEach((r) => {
    const re = new RegExp(r.re.source, r.re.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      const was = m[0].trim();
      const key = r.kind + "|" + was.toLowerCase();
      if (seen.has(key)) break;
      seen.add(key);
      let now;
      try { now = r.fix(was).trim(); } catch (e) { now = was; }
      if (now.toLowerCase() !== was.toLowerCase()) {
        const s = Math.max(0, m.index - 26), e2 = Math.min(text.length, m.index + was.length + 26);
        out.push({ was, now, why: r.why, kind: r.kind, ctx: (s > 0 ? "…" : "") + text.slice(s, e2).trim() + (e2 < text.length ? "…" : "") });
      }
      if (!re.global) break;
    }
  });
  return out;
}

/* -- words that are not words -------------------------------------------- */
/* A transcript full of invented words was passing the Grammarian silently.
   Anything the sanity check rejects is now reported by name. */
function findNonWords(text) {
  const toks = words0(text);
  const seen = new Map();
  toks.forEach((w, i) => {
    if (isRealWord(w)) return;   // a word in any supported language is a word
    const from = Math.max(0, i - 3), to = Math.min(toks.length, i + 4);
    if (!seen.has(w)) seen.set(w, { word: w, n: 1, ctx: toks.slice(from, to).join(" ") });
    else seen.get(w).n += 1;
  });
  return [...seen.values()].sort((a, b) => b.n - a.n);
}

/* -- register: fine with friends, wrong in front of a panel --------------- */
const SLANG = {
  "bro": "a neutral address, or nothing at all", "bruh": "nothing — cut it",
  "dude": "nothing — cut it", "guys": "everyone", "gonna": "going to", "wanna": "want to",
  "gotta": "have to", "kinda": "somewhat", "sorta": "somewhat", "yeah": "yes", "yep": "yes",
  "nah": "no", "ain't": "isn't", "cool": "impressive", "awesome": "impressive",
  "crazy": "striking", "insane": "extreme", "lol": "nothing — cut it", "sus": "questionable",
  "lowkey": "somewhat", "highkey": "clearly", "vibe": "atmosphere", "hella": "very",
  "legit": "genuinely", "chill": "relaxed", "dope": "impressive", "trash": "poor",
  "mad": "very", "bunch of": "several", "tons of": "a great deal of", "stuff like that": "and so on",
};
function findRegister(text) {
  const low = " " + text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ") + " ";
  const out = [];
  Object.keys(SLANG).forEach((w) => {
    const n = (low.match(new RegExp("\\b" + esc(w) + "\\b", "g")) || []).length;
    if (n) out.push({ was: w, now: SLANG[w], n, why: "Too casual for a panel.", kind: "register" });
  });
  return out.sort((a, b) => b.n - a.n);
}

/* -- vagueness: words that stand in for a thought ------------------------- */
const VAGUE = ["thing", "things", "stuff", "something", "somehow", "somewhere", "whatever",
  "and all", "and so on", "or whatever", "that kind of thing", "you get it", "some kind of",
  "anything like that", "et cetera", "and everything"];
function findVagueness(text) {
  const low = " " + text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ") + " ";
  const out = [];
  VAGUE.forEach((w) => {
    const n = (low.match(new RegExp("\\b" + esc(w) + "\\b", "g")) || []).length;
    if (n) out.push({ word: w, n });
  });
  return out.sort((a, b) => b.n - a.n);
}

/* -- leaning on the same word -------------------------------------------- */
const STOPW = new Set(("the a an and or but is are was were to of in on it that this i you we they he she be been being am do does did have has had for with as at so not no if then there their its my your our his her me him them what which who when where how can will would could should may might must very just also more most much many some any all each every other another same such than then now here").split(" "));
function findRepetition(text) {
  const toks = words0(text).filter((w) => w.length > 3 && !STOPW.has(w));
  const freq = {};
  toks.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).map(([word, n]) => ({ word, n }));
}

/* -- stumbles: doubled words and restarts -------------------------------- */

// Words that are fine said twice on purpose ("no no", "very very tired") —
// shared with segmentSpeech's own repeat check below, so the two don't drift.
const STUMBLE_OK_REPEAT = new Set(["that", "had", "very", "no", "ha"]);

function findStumbles(text) {
  const toks = words0(text);
  const out = [];
  for (let i = 1; i < toks.length; i++) {
    if (toks[i] === toks[i - 1] && !STUMBLE_OK_REPEAT.has(toks[i])) {
      out.push({ phrase: toks[i] + " " + toks[i], at: i });
    }
  }
  return out;
}

/* -- segment spontaneous, multilingual speech into units ------------------ */
/* Thin wrapper kept for every existing call site: segmentSpeech (defined
   further down, once the discourse-marker sets it needs exist) does the
   actual boundary reasoning and returns classified units; this just hands
   back the plain text of each one, exactly as before, so nothing downstream
   has to change shape. */
function segment(text) {
  const rich = (typeof segmentSpeech === "function") ? segmentSpeech(text) : null;
  if (rich && rich.length) return rich.map((u) => u.text);
  const t = (text || "").trim();
  return t ? [t] : [];
}

/* ==========================================================================
   CONCISENESS & CLARITY
   Every rewrite here is surgical — words are deleted or swapped, never
   regenerated — so the speaker's own phrasing, level and personality survive.
   ========================================================================== */

/* Words that carry no meaning of their own in speech. Deleting them never
   changes what was said. */
const EMPTY_WORDS = ["very", "really", "quite", "rather", "somewhat", "fairly", "pretty much",
  "actually", "basically", "literally", "definitely", "certainly", "absolutely", "totally",
  "completely", "simply", "just", "even", "only really", "so much", "kind of", "sort of",
  "a little bit", "in a way", "to be honest", "honestly", "personally", "obviously",
  "at the end of the day", "needless to say", "as a matter of fact", "it goes without saying",
  "for all intents and purposes", "when it comes to", "as far as i'm concerned"];

/* Long phrases with a one-word equivalent. */
const WORDY = [
  ["due to the fact that", "because"], ["owing to the fact that", "because"],
  ["in spite of the fact that", "although"], ["despite the fact that", "although"],
  ["in the event that", "if"], ["in the case that", "if"], ["on the condition that", "if"],
  ["for the purpose of", "to"], ["in order to", "to"], ["with a view to", "to"],
  ["at this point in time", "now"], ["at the present time", "now"], ["in this day and age", "today"],
  ["a large number of", "many"], ["a small number of", "a few"], ["a majority of", "most"],
  ["the vast majority of", "most"], ["a great deal of", "much"],
  ["in the near future", "soon"], ["at an early date", "soon"],
  ["with regard to", "about"], ["with respect to", "about"], ["in relation to", "about"],
  ["in terms of", "in"], ["in the field of", "in"], ["in the area of", "in"],
  ["it is important to note that", ""], ["it should be noted that", ""],
  ["the fact of the matter is that", ""], ["what i want to say is that", ""],
  ["the reason why is because", "because"], ["the thing is that", ""],
  ["make a decision", "decide"], ["take into consideration", "consider"],
  ["come to the conclusion", "conclude"], ["give consideration to", "consider"],
  ["have an impact on", "affect"], ["is able to", "can"], ["are able to", "can"],
  ["has the ability to", "can"], ["in the absence of", "without"],
  ["prior to", "before"], ["subsequent to", "after"], ["in close proximity to", "near"],
  ["a number of", "several"], ["there is no doubt that", ""], ["it seems to me that", ""],
];

/* Saying the same thing twice inside one phrase. */
const REDUNDANT = [
  ["each and every", "every"], ["first and foremost", "first"], ["one and only", "only"],
  ["past history", "history"], ["past experience", "experience"], ["future plans", "plans"],
  ["end result", "result"], ["final outcome", "outcome"], ["basic fundamentals", "fundamentals"],
  ["advance planning", "planning"], ["free gift", "gift"], ["new innovation", "innovation"],
  ["true fact", "fact"], ["personal opinion", "opinion"], ["absolutely essential", "essential"],
  ["completely eliminate", "eliminate"], ["totally destroyed", "destroyed"],
  ["join together", "join"], ["merge together", "merge"], ["combine together", "combine"],
  ["small in size", "small"], ["large in size", "large"], ["round in shape", "round"],
  ["period of time", "period"], ["time period", "period"], ["sum total", "total"],
  ["close proximity", "proximity"], ["unexpected surprise", "surprise"],
  ["added bonus", "bonus"], ["general consensus", "consensus"], ["exact same", "same"],
  ["ask a question", "ask"], ["brief summary", "summary"], ["mutual cooperation", "cooperation"],
];

function findEmptyWords(text) {
  const low = " " + text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ") + " ";
  const out = [];
  EMPTY_WORDS.forEach((w) => {
    const n = (low.match(new RegExp("\\b" + esc(w) + "\\b", "g")) || []).length;
    if (n) out.push({ phrase: w, n });
  });
  return out.sort((a, b) => b.n - a.n);
}

function findWordy(text) {
  const out = [];
  const low = text.toLowerCase();
  WORDY.forEach(([long, short]) => {
    const n = (low.match(new RegExp("\\b" + esc(long) + "\\b", "g")) || []).length;
    if (n) out.push({ was: long, now: short, n, kind: "wordy" });
  });
  REDUNDANT.forEach(([long, short]) => {
    const n = (low.match(new RegExp("\\b" + esc(long) + "\\b", "g")) || []).length;
    if (n) out.push({ was: long, now: short, n, kind: "redundant" });
  });
  return out.sort((a, b) => b.n - a.n);
}

/* Repeated ideas, not just repeated words: the same two-word pairing coming
   back is usually a speaker circling, and the emphasis case (back-to-back,
   or in the opening and the close) is deliberately excluded. */
function findRepeatedIdeas(text) {
  const toks = words0(text).filter((w) => !STOPW.has(w) && w.length > 3);
  const grams = {};
  for (let i = 0; i < toks.length - 1; i++) {
    const g = toks[i] + " " + toks[i + 1];
    (grams[g] = grams[g] || []).push(i);
  }
  return Object.entries(grams)
    .filter(([, at]) => at.length >= 2)
    .map(([phrase, at]) => {
      const spread = at[at.length - 1] - at[0];
      const emphasis = spread <= 3;                    // said twice in a row = emphasis
      return { phrase, n: at.length, spread, emphasis };
    })
    .filter((x) => !x.emphasis)
    .sort((a, b) => b.n - a.n);
}

/* Sentences a listener can't hold in their head. Clause-joins used to be
   counted from an English-only word list, so this never fired on a long
   Tamil or Hindi answer even when it genuinely rambled. SUBORD_ANY/COORD_ANY
   (defined with the segmentation engine below) cover the same role across
   every supported language, so this counts real joins wherever they're said. */
function findLongSentences(units) {
  const markers = (typeof SUBORD_ANY !== "undefined" && typeof COORD_ANY !== "undefined")
    ? SUBORD_ANY.concat(COORD_ANY)
    : [/\b(and|but|so|because|which|that|when|while|although|however|then)\b/i];
  return units.map((u, i) => {
    const w = (u.match(/\S+/g) || []).length;
    const clauses = markers.reduce((n, re) =>
      n + (u.match(new RegExp(re.source, "gi")) || []).length, 0);
    return { i, text: u, words: w, clauses };
  }).filter((u) => u.words >= 30 || u.clauses >= 5)
    .sort((a, b) => b.words - a.words);
}

/* Sentences that never resolve: no verb, or so many joins the thread is lost. */
/* "thing", "morning" and "everything" all end in -ing, so a bare -ing test
   finds verbs that aren't there. This checks properly. */
const AUX = /\b(is|are|was|were|am|be|been|being|have|has|had|do|does|did|can|could|will|would|shall|should|may|might|must|need to|going to)\b/i;
const VERB_LIST = /\b(set|sets|cites|cite|cited|put|puts|cut|cuts|hit|hits|cost|costs|let|lets|shut|read|reads|beat|beats|split|spread|quit|bet|shed|burst|cast|casts|means|meant|kept|keeps|left|leaves|sent|sends|spent|spends|built|builds|held|holds|told|tells|sold|sells|lost|loses|felt|feels|met|meets|paid|pays|said|says|led|leads|fed|feeds|drew|draws|grew|grows|knew|knows|threw|throws|flew|flies|rose|rises|chose|chooses|arose|bore|bears|wore|wears|tore|tears|swore|stood|stands|understood|withdrew|need|needs|needed|want|wants|wanted|like|likes|liked|love|loves|hate|hates|cost|costs|lack|lacks|face|faces|hold|holds|think|thinks|thought|believe|believes|say|says|said|make|makes|made|take|takes|took|go|goes|went|get|gets|got|know|knows|knew|see|sees|saw|feel|feels|felt|give|gives|gave|come|comes|came|use|uses|used|find|finds|found|work|works|worked|mean|means|meant|happen|happens|happened|become|becomes|became|seem|seems|seemed|show|shows|showed|start|starts|started|keep|keeps|kept|put|puts|bring|brings|brought|hold|holds|held|turn|turns|turned|call|calls|called|try|tries|tried|ask|asks|asked|move|moves|moved|live|lives|lived|run|runs|ran|play|plays|played|pay|pays|paid|help|helps|helped|talk|talks|talked|write|writes|wrote|read|reads|build|builds|built|create|creates|created|change|changes|changed|learn|learns|learned|lead|leads|led|watch|watches|watched|follow|follows|followed|stop|stops|stopped|allow|allows|allowed|add|adds|added|spend|spends|spent|grow|grows|grew|open|opens|opened|win|wins|won|offer|offers|offered|remember|remembers|consider|considers|wait|waits|expect|expects|stay|stays|fall|falls|fell|cut|cuts|reach|reaches|remain|remains|suggest|suggests|raise|raises|pass|passes|sell|sells|require|requires|report|reports|decide|decides|decided|support|supports|supported|argue|argues|argued|improve|improves|improved|reduce|reduces|affect|affects|matter|matters|depend|depends|hire|hires|hired|replace|replaces|solve|solves|explain|explains|prove|proves|agree|agrees|disagree)\b/i;
const ING_NOUNS = new Set(["thing", "things", "something", "anything", "everything", "nothing",
  "morning", "evening", "meaning", "building", "feeling", "beginning", "ceiling", "king", "ring",
  "during", "spring", "string", "wedding", "training", "meeting", "warning", "opening", "ending"]);

function hasVerb(sentence) {
  if (AUX.test(sentence) || VERB_LIST.test(sentence)) return true;
  const toks = words0(sentence);
  // an -ing word only counts as a verb if it isn't one of the common -ing nouns
  if (toks.some((w) => /ing$/.test(w) && w.length > 4 && !ING_NOUNS.has(w))) return true;
  // a past-tense -ed word, excluding adjectives that end the same way
  if (toks.some((w) => /ed$/.test(w) && w.length > 4 && !/^(tired|bored|interested|excited|worried|surprised|confused|pleased|scared|involved|related|supposed|advanced|limited|detailed|mixed|red)$/.test(w))) return true;
  return false;
}

/* rich is the classified output of segmentSpeech, index-aligned with units
   (both are derived from the same text by the same function, so unit k and
   rich[k] are the same span). A unit the segmenter already recognised as an
   abandoned or self-corrected construction isn't a listener losing the
   thread — it's the speaker fixing course, which Fluency accounts for
   separately — so it's excluded here rather than double-counted as tangled. */
function findTangled(units, rich) {
  const out = [];
  units.forEach((u, i) => {
    const w = (u.match(/\S+/g) || []).length;
    if (w < 4) return;
    if (rich && rich[i] && rich[i].kind === "ABANDONED_CONSTRUCTION") return;
    const clauses = (u.toLowerCase().match(/\b(and|but|so|because|which|that|when|while|although|however)\b/g) || []).length;
    if (!hasVerb(u)) { out.push({ i, text: u, why: "no clear verb — this never becomes a statement" }); return; }
    if (clauses >= 6) { out.push({ i, text: u, why: `${clauses} joins in one breath — the thread is lost before the end` }); return; }
    if (/^(which|and|but|so|because|that)\b/i.test(u.trim()) && w >= 10) {
      out.push({ i, text: u, why: "starts mid-thought, so the listener has to reconstruct the subject" });
    }
  });
  return out;
}

/* The surgical rewrite: delete empty words, swap wordy phrases for their own
   short form, split a run-on at its weakest join. Nothing is invented. */
function tightenSentence(sentence) {
  let out = sentence;
  const removed = [];
  WORDY.concat(REDUNDANT).forEach(([long, short]) => {
    const re = new RegExp("\\b" + esc(long) + "\\b", "gi");
    if (re.test(out)) {
      removed.push(short ? `“${long}” → “${short}”` : `cut “${long}”`);
      out = out.replace(re, short);
    }
  });
  EMPTY_WORDS.forEach((w) => {
    const re = new RegExp("\\s*\\b" + esc(w) + "\\b", "gi");
    if (re.test(out)) { removed.push(`cut “${w}”`); out = out.replace(re, ""); }
  });
  out = out.replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();
  if (out) out = out[0].toUpperCase() + out.slice(1);
  const before = (sentence.match(/\S+/g) || []).length;
  const after = (out.match(/\S+/g) || []).length;
  return { original: sentence, tightened: out, removed, before, after, saved: before - after };
}

function concisenessReport(text, units) {
  // Recomputed from the same text, so it lines up index-for-index with
  // units — segmentSpeech is deterministic on identical input.
  const rich = (typeof segmentSpeech === "function") ? segmentSpeech(text) : null;
  const empty = findEmptyWords(text);
  const wordy = findWordy(text);
  const longOnes = findLongSentences(units);
  const tangled = findTangled(units, rich);
  const repeatedIdeas = findRepeatedIdeas(text);

  const wc = words0(text).length;
  const emptyCount = empty.reduce((a, x) => a + x.n, 0);
  const wordyCount = wordy.reduce((a, x) => a + x.n, 0);
  const wastedWords = emptyCount + wordy.reduce((a, x) => a + x.n * Math.max(1, x.was.split(" ").length - (x.now ? x.now.split(" ").length : 0)), 0);
  const wastePct = wc ? (wastedWords / wc) * 100 : 0;

  // Rewrites for the worst offenders only — the ones actually worth showing.
  const candidates = [...longOnes.map((u) => u.text), ...tangled.map((u) => u.text)];
  const seen = new Set();
  const rewrites = [];
  units.forEach((u) => {
    const t = tightenSentence(u);
    if (t.saved >= 3 && !seen.has(u)) { seen.add(u); rewrites.push({ ...t, reason: "too many words doing no work" }); }
  });
  candidates.forEach((u) => {
    if (seen.has(u)) return;
    const t = tightenSentence(u);
    seen.add(u);
    const long = longOnes.find((l) => l.text === u);
    rewrites.push({ ...t, reason: long ? `${long.words} words in one sentence` : (tangled.find((x) => x.text === u) || {}).why || "hard to follow" });
  });
  rewrites.sort((a, b) => b.saved - a.saved);

  const score = wc < 12 ? 0 : Math.max(0, Math.min(100, Math.round(
    100
    - wastePct * 2.2
    - longOnes.length * 9
    - tangled.length * 11
    - repeatedIdeas.length * 5
  )));

  let line;
  if (wc < 12) line = "Too short to judge how efficiently you speak.";
  else if (score >= 82) line = `Tight. About ${Math.round(wastePct)}% of your words were doing no work, which is well below what a listener notices.`;
  else if (score >= 62) line = `Reasonably tight, but roughly ${Math.round(wastePct)}% of your words could go without changing your meaning${longOnes.length ? `, and ${longOnes.length} sentence${longOnes.length === 1 ? "" : "s"} ran long` : ""}.`;
  else line = `You're using more words than your ideas need — around ${Math.round(wastePct)}% could be cut${longOnes.length ? `, with ${longOnes.length} over-long sentence${longOnes.length === 1 ? "" : "s"}` : ""}${tangled.length ? ` and ${tangled.length} that a listener would lose` : ""}.`;

  return { empty, wordy, longOnes, tangled, repeatedIdeas, rewrites: rewrites.slice(0, 4),
    emptyCount, wordyCount, wastedWords, wastePct, score, line };
}



/* Structure markers that survive translation. A speaker taking a position or
   closing a point does it in every language; these catch the common Indic
   forms plus anything the speaker said in English while code-mixing. */
/* Structure markers that survive translation. A speaker taking a position or
   closing a point does it in every language.

   No \b anywhere below: JavaScript word boundaries are ASCII-only, so \b
   before "मुझे" or "ஏனென்றால்" never matches. These phrases are distinctive
   enough not to need one. */
const STANCE_ANY = [
  /(mujhe lagta|mera manna|main sochta|meri raye|मुझे लगता|मेरा मानना|मेरे हिसाब|मुझे ऐसा लगता)/i,
  /(நான் நினைக்கிறேன்|enakku thonuthu|என் கருத்து)/i,
  /(nenu anukuntunna|నా అభిప్రాయం|నేను అనుకుంటున్నాను)/i,
  /(amar mone hoy|আমার মনে হয়)/i,
  /(mala vatate|मला वाटतं|माझ्या मते)/i,
  /(nanage anisuttade|ನನ್ನ ಪ್ರಕಾರ)/i,
  /(enikku thonnunnu|എന്റെ അഭിപ്രായം)/i,
  /(mane lage che|મને લાગે છે)/i,
  /(mainu lagda|ਮੈਨੂੰ ਲੱਗਦਾ)/i,
  /\b(i think|i believe|in my view|i would argue)\b/i,
];
const CONNECT_ANY = [
  /(kyunki|kyonki|क्योंकि|isliye|इसलिए|lekin|लेकिन|magar|मगर|phir bhi|फिर भी|udaharan|उदाहरण)/i,
  /(ஏனென்றால்|ஆனால்|அதனால்|உதாரணமாக)/i,
  /(endukante|కానీ|అందుకే|ఉదాహరణకు)/i,
  /(कारण|पण|म्हणून)/i,
  /(কিন্তু|কারণ|তাই)/i,
  /(ಏಕೆಂದರೆ|ಆದರೆ|ಆದ್ದರಿಂದ)/i,
  /(കാരണം|പക്ഷേ|അതുകൊണ്ട്)/i,
  /(કારણ કે|પણ|તેથી)/i,
  /(ਕਿਉਂਕਿ|ਪਰ|ਇਸ ਲਈ)/i,
  /\b(for example|because|however)\b/i,
];
const CLOSERS_ANY = [
  /(isliye main|इसलिए मैं|अंत में|कुल मिलाकर|to kul milakar)/i,
  /(மொத்தத்தில்|கடைசியா|ஆகவே)/i,
  /(మొత్తానికి|చివరగా|కాబట్టి)/i,
  /(शेवटी|थोडक्यात)/i,
  /(সবশেষে|মোটকথা)/i,
  /(ಒಟ್ಟಾರೆ|ಕೊನೆಯದಾಗಿ)/i,
  /(ചുരുക്കത്തിൽ|അവസാനം)/i,
  /(ટૂંકમાં|છેલ્લે)/i,
  /(ਅੰਤ ਵਿੱਚ|ਸੰਖੇਪ ਵਿੱਚ)/i,
  /\b(so overall|to conclude|in short)\b/i,
];

/* ==========================================================================
   SPEECH SEGMENTATION
   Where units used to come from ASR punctuation (or, failing that, a short
   list of English breaker words), a boundary is now a decision weighed from
   several independent signals — closing/discourse markers, subordination,
   accumulated length, self-correction — rather than a single rule. Nothing
   below treats "the language changed" as evidence of anything: a clause that
   opens in English and finishes in Tamil is never split for that reason
   alone, because no signal here even looks at script or vocabulary origin —
   every marker set is checked against the window regardless of which
   language it belongs to. ASR punctuation still counts, but as one signal
   among several, and it is the first one a subordinate clause overrides —
   "...was because. Because of that..." never splits at the period. */

/* "because"/"for example"-type: opens a clause that finishes the thought
   already in progress. A boundary is never placed where one of these
   begins, even across a punctuation mark. "but/so/therefore"-type: can
   start a genuinely new unit, but only once the clause behind it is
   already substantial. Both are pulled from the same vetted vocabulary as
   STANCE_ANY/CONNECT_ANY/CLOSERS_ANY above, split by grammatical role. */
const SUBORD_ANY = [
  /\b(because|since|although|though|while|unless|whereas|if|when|that|which|who|for example|for instance)\b/i,
  /(kyunki|kyonki|क्योंकि|udaharan|उदाहरण|agar|अगर|jab\b|जब)/i,
  /(ஏனென்றால்|உதாரணமாக)/i,
  /(endukante|ఉదాహరణకు)/i,
  /(ಏಕೆಂದರೆ)/i,
  /(കാരണം)/i,
  /(\bकारण\b)/i,
  /(কারণ)/i,
  /(કારણ કે)/i,
  /(ਕਿਉਂਕਿ)/i,
];
const COORD_ANY = [
  /\b(but|however|so|yet|and|then)\b/i,
  /(lekin|लेकिन|magar|मगर|isliye|इसलिए)/i,
  /(ஆனால்|அதனால்)/i,
  /(కానీ|అందుకే)/i,
  /(ಆದರೆ|ಆದ್ದರಿಂದ)/i,
  /(പക്ഷേ|അതുകൊണ്ട്)/i,
  /(\bपण\b|म्हणून)/i,
  /(কিন্তু|তাই)/i,
  /(પણ|તેથી)/i,
  /(ਪਰ|ਇਸ ਲਈ)/i,
];
/* A speaker announcing their own restart. Kept to phrasing this confident
   about — "matlab"/"yaani" are already established discourse markers
   elsewhere in this file, not a new guess. */
const SELF_CORRECTION_ANY = [
  /\b(i mean|actually|sorry|no wait|wait,? i mean|what i meant|let me rephrase|or rather)\b/i,
  /(matlab|मतलब|yaani|यानी)/i,
];

const SEG_SAFETY_MAX = 42;      // tokens — a ceiling so unpunctuated speech
                                  // in any language still gets segmented
const SEG_MIN_FOR_COORD = 6;     // a coordinator only counts once the clause
                                  // behind it is long enough to be its own unit

function segWindowAfter(toks, i, fwd) {
  return toks.slice(i + 1, Math.min(toks.length, i + 1 + fwd)).join(" ");
}

/* True only if one of the patterns matches starting at the very first token
   of the window — i.e. the marker begins right after the candidate boundary,
   not merely somewhere within the lookahead. Without this anchor, a closer
   like "so overall" three tokens further on would make every position in
   between look like a boundary too, splitting the unit one word at a time. */
function startsWithMarker(window, patterns) {
  return patterns.some((re) => {
    const m = new RegExp(re.source, re.flags.replace(/g/g, "")).exec(window);
    return m && m.index === 0;
  });
}

/* text -> [{ text, kind, confidence, endReason, wc }].
   kind is the subset of the full spoken-unit taxonomy this heuristic engine
   can back with real evidence:
     COMPLETE_SENTENCE        — closes on punctuation with no other signal contradicting it
     THOUGHT_GROUP_END        — closes on a coordinator or a new stance-opener
     COMMUNICATIVE_UNIT_END   — closes on a closing/conclusion marker
     ABANDONED_CONSTRUCTION   — cut short by the speaker's own restart or a stutter-repeat
     HESITATION               — the unit is nothing but filler/hedge tokens
     UNCERTAIN_BOUNDARY       — no real signal fired; split only because the
                                 unit hit the safety ceiling, so treat it as
                                 a rough boundary, not a confident one
   Categories the spec names but this engine has no honest way to tell apart
   from these — INTERRUPTION (needs a second speaker's audio), LIST_CONTINUATION
   and TOPIC_SHIFT (need real discourse parsing) — are not invented; they fall
   into UNCERTAIN_BOUNDARY rather than being guessed at. */
function segmentSpeech(text) {
  const raw = (text || "").trim();
  if (!raw) return [];
  const toks = raw.split(/\s+/).filter(Boolean);
  if (!toks.length) return [];

  const stripPunct = (w) => w.replace(/^[^\p{L}\p{M}\d]+|[^\p{L}\p{M}\d]+$/gu, "");
  const cleanToks = toks.map((w) => stripPunct(w).toLowerCase());
  const fillerWord = (w) => HARD_FILLERS.includes(w) || HEDGES.includes(w) || SOFT_FILLERS.includes(w) ||
    (typeof ALL_INDIC_FILLERS !== "undefined" && ALL_INDIC_FILLERS.includes(w));

  const units = [];
  let start = 0;

  const flush = (end, reason, confidence) => {
    if (end < start) return;
    const unitToks = toks.slice(start, end + 1);
    const unitText = unitToks.join(" ");
    const wc = unitToks.length;
    const cleanUnit = unitToks.map((w) => stripPunct(w).toLowerCase()).filter(Boolean);
    const allFiller = wc > 0 && cleanUnit.every(fillerWord);
    let kind;
    if (allFiller) kind = "HESITATION";
    else if (reason === "selfcorrect" || reason === "repeat") kind = "ABANDONED_CONSTRUCTION";
    else if (reason === "closer") kind = "COMMUNICATIVE_UNIT_END";
    else if (reason === "stance" || reason === "coord") kind = "THOUGHT_GROUP_END";
    else if (reason === "punct") kind = "COMPLETE_SENTENCE";
    // The speaker simply stopped talking here — real evidence the utterance
    // is over, and stronger than an arbitrary length cutoff. This is what
    // classifies the finished construction after a restart, e.g. "...actually,
    // I joined because I wanted to become more confident" — that isn't
    // uncertain, it's the thing that should be graded on its own merits.
    else if (reason === "end") kind = "COMPLETE_SENTENCE";
    else kind = "UNCERTAIN_BOUNDARY";  // reason === "maxlen": a forced cut, not a real one
    units.push({ text: unitText, kind, confidence, endReason: reason, wc });
    start = end + 1;
  };

  for (let i = 0; i < toks.length; i++) {
    const unitLen = i - start + 1;
    const hasNext = i + 1 < toks.length;
    const nextClean = hasNext ? cleanToks[i + 1] : "";

    // The speaker signalling their own restart overrides everything else —
    // this is direct evidence, not an inference from a pause or a word list.
    if (hasNext && unitLen >= 2 && startsWithMarker(segWindowAfter(toks, i, 4), SELF_CORRECTION_ANY)) {
      flush(i, "selfcorrect", 0.7); continue;
    }
    if (hasNext && unitLen >= 2 && nextClean && nextClean === cleanToks[i] && !STUMBLE_OK_REPEAT.has(cleanToks[i])) {
      flush(i, "repeat", 0.55); continue;
    }
    // Safety valve before the subordinate check, so a long unpunctuated
    // stretch that happens to keep opening dependent clauses still segments
    // instead of becoming one giant unit.
    if (unitLen >= SEG_SAFETY_MAX) { flush(i, "maxlen", 0.3); continue; }
    // Never split into a subordinate clause — the thought isn't finished,
    // whatever else the window says. This is the one place linguistic
    // structure is allowed to override punctuation outright, per spec.
    if (hasNext && SUBORD_ANY.some((re) => re.test(toks[i + 1]))) continue;

    if (hasNext) {
      const after = segWindowAfter(toks, i, 4);
      if (startsWithMarker(after, CLOSERS_ANY)) { flush(i, "closer", 0.85); continue; }
      if (startsWithMarker(after, STANCE_ANY)) { flush(i, "stance", 0.65); continue; }
      if (unitLen >= SEG_MIN_FOR_COORD && COORD_ANY.some((re) => re.test(toks[i + 1]))) { flush(i, "coord", 0.7); continue; }
      if (/[.!?]$/.test(toks[i])) { flush(i, "punct", 0.55); continue; }
    }
  }
  if (start <= toks.length - 1) flush(toks.length - 1, "end", 0.6);

  return units;
}

/* Conciseness for non-English speech. The English rules (wordy phrase swaps,
   filler-word lists) don't transfer, so this measures only what
   is genuinely language-neutral: sentence length, repeated ideas, and how much
   of the answer is spent circling. It returns the same shape as the English
   report so every consumer downstream keeps working untouched. */
function concisenessNeutral(text, units, repeats) {
  const wc = words0(text).length;
  const longOnes = findLongSentences(units);
  const repeatedIdeas = findRepeatedIdeas(text);
  const repeatLoad = (repeats || []).reduce((a, v) => a + Math.max(0, v.n - 2), 0);
  const score = wc < 12 ? 0 : Math.max(0, Math.min(100, Math.round(
    100 - longOnes.length * 10 - repeatedIdeas.length * 6 - repeatLoad * 4
  )));
  const line = wc < 12
    ? "Too short to judge how efficiently you speak."
    : score >= 78
      ? "Tight. Your sentences stay a length a listener can hold."
      : `${longOnes.length ? `${longOnes.length} sentence${longOnes.length === 1 ? "" : "s"} ran long` : "Sentence length is fine"}${repeatedIdeas.length ? `, and ${repeatedIdeas.length} idea${repeatedIdeas.length === 1 ? "" : "s"} came back around` : ""}. Word-level tightening is only checked for English, so this is the shape of your answer rather than its wording.`;
  return { empty: [], wordy: [], longOnes, tangled: [], repeatedIdeas,
    rewrites: [], emptyCount: 0, wordyCount: 0, wastedWords: 0, wastePct: 0, score, line,
    neutral: true };
}

/* -- the main analysis --------------------------------------------------- */

function analyse(text, seconds, mode, declaredLang) {
  const clean = (text || "").trim();
  // Every call site used to omit this, so a user who had selected Hindi was
  // still being auto-detected. Falling back to the stored setting fixes all
  // six call sites at once and keeps the argument for explicit overrides.
  if (declaredLang === undefined && typeof spokenLangCode === "function") {
    declaredLang = spokenLangCode();
  }
  const toks = words0(clean);
  const wc = toks.length;

  // Read the language before judging anything, so English-only checks don't
  // fire on speech that was never meant to be English.
  const lang = typeof langProfile === "function"
    ? langProfile(clean, declaredLang)
    : { primary: "en-IN", englishDominant: true, mixed: false, codeMix: 0, englishShare: 100 };
  const isEnglish = lang.englishDominant;

  const real = toks.filter(isRealWord);
  const intelligibility = wc ? Math.round((real.length / wc) * 100) : 0;
  const junk = [...new Set(toks.filter((w) => !isRealWord(w)))];
  const unintelligible = wc >= 3 && intelligibility < 55;

  const fillers = findFillers(clean, lang.primary);
  const fillerCount = fillers.filter((f) => f.kind === "filler").length;
  const hedgeCount = fillers.filter((f) => f.kind === "hedge").length;
  const crutchCount = fillers.filter((f) => f.kind === "crutch").length;

  // Non-words are reported even when the overall percentage looks healthy —
  // six invented words in eighty is still six invented words.
  const nonWords = findNonWords(clean);
  // These four are rules *about English*. Running them on Hindi or Tamil would
  // invent errors that aren't there, so they only run when English dominates.
  const grammar = isEnglish ? checkGrammar(clean) : [];
  const register = isEnglish ? findRegister(clean) : [];
  const vague = isEnglish ? findVagueness(clean) : [];
  const repeats = findRepetition(clean);
  const stumbles = findStumbles(clean);
  // The full classified segmentation — where units come from, not just what
  // they say. units stays the plain-text array every existing consumer
  // expects; richUnits carries the same spans with a boundary reason,
  // confidence and category (self-correction, hesitation, closer...) for
  // anything downstream that wants to reason about completion rather than
  // just word-count.
  const richUnits = typeof segmentSpeech === "function" ? segmentSpeech(clean) : [];
  const units = richUnits.length ? richUnits.map((u) => u.text) : segment(clean);
  const avgUnit = units.length ? Math.round(wc / units.length) : wc;
  const abandonedUnits = richUnits.filter((u) => u.kind === "ABANDONED_CONSTRUCTION");
  const concise = isEnglish
    ? concisenessReport(clean, units)
    : concisenessNeutral(clean, units, repeats);

  // Strip punctuation first: "for example," must still match "for example".
  const low = " " + clean.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  const enMark = (list) => list.some((x) => low.includes(" " + x + " ") || low.startsWith(" " + x + " "));
  const hasStance = enMark(STANCE) || (!isEnglish && STANCE_ANY.some((r) => r.test(clean)));
  const connectives = new Set(CONNECT.filter((c) => low.includes(" " + c + " "))).size
    + (isEnglish ? 0 : CONNECT_ANY.filter((r) => r.test(clean)).length);
  const hasClose = CLOSERS.some((c) => low.includes(" " + c + " "))
    || (!isEnglish && CLOSERS_ANY.some((r) => r.test(clean)));

  const wpm = seconds > 0 ? Math.round((wc / seconds) * 60) : 0;
  const realUnique = new Set(real).size;
  const ttr = real.length ? realUnique / real.length : 0;
  const sampleTrust = Math.min(1, wc / 70);
  const variety = Math.round(ttr * 100 * (0.4 + 0.6 * sampleTrust));

  // Range is vocabulary reach, not novelty. Saying forty different everyday
  // words is not range; unique nonsense certainly isn't.
  const content = real.filter((w) => !STOPW.has(w) && w.length > 3);
  const beyondBasic = content.filter((w) =>
    !BASIC.has(w) && !COMMON.has(w) && (w.length >= 7 || ACADEMIC.test(w)));
  // "Beyond basic" is an English word list. For other languages, reach is
  // measured on spread and word length only — a narrower claim, honestly made.
  const sophistication = !isEnglish
    ? Math.min(1, (content.filter((w) => w.length >= 6).length / Math.max(1, content.length)) * 1.15)
    : (content.length ? beyondBasic.length / content.length : 0);

  const clarity = Math.pow(intelligibility / 100, 1.6);
  const enough = Math.min(1, 0.2 + (wc / 90) * 0.8);
  const per100 = wc ? ((fillerCount + crutchCount * 0.6) / wc) * 100 : 0;

  const vagueCount = vague.reduce((a, v) => a + v.n, 0);
  const registerCount = register.reduce((a, v) => a + v.n, 0);
  const repeatLoad = repeats.reduce((a, v) => a + (v.n - 2), 0);

  const fluency = Math.max(0, Math.round((100 - per100 * 7 - hedgeCount * 3 - stumbles.length * 4) * clarity));
  const pace = wc < 8 ? 0 : Math.max(0, Math.round(100 - Math.abs(wpm - 140) * 0.8));
  const lengthTrust = Math.min(1, 0.55 + (wc / 120) * 0.45);
  const range = Math.max(0, Math.min(100, Math.round(
    (ttr * 58 + sophistication * 80 - vagueCount * 4 - repeatLoad * 3) * clarity * lengthTrust
  )));
  const structure = Math.round(
    ((hasStance ? 34 : 0) + Math.min(33, connectives * 12) + (hasClose ? 33 : 0)) * clarity * enough
  );
  // Invented words and slang are language errors too, so the Grammar score
  // must move when they appear.
  const accuracy = wc < 10 ? 0 : Math.max(0, Math.round(
    100
      - grammar.filter((g) => g.kind === "grammar").length * 12
      - nonWords.reduce((a, j) => a + j.n, 0) * 9
      - registerCount * 5
  ));
  const clarity100 = concise.score;
  const overall = Math.round((fluency + pace + range + structure + accuracy + clarity100) / 6);

  return {
    text: clean, wc, wpm, seconds, mode,
    intelligibility, junk, unintelligible,
    lang, isEnglish, codeMix: lang.codeMix, mixed: lang.mixed,
    fillers, fillerCount, hedgeCount, crutchCount,
    grammar, nonWords, register, vague, repeats, stumbles,
    vagueCount, registerCount, sophistication: Math.round(sophistication * 100),
    units, unitCount: units.length, avgUnit, concise, clarity100,
    richUnits, abandonedCount: abandonedUnits.length,
    hasStance, connectives, hasClose,
    variety, fluency, pace, range, structure, accuracy, overall,
  };
}

/* ---------------------- THE ROLE-PLAYERS' REPORTS ------------------------ */

/* The Timer. Toastmasters signals green at the qualifying time, amber next,
   red at the limit. Under green or well over red doesn't qualify. */
function signalFor(elapsed, slot) {
  if (elapsed >= slot.red) return "red";
  if (elapsed >= slot.amber) return "amber";
  if (elapsed >= slot.green) return "green";
  return "none";
}

function timerReport(seconds, slot) {
  const sig = signalFor(seconds, slot);
  if (seconds < slot.green) {
    return {
      verdict: "under", vclass: "u", signal: sig,
      line: `You finished at ${fmt(seconds)}. The green light comes on at ${fmt(slot.green)}, so this one doesn't qualify — in a real meeting you'd be timed out of the vote. Short answers usually mean you stopped at your first idea instead of developing it.`,
    };
  }
  if (seconds > slot.red) {
    return {
      verdict: "over", vclass: "o", signal: "red",
      line: `You ran to ${fmt(seconds)}, past the ${fmt(slot.red)} limit. Overrunning reads as poor control, not enthusiasm. Watch for the amber at ${fmt(slot.amber)} — that's your cue to start landing the plane.`,
    };
  }
  return {
    verdict: "qualified", vclass: "q", signal: sig,
    line: `${fmt(seconds)} — inside the window. You saw green at ${fmt(slot.green)} and closed before red. That's the part most people never manage.`,
  };
}

function fmt(s) {
  s = Math.max(0, Math.round(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* The Ah-Counter. The classic Toastmasters role: names every "ah", "um" and
   "uh" by count first — that's the seat's actual namesake — then the other
   crutch words and hedges it also listens for, kept as a clearly separate
   group rather than folded into one undifferentiated tally. */
function ahReport(r) {
  const tally = {};
  r.fillers.forEach((f) => { tally[f.phrase] = (tally[f.phrase] || 0) + 1; });
  const rows = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const sounds = rows.filter(([w]) => AH_SOUNDS.has(w));
  const crutches = rows.filter(([w]) => !AH_SOUNDS.has(w));
  const soundTotal = sounds.reduce((s, [, n]) => s + n, 0);
  const total = r.fillerCount + r.hedgeCount + r.crutchCount;
  const crutchTotal = total - soundTotal;
  const per = r.wc ? (total / r.wc) * 100 : 0;
  const soundPer = r.wc ? (soundTotal / r.wc) * 100 : 0;

  let line;
  if (total === 0) {
    line = "Not one ah, um or uh — and no crutch words either. That's rare, and it's the single biggest thing that makes someone sound prepared.";
  } else if (soundTotal === 0) {
    line = `Zero "ah", "um" or "uh" — the sound of hesitation is gone. What's left is ${crutchTotal} crutch word${crutchTotal === 1 ? "" : "s"}${crutches[0] ? `, mostly "${crutches[0][0]}" (×${crutches[0][1]})` : ""} — a much easier habit to break than a real filler sound.`;
  } else {
    const worst = sounds[0];
    if (soundPer < 3) {
      line = `${soundTotal} "ah"/"um"/"uh" in ${r.wc} words — about ${soundPer.toFixed(1)}%. Below three percent is where a listener stops noticing. You're there.`;
    } else if (soundPer < 6) {
      line = `${soundTotal} "ah"/"um"/"uh" in ${r.wc} words, roughly ${soundPer.toFixed(1)}% — mostly "${worst[0]}" (×${worst[1]}). Audible but not distracting. They cluster where you change direction — that's the place to swap in a half-second of silence instead of a sound.`;
    } else {
      line = `${soundTotal} "ah"/"um"/"uh" in ${r.wc} words, about ${soundPer.toFixed(1)}%. That's high enough that a panel hears the hesitation instead of the argument. "${worst[0]}" alone is ${worst[1]} of them — hunt just that one sound for a week before touching anything else.`;
    }
  }
  return { rows, sounds, crutches, soundTotal, crutchTotal, total, per, soundPer, line };
}

/* The Grammarian. Errors, plus whether the Word of the Day was used. */
function gramReport(r, wotd, usedWotd) {
  const errs = r.grammar.filter((g) => g.kind === "grammar");
  const regional = r.grammar.filter((g) => g.kind === "regional");
  const junk = r.nonWords || [];
  const junkTotal = junk.reduce((a, j) => a + j.n, 0);
  const parts = [];

  if (r.wc < 12) return { errs, regional, junk, junkTotal, line: "Not enough said to judge the language.", wotd, usedWotd };

  // Speaking another language is not an error, and mixing is not a defect.
  if (r.lang && !r.isEnglish) {
    parts.push(`You spoke mainly in ${langName(r.lang.primary)}. English grammar rules don't apply to that, so I've checked structure, pacing and repetition instead — the parts that carry across every language.`);
  }
  // Said whenever the speech is mixed, in either direction. The speaker who
  // most needs to hear it is the one speaking mostly Hindi with English in it.
  if (r.mixed) {
    parts.push(`You moved between ${langName(r.lang.primary)} and English — roughly ${r.lang.englishShare}% English. That's how most people in this room actually talk, and it's scored as one answer rather than penalised.`);
  }

  if (junkTotal > 0) {
    parts.push(`${junkTotal} word${junkTotal === 1 ? "" : "s"} I couldn't recognise at all` +
      ` — ${junk.slice(0, 4).map((j) => `“${j.word}”`).join(", ")}. If you said something real there, the mic misheard you. If you didn't, a panel hears it as bluffing through a gap.`);
  }
  if (errs.length === 0) {
    // Claiming "no errors from the patterns I watch for" is false when those
    // patterns were never run — they're English rules and this wasn't English.
    if (r.lang && !r.isEnglish) {
      // already explained above; don't imply a clean English check happened
    } else {
      parts.push(junkTotal ? "The grammar itself was sound." : "No errors from the seventy-odd patterns I watch for. Clean.");
    }
  }
  else if (errs.length <= 2) parts.push(`${errs.length} grammatical slip${errs.length === 1 ? "" : "s"}. Small, but they're patterns rather than accidents.`);
  else parts.push(`${errs.length} grammatical errors. Each is minor; together they make a panel work harder to follow you.`);

  if (r.registerCount > 0) {
    const top = r.register.slice(0, 3).map((x) => `“${x.was}”`).join(", ");
    parts.push(`${r.registerCount} word${r.registerCount === 1 ? "" : "s"} too casual for the room — ${top}. Fine with friends, costly in an interview.`);
  }
  if (r.vagueCount >= 3) {
    parts.push(`You reached for vague filler ${r.vagueCount} times (${r.vague.slice(0, 3).map((v) => `“${v.word}”`).join(", ")}). Each one is a place a specific noun would have been stronger.`);
  }
  if (r.repeats && r.repeats.length) {
    parts.push(`You leaned on “${r.repeats[0].word}” ${r.repeats[0].n} times.`);
  }
  if (regional.length) {
    parts.push(`${regional.length} usage${regional.length === 1 ? "" : "s"} reads perfectly normal here but lands oddly in a global room.`);
  }
  // A construction the speaker themselves abandoned and restarted isn't a
  // grammar error — it's self-repair, and only the finished version is
  // judged. Said here so it doesn't quietly show up as an unexplained
  // "tangled sentence" instead.
  if (r.abandonedCount > 0) {
    parts.push(`You caught yourself and restarted ${r.abandonedCount} time${r.abandonedCount === 1 ? "" : "s"} mid-thought. That's self-correction, not an error — only the sentence you actually finished gets judged.`);
  }
  return { errs, regional, junk, junkTotal, line: parts.join(" "), wotd, usedWotd };
}

/* The General Evaluator. Works with no API key by deriving both a commendation
   and a recommendation from the strongest and weakest measured dimension. */
function evalReport(r, timer) {
  const dims = [
    { k: "structure", v: r.structure, up: "You gave the answer a shape — a position, reasons, and an ending. Most speakers only manage the middle.", down: "The answer had no frame. Open with your position in the first sentence, give one reason, then say the position again to close. That structure alone lifts a Table Topic more than better vocabulary would." },
    { k: "fluency", v: r.fluency, up: "Your delivery ran clean — very little reaching for crutch words.", down: "The crutch words are doing your thinking out loud. When you feel one coming, close your mouth instead. A pause sounds like confidence; 'um' sounds like searching." },
    { k: "range", v: r.range, up: "Good vocabulary reach — you used precise words, not just different ones.", down: r.vagueCount >= 3
        ? "Vague words are standing in for your thinking — “thing”, “stuff”, “somehow”. Every one of those is a place where a specific noun would have made the point land. Name the thing."
        : "You circled a small set of everyday words. Pick one precise word before you start and build a sentence toward it." },
    { k: "accuracy", v: r.accuracy, up: "Grammatically solid throughout.", down: (r.nonWords && r.nonWords.length)
        ? "Several words weren't words. If that's the mic, move somewhere quieter; if it's you filling a gap with noise, stop and take the silence instead — a pause reads as thinking, invented syllables read as panic."
        : r.registerCount > 0
          ? "The register slipped into friend-group speech. A panel scores you on whether you can switch registers, and that switch is entirely learnable."
          : "The grammar slipped where a panel would notice. See the Grammarian's list — they're patterns, not one-offs." },
    { k: "pace", v: r.pace, up: "Your pace sat in the range listeners find easy.", down: r.wpm > 170 ? "You're racing. Slow to about 140 words a minute — you'll say less and land more." : "You're speaking slowly enough that attention drifts. Push toward 130–150 words a minute." },
  ].filter((d) => d.v > 0 || r.wc > 12);

  const sorted = dims.slice().sort((a, b) => b.v - a.v);
  const best = sorted[0], worst = sorted[sorted.length - 1];
  return {
    commend: best ? best.up : "You showed up and spoke, which is the part most people skip.",
    recommend: worst ? worst.down : "Speak for longer next time — there wasn't enough to evaluate.",
    timing: timer.verdict,
  };
}
/* ==========================================================================
   CUSTOM CONTENT
   Colleges, clubs and individuals bring their own topics and words. Anything
   added here flows through the identical engine the built-in content uses.
   ========================================================================== */

const STORE_KEY = "yap_library_v1";
const memStore = { data: null };

function loadLibrary() {
  if (memStore.data) return memStore.data;
  let saved = null;
  try { saved = JSON.parse(window.localStorage.getItem(STORE_KEY) || "null"); } catch (e) { saved = null; }
  memStore.data = saved && saved.topics ? saved : { topics: [], words: [], packs: [] };
  return memStore.data;
}

function saveLibrary(lib) {
  memStore.data = lib;
  try { window.localStorage.setItem(STORE_KEY, JSON.stringify(lib)); } catch (e) { /* memory only */ }
  return lib;
}

const uid = () => Math.random().toString(36).slice(2, 9);

/* Bulk paste. Accepts one topic per line, or "topic | category" per line,
   or CSV. Blank lines and a leading header row are ignored. */
function parseTopicBulk(raw, defaultCat) {
  return raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    .filter((l) => !/^(topic|question|prompt)\s*[|,]\s*(category|pool)$/i.test(l))
    .map((line) => {
      const parts = line.split(/\s*[|]\s*|\s*,\s*(?=[A-Za-z& ]+$)/);
      const text = (parts[0] || "").replace(/^["']|["']$/g, "").trim();
      const cat = (parts[1] || defaultCat || "My topics").trim();
      return text ? { id: uid(), text, cat, custom: true } : null;
    }).filter(Boolean);
}

/* Words accept "word | part of speech | meaning | example sentence".
   Only the word is required; everything else degrades gracefully. */
function parseWordBulk(raw) {
  return raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    .filter((l) => !/^word\s*[|]/i.test(l))
    .map((line) => {
      const [w, p, d, e] = line.split(/\s*[|]\s*/);
      const word = (w || "").replace(/[^A-Za-z-]/g, "").trim();
      if (!word) return null;
      return {
        id: uid(), w: word.charAt(0).toUpperCase() + word.slice(1),
        p: (p || "word").trim(), d: (d || "").trim(),
        e: (e || "").trim(), custom: true,
      };
    }).filter(Boolean);
}

/* ---------------- did they actually USE the word? ------------------------
   Detection is not usage. "The word ostensible means fake" mentions it;
   "the ostensible reason was scale" uses it. These checks separate the two
   before any model is consulted, so the judgement holds with no API key. */

const INFLECTIONS = (w) => {
  const b = w.toLowerCase();
  const forms = new Set([b]);
  const stem = b.replace(/(e|y)$/, "");
  [b + "s", b + "es", b + "d", b + "ed", b + "ing", stem + "ed", stem + "ing", stem + "ies",
   stem + "y", b + "ly", b + "ness", b + "ity", b + "ment", b + "ally"].forEach((f) => forms.add(f));
  if (b.endsWith("e")) forms.add(b.slice(0, -1) + "ing");
  if (b.endsWith("y")) forms.add(b.slice(0, -1) + "ies");
  return [...forms];
};

/* Phrases that mean the speaker is talking *about* the word, not with it. */
const MENTION_PATTERNS = [
  (w) => new RegExp(`\\b(the\\s+)?word\\s+["']?${w}`, "i"),
  (w) => new RegExp(`\\b${w}\\s+means\\b`, "i"),
  (w) => new RegExp(`\\bmeaning\\s+of\\s+["']?${w}`, "i"),
  (w) => new RegExp(`\\b${w}\\s+is\\s+(a|an)\\s+(word|adjective|noun|verb|adverb)\\b`, "i"),
  (w) => new RegExp(`\\btoday'?s?\\s+word\\s+(is\\s+)?["']?${w}`, "i"),
  (w) => new RegExp(`\\bthe\\s+word\\s+of\\s+the\\s+day`, "i"),
  (w) => new RegExp(`\\bi\\s+(will|would|am going to|have to)\\s+use\\s+["']?${w}`, "i"),
  (w) => new RegExp(`\\bhow\\s+to\\s+use\\s+["']?${w}`, "i"),
];

function checkWordUsage(word, text) {
  const clean = (text || "").trim();
  const low = clean.toLowerCase();
  const forms = INFLECTIONS(word);
  // \b is ASCII-only, so it fails against an Indic neighbour. Fall back to a
  // lookaround on Latin letters, which works when the word sits inside a
  // Devanagari or Tamil sentence — the common case for a word of the day.
  const hasForm = (f) => new RegExp("\\b" + esc(f) + "\\b", "i").test(low)
    || new RegExp("(?:^|[^a-z])" + esc(f) + "(?:[^a-z]|$)", "i").test(low);
  const hit = forms.find(hasForm);

  if (!hit) {
    return { used: false, natural: false, mention: false, form: null,
      reason: `You didn't say “${word}” at all — not in any form.` };
  }

  const mention = MENTION_PATTERNS.some((mk) => mk(esc(word.toLowerCase())).test(low));

  // Position in the sentence doesn't matter — a word can open a clause. What
  // matters is whether there's a real sentence around it at all.
  const toks = words0(clean);
  const isolated = toks.length < 5;

  // The clause it lives in should be a sentence, not a definition read aloud.
  const unit = segment(clean).find((u) => new RegExp("\\b" + esc(hit) + "\\b", "i").test(u)) || clean;
  const unitWords = (unit.match(/\S+/g) || []).length;
  // hasVerb() only knows English verbs. In another language, a clause of a
  // reasonable length around the word is the honest test we can actually make.
  const nonEnglishClause = INDIC_RANGE.test(unit) ||
    (typeof langProfile === "function" && !langProfile(unit, spokenLangCode()).englishDominant);
  const clauseOk = unitWords >= (nonEnglishClause ? 5 : 6) && (nonEnglishClause || hasVerb(unit));

  if (mention) {
    return { used: true, natural: false, mention: true, form: hit, unit,
      reason: `You named the word rather than using it. “${unit.trim()}” talks about “${word}”; a sentence that uses it wouldn't need to mention the word itself.` };
  }
  if (isolated || !clauseOk) {
    return { used: true, natural: false, mention: false, form: hit, unit,
      reason: `“${word}” appeared, but not inside a working sentence — “${unit.trim()}”. Build a full clause around it: subject, verb, and the word doing a job.` };
  }
  return { used: true, natural: true, mention: false, form: hit, unit,
    reason: `Used inside a real sentence — “${unit.trim()}”.` };
}

/* Local grammatical sanity for the clause the word appeared in. */
function usageGrammar(word, unit) {
  return checkGrammar(unit || "").filter((g) => g.kind === "grammar");
}

const WORD_JUDGE_SYS = `You judge whether a student used a target word correctly and naturally in one spoken sentence. The sentence is a speech-to-text transcript, so ignore punctuation, capitalisation and small transcription slips.
Return ONLY raw JSON:
{"used":true|false,"grammatical":true|false,"natural":true|false,"intended":true|false,
"verdict":"one direct sentence addressed to them as 'you'",
"better":"a stronger version of THEIR OWN sentence keeping their words, topic and tone — or an empty string if theirs is already good"}
Definitions: "used" = the word or a clear inflection appears doing real work, not merely named or defined. "grammatical" = the word's form and the sentence around it are correct. "natural" = a fluent speaker would actually say it this way, not shoehorned in. "intended" = the meaning matches the definition given, not a different sense of the word.
Be fair but strict: naming the word, defining it, or forcing it into an unrelated clause is not a pass. Never rewrite them into a different register — keep their vocabulary level and personality.`;


/* ==========================================================================
   DISCUSSION MEMORY
   The panel used to answer the last line and forget the rest. This keeps a
   running model of the room: who holds what position, which claims and
   examples are on the table, what's been challenged, what nobody answered.
   ========================================================================== */

const CLAIM_MARK = /\b(i think|i believe|my point is|the issue is|the problem is|the real question|i'd argue|i would argue|in my view|the answer is|we should|we need to|it should|has to)\b/i;
const EVIDENCE_MARK = /(\b(for example|for instance|research|study|studies|survey|data|report|according to|percent|per cent|figure|figures|number|numbers|statistics|statistic|case of|look at|evidence|cost|costs|rate|ratio)\b|\b(lakhs?|crores?|thousands?|hundreds?|million|billion)\b|\d|%)/i;
const DISAGREE_MARK = /\b(i disagree|i'd push back|that's not|but that|however|on the contrary|i don't think|that ignores|the problem with that|no,|actually no|i'm not convinced)\b/i;
const AGREE_MARK = /\b(i agree|that's fair|good point|building on|to add to that|exactly|as .* said|picking up on|i'd extend)\b/i;
const QUESTION_MARK = /\?|\b(who|what|why|how|when)\s+(is|are|does|do|would|should|will)\b/i;
const SUMMARY_MARK = /\b(to summarise|to summarize|so far we|we're split|the group seems|let me sum|so the two sides|where we are|so overall)\b/i;
const INVITE_MARK = /\b(what do you think|over to you|would you agree|your view|shall we hear|does anyone)\b/i;

function keyPhrases(line, limit = 4) {
  const toks = words0(line).filter((w) => w.length > 4 && !STOPW.has(w) && !BASIC.has(w));
  const freq = {};
  toks.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  return Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, limit);
}

function readTurn(name, who, line) {
  return {
    who, name, line,
    claim: CLAIM_MARK.test(line),
    evidence: EVIDENCE_MARK.test(line),
    disagrees: DISAGREE_MARK.test(line),
    agrees: AGREE_MARK.test(line),
    asks: QUESTION_MARK.test(line),
    summarises: SUMMARY_MARK.test(line),
    invites: INVITE_MARK.test(line),
    topics: keyPhrases(line),
    namesOthers: ["kavya", "arjun", "meera", "rohit"].filter((n) => new RegExp("\\b" + n + "\\b", "i").test(line)),
  };
}

/* Rebuild the state of the room from the transcript so far. */
function buildMemory(feed) {
  const turns = feed.filter((f) => f.who !== "mod").map((f) => readTurn(f.name, f.who, f.line));
  const positions = {};
  const claims = [];
  const examples = [];
  const challenged = [];
  const unanswered = [];
  const covered = {};

  turns.forEach((t, i) => {
    if (t.claim || t.disagrees) {
      claims.push({ by: t.name, gist: t.line.slice(0, 130) });
      positions[t.name] = t.line.slice(0, 130);
    }
    if (t.evidence) examples.push({ by: t.name, gist: t.line.slice(0, 110) });
    if (t.disagrees && i > 0) challenged.push({ by: t.name, against: turns[i - 1].name });
    if (t.asks) {
      const answered = turns.slice(i + 1).some((n) => n.topics.some((x) => t.topics.includes(x)));
      if (!answered) unanswered.push({ by: t.name, gist: t.line.slice(0, 110) });
    }
    t.topics.forEach((x) => { covered[x] = (covered[x] || 0) + 1; });
  });

  const humanTurns = turns.filter((t) => t.who === "me");
  const lastHuman = humanTurns[humanTurns.length - 1] || null;
  const humanAddressed = lastHuman
    ? turns.slice(turns.indexOf(lastHuman) + 1).some((t) => t.topics.some((x) => lastHuman.topics.includes(x)))
    : true;

  const repeated = Object.entries(covered).filter(([, n]) => n >= 3).map(([w]) => w);

  return { turns, positions, claims, examples, challenged, unanswered,
    lastHuman, humanAddressed, repeated, covered };
}

/* The memory, written out for the model as a briefing rather than a transcript. */
function memoryBrief(mem, topic) {
  const L = [];
  L.push(`TOPIC: ${topic}`);
  if (Object.keys(mem.positions).length) {
    L.push("POSITIONS ON THE TABLE:");
    Object.entries(mem.positions).forEach(([who, gist]) => L.push(`  ${who}: ${gist}`));
  }
  if (mem.examples.length) {
    L.push("EVIDENCE ALREADY CITED (do not repeat these):");
    mem.examples.slice(-3).forEach((e) => L.push(`  ${e.by}: ${e.gist}`));
  }
  if (mem.challenged.length) {
    const c = mem.challenged[mem.challenged.length - 1];
    L.push(`OPEN DISAGREEMENT: ${c.by} pushed back on ${c.against}.`);
  }
  if (mem.unanswered.length) {
    L.push("QUESTIONS NOBODY HAS ANSWERED:");
    mem.unanswered.slice(-2).forEach((q) => L.push(`  ${q.by}: ${q.gist}`));
  }
  if (mem.repeated.length) {
    L.push(`ALREADY WELL COVERED, MOVE PAST IT: ${mem.repeated.slice(0, 5).join(", ")}.`);
  }
  if (mem.lastHuman) {
    L.push(`THE HUMAN'S LAST POINT (${mem.lastHuman.name}): "${mem.lastHuman.line}"`);
    L.push(mem.humanAddressed
      ? "  — someone has already responded to it."
      : "  — NOBODY HAS RESPONDED TO THIS YET. Your line must engage with it directly: agree and extend, or push back on the specific thing they said. Do not change the subject.");
  }
  return L.join("\n");
}

/* ==========================================================================
   GD CONTRIBUTION SCORING
   Speaking time is the least interesting thing about a group discussion.
   ========================================================================== */

function scoreContribution(myLines, feed, floorShare, entries, blocked, firstEntry, roundSeconds) {
  const mine = myLines.join(" ");
  const myTurns = myLines.map((l) => readTurn("You", "me", l));
  const others = feed.filter((f) => f.who !== "me" && f.who !== "mod");
  const othersText = others.map((f) => f.line).join(" ");
  const otherTopics = new Set(keyPhrases(othersText, 40));

  // A single agreeable sentence can be 100% novel and 100% responsive by ratio.
  // Substance scales every ratio by how much was actually contributed.
  const myWords = words0(mine).length;
  const substance = Math.min(1, myWords / 60);

  const myTopics = keyPhrases(mine, 40);
  const novel = myTopics.filter((w) => !otherTopics.has(w));
  const originality = myTopics.length ? Math.round((novel.length / myTopics.length) * 100 * substance) : 0;

  const responsive = myTurns.filter((t) => t.namesOthers.length || t.agrees || t.disagrees).length;
  const responsiveness = myTurns.length ? Math.round((responsive / myTurns.length) * 100 * substance) : 0;

  const reasoned = myTurns.filter((t) => /\b(because|since|therefore|thus|hence|so|which means|as a result|otherwise|given that)\b/i.test(t.line)).length;
  const evidenced = myTurns.filter((t) => t.evidence).length;
  const reasoning = myTurns.length ? Math.round(((reasoned + evidenced) / (myTurns.length * 2)) * 100) : 0;

  const builds = myTurns.filter((t) => t.agrees).length;
  const pushes = myTurns.filter((t) => t.disagrees).length;
  const constructive = pushes > 0 && myTurns.filter((t) => t.disagrees && /\b(because|since|so|however|the evidence|for example|instead|whereas)\b/i.test(t.line)).length;
  const buildOn = myTurns.length ? Math.round(((builds + (constructive ? pushes : 0)) / myTurns.length) * 100 * substance) : 0;

  const leads = myTurns.filter((t) => t.summarises || t.invites).length;
  const leadership = Math.min(100, leads * 45 + (firstEntry !== null && firstEntry < 60 ? 25 : 0));

  const ideas = findRepeatedIdeas(mine);
  const repetition = Math.max(0, 100 - ideas.length * 22);

  const timing = firstEntry === null ? 0
    : Math.max(0, Math.round(100 - Math.max(0, firstEntry - 30) * 0.8 - blocked * 12));

  const contribution = Math.min(100, Math.round(
    (Math.min(floorShare, 35) / 35) * 45 + Math.min(entries, 5) / 5 * 55
  ));

  const overall = Math.round(
    (originality * 0.15 + responsiveness * 0.2 + reasoning * 0.2 + buildOn * 0.13 +
     leadership * 0.1 + repetition * 0.07 + timing * 0.08 + contribution * 0.07)
  );

  return { originality, responsiveness, reasoning, buildOn, leadership, repetition, timing,
    contribution, overall, substance: Math.round(substance * 100), myWords,
    novel: novel.slice(0, 6), builds, pushes, leads,
    repeatedIdeas: ideas.slice(0, 3) };
}

function contributionNotes(c, myLines) {
  const notes = [];
  if (myLines.length === 0) return [{ k: "Silent", v: "You didn't speak. Nothing here can be scored, and in a real room that's the same as not attending." }];
  if (c.originality < 30) notes.push({ k: "Originality", v: "Almost everything you said was already on the table. Repeating the room's consensus reads as safe rather than useful — bring the angle nobody has taken." });
  else if (c.originality > 60) notes.push({ k: "Originality", v: `You brought new ground into the discussion${c.novel.length ? ` — ${c.novel.slice(0, 3).join(", ")}` : ""}. That's what a panel remembers.` });
  if (c.responsiveness < 35) notes.push({ k: "Responsiveness", v: "You spoke into the room rather than to it. Name the person you're answering and quote the phrase you're responding to — it instantly reads as listening." });
  else if (c.responsiveness > 65) notes.push({ k: "Responsiveness", v: "You engaged with what others actually said rather than delivering prepared lines." });
  if (c.reasoning < 40) notes.push({ k: "Reasoning", v: "Your points arrived as assertions. Attach one “because” and one concrete example to each and they become arguments." });
  if (c.buildOn < 30 && c.pushes === 0) notes.push({ k: "Disagreement", v: "You never disagreed with anyone. Constructive pushback — the point, then why, then what you'd do instead — scores higher than agreement in every GD rubric." });
  if (c.leads === 0) notes.push({ k: "Leadership", v: "Nobody summarised the split or brought a quiet member in. That role is unclaimed in most rooms and it's the cheapest way to stand out." });
  if (c.repetition < 70) notes.push({ k: "Repetition", v: `You circled back to the same idea${c.repeatedIdeas.length ? ` (“${c.repeatedIdeas[0].phrase}”)` : ""}. Once is a point; twice is filling time.` });
  return notes.slice(0, 4);
}


/* ------------------------------- HELPERS --------------------------------- */

const pick = (a) => a[Math.floor(Math.random() * a.length)];

const STAGES = [
  { at: 0, name: "Guest", note: "You haven't spoken yet." },
  { at: 1, name: "Member", note: "First meeting done." },
  { at: 3, name: "Regular", note: "It's becoming a habit." },
  { at: 6, name: "Club veteran", note: "You've stopped dreading the mic." },
  { at: 10, name: "Table Topics master", note: "People can hear the difference." },
  { at: 18, name: "Distinguished", note: "You speak like someone who practises." },
];
const stageFor = (n) => STAGES.slice().reverse().find((s) => n >= s.at) || STAGES[0];

/* Word of the Day is stable for a calendar day — same word all session. */
function wordOfTheDay(custom) {
  const deck = [...(custom || []), ...VOCAB];
  const d = new Date();
  const seed = d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate();
  return deck[seed % deck.length];
}

function usedWord(word, text) {
  const stem = word.toLowerCase().slice(0, Math.max(4, word.length - 4));
  return new RegExp("\\b" + stem, "i").test(text || "");
}

function renderMarked(text, fillers) {
  if (!text) return null;
  const parts = text.split(/(\s+)/);
  const map = new Map();
  let wi = 0;
  parts.forEach((t, i) => { if (/\S/.test(t)) { map.set(wi, i); wi++; } });
  const cls = {};
  fillers.forEach((f) => {
    const n = f.phrase.split(" ").length;
    for (let k = 0; k < n; k++) {
      const idx = map.get(f.index + k);
      if (idx !== undefined) cls[idx] = f.kind === "hedge" ? "hed" : "fil";
    }
  });
  return parts.map((t, i) => <span key={i} className={cls[i]}>{t}</span>);
}

function storedKey() {
  try { return window.localStorage.getItem("yap_key") || ""; } catch (e) { return ""; }
}

function proxyUrl() {
  try { return window.localStorage.getItem("yap:proxy") || ""; } catch (e) { return ""; }
}

/* ==========================================================================
   MULTILINGUAL LAYER
   YAP's analysis was built English-first: the word-sanity check, the filler
   banks, the grammar rules and the vocabulary list all assumed English. That
   made a Hindi or Tamil speaker look "unintelligible" to the engine, which is
   the worst possible failure for this audience.

   Nothing below replaces the existing engine. It gates the English-only parts
   so they only run on English, and supplies the equivalents for everything
   else. An English-only session behaves exactly as it did before.
   ========================================================================== */

const LANGUAGES = [
  { code: "auto",  label: "Detect automatically", native: "Auto", script: null },
  { code: "en-IN", label: "English",   native: "English",  script: "latin" },
  { code: "hi-IN", label: "Hindi",     native: "हिन्दी",     script: "deva" },
  { code: "bn-IN", label: "Bengali",   native: "বাংলা",     script: "beng" },
  { code: "gu-IN", label: "Gujarati",  native: "ગુજરાતી",   script: "gujr" },
  { code: "kn-IN", label: "Kannada",   native: "ಕನ್ನಡ",     script: "knda" },
  { code: "ml-IN", label: "Malayalam", native: "മലയാളം",   script: "mlym" },
  { code: "mr-IN", label: "Marathi",   native: "मराठी",     script: "deva" },
  { code: "od-IN", label: "Odia",      native: "ଓଡ଼ିଆ",      script: "orya" },
  { code: "pa-IN", label: "Punjabi",   native: "ਪੰਜਾਬੀ",     script: "guru" },
  { code: "ta-IN", label: "Tamil",     native: "தமிழ்",     script: "taml" },
  { code: "te-IN", label: "Telugu",    native: "తెలుగు",     script: "telu" },
];
const LANG_BY_CODE = LANGUAGES.reduce((m, l) => ((m[l.code] = l), m), {});
const langName = (code) => (LANG_BY_CODE[code] || {}).label || "your language";

/* Unicode blocks, so a word in an Indian script is never mistaken for noise. */
const SCRIPTS = [
  ["deva", /[\u0900-\u097F]/], ["beng", /[\u0980-\u09FF]/], ["guru", /[\u0A00-\u0A7F]/],
  ["gujr", /[\u0A80-\u0AFF]/], ["orya", /[\u0B00-\u0B7F]/], ["taml", /[\u0B80-\u0BFF]/],
  ["telu", /[\u0C00-\u0C7F]/], ["knda", /[\u0C80-\u0CFF]/], ["mlym", /[\u0D00-\u0D7F]/],
];
const ANY_INDIC = /[\u0900-\u0DFF]/;
const isIndicToken = (w) => ANY_INDIC.test(w);

/* Romanised Indic that people genuinely type and say. Without this the sanity
   check reads "bilkul", "yaar", "matlab" as invented words and the speaker is
   told their speech wasn't English — which is true, and beside the point. */
const ROMAN_INDIC = new Set(("aap aapka accha acha achha adhik agar ainvayi aise aisa ajeeb ajj andar apna apne arre asal ata bas basically bahut bahot bana banda bandi bata batao bhai bhaiya bhi bhool bilkul bohot boht bola bolo bura chahiye chal chalo chhota cheez chinta college crore dekh dekha dekho desi dhang dhyan dikkat dil dimag din dost dukan ek ekdum fir ghar gussa haan hai hain hamara hamare hi hoga hona hone hota hoti huh humein idhar isliye issue itna jaana jab jaisa jaise jaldi jana jaruri jarurat jee jo jyada kaafi kaam kabhi kaise kaisa kal kam kar karna karo karta karte kaun kaunsa kya kyun kyunki lag laga lagta lekin log logon lekhin matlab mein mera mere mil mila mujhe na nahi nahin nai nako nikal padha padhai paisa par pata phir pura raha rahe raho rakh sab sahi samajh samay sath shuru sirf sochna soch tab tak thoda theek tum tumhara udhar upar us usko vaise vo waha wahan woh yaar yaani yahan ye yeh zyada zaroori "
  + "naan naanga neenga enna epdi seri appuram romba illa vanakkam thambi anna akka ipo appo enakku unakku ellam kekka paaru vaa po nalla kastam "
  + "nenu meeru enti ela sare tarvatha chala ledu vasthunna cheppu kastam bagundi ekkada eppudu adi idi "
  + "naanu neevu yenu hege sari ashtu illa channagide yaake elli "
  + "njan ningal entha engane sheri valare illa ariyilla "
  + "ami tumi ki kemon bhalo na aache hoy ekhon "
  + "mi tu kay kasa bara nahi ahe ata "
  + "hu tame shu kem saras nathi che "
  + "main tusi ki kiven changa nahi hai hun").split(/\s+/).filter(Boolean));

/* Crutch words are language-specific. "Matlab" is Hindi's "like". Every entry
   here is a word that is *only* a discourse crutch — it carries no ordinary
   lexical meaning of its own, so flagging it unconditionally never mistakes
   a real word for a filler. "toh" is the one exception: it also chains an
   "agar" ("if") clause as a genuine conjunction, so that one case is excluded
   in findFillers instead of being pulled out of the dictionary. */
const FILLERS_BY_LANG = {
  "hi-IN": ["matlab", "yaani", "arre", "toh", "bas", "na", "kya bolun", "समझे", "मतलब", "यानी", "अरे", "तो", "बस"],
  "mr-IN": ["mhanje", "arre", "म्हणजे", "अरे"],
  "bn-IN": ["mane", "jani", "মানে", "মানে কি"],
  "gu-IN": ["etle", "matlab", "એટલે", "મતલબ"],
  "ta-IN": ["appuram", "அப்புறம்"],
  "te-IN": ["ante", "అంటే"],
  "kn-IN": ["andre", "ಅಂದ್ರೆ"],
  "ml-IN": ["ennu vachal", "athayat", "അതായത്"],
  "pa-IN": ["matlab", "ਮਤਲਬ"],
  "od-IN": ["mane", "ମାନେ"],
};
const ALL_INDIC_FILLERS = [...new Set(Object.values(FILLERS_BY_LANG).flat())];

/* Words that are fillers in one breath and ordinary vocabulary in the next:
   "accha"/"achha" is also the adjective "good", "haan" is also the literal
   answer "yes", "sari"/"sare"/"seri"/"sheri" ("okay/correct") double as a
   genuine agreement. None of these carry a fixed meaning on their own the way
   "matlab" or "arre" do, so counting every occurrence penalised a speaker for
   using an ordinary word. They only count as a filler when they sit next to
   another filler-type word — the pattern of an actual hesitation cluster
   ("accha... matlab... woh kya bolte hain") rather than a sentence that
   happens to contain "good" or "yes" or "okay". See findFillers. */
const AMBIGUOUS_FILLERS_BY_LANG = {
  "hi-IN": ["acha", "achha", "accha", "haan"],
  "ta-IN": ["seri", "சரி"],
  "te-IN": ["sare", "avunu", "సరే"],
  "kn-IN": ["sari", "ಸರಿ"],
  "ml-IN": ["sheri", "ശരി"],
};
const ALL_AMBIGUOUS_INDIC = [...new Set(Object.values(AMBIGUOUS_FILLERS_BY_LANG).flat())];

/* What language is this, really? Reads the text rather than trusting a
   setting, because code-mixing is the normal case, not the exception. */
function langProfile(text, declared) {
  const raw = (text || "");
  const tokens = raw.split(/\s+/).filter(Boolean);
  if (!tokens.length) return { primary: declared && declared !== "auto" ? declared : "en-IN",
    scripts: [], indicShare: 0, romanShare: 0, codeMix: 0, mixed: false, tokens: 0 };

  const scripts = SCRIPTS.filter(([, re]) => re.test(raw)).map(([s]) => s);
  const words = raw.toLowerCase().match(/[\p{L}']+/gu) || [];
  const indic = words.filter(isIndicToken).length;
  const roman = words.filter((w) => !isIndicToken(w) && ROMAN_INDIC.has(w)).length;
  const english = words.length - indic - roman;

  const indicShare = words.length ? indic / words.length : 0;
  const romanShare = words.length ? roman / words.length : 0;
  const nonEnglish = indicShare + romanShare;

  let primary = declared && declared !== "auto" ? declared : "en-IN";
  if (!declared || declared === "auto") {
    if (scripts.length) {
      const hit = LANGUAGES.find((l) => l.script === scripts[0] && l.code !== "auto");
      primary = hit ? hit.code : "hi-IN";
    } else if (nonEnglish > 0.25) primary = "hi-IN";     // romanised, script unknown
  }

  // code-mixing is a feature of how people speak, not an error
  const codeMix = Math.round(Math.min(nonEnglish, 1 - nonEnglish) * 200);
  return {
    primary, scripts, tokens: words.length,
    indicShare: Math.round(indicShare * 100),
    romanShare: Math.round(romanShare * 100),
    englishShare: Math.round((english / Math.max(1, words.length)) * 100),
    codeMix, mixed: codeMix >= 25,
    englishDominant: nonEnglish < 0.25,
  };
}

/* --------------------------- Groq, same-origin -------------------------- */
/* Groq's key lives server-side (app/api/groq/*), so the browser only ever
   talks to our own /api routes — never api.groq.com directly. English only
   for now; Indian languages stay on the Sarvam path below until that's
   wired up separately. */

const groqReady = () => true;   // the key lives on the server; failures are caught per-call

/** Re-transcribe a recorded clip with Whisper Large v3 (via Groq). This is
 *  the accurate pass that replaces the English-only, often-garbled live
 *  Web Speech caption once the recording finishes. */
async function groqTranscribe(blob) {
  const fd = new FormData();
  fd.append("file", blob, "speech.webm");
  const res = await fetch("/api/groq/transcribe", { method: "POST", body: fd });
  if (!res.ok) throw new Error("groq stt " + res.status);
  const j = await res.json();
  return { text: String(j.text || "").trim(), language: j.language || "en-IN" };
}

/** The evaluating AI — commends, recommends, judges vocab usage, plays the
 *  panel in Group Discussion, and so on. Same JSON-in, JSON-out contract as
 *  askClaude so every existing call site keeps working unchanged. */
async function groqChat(system, user, maxTokens = 900) {
  const res = await fetch("/api/groq/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user, max_tokens: maxTokens }),
  });
  if (!res.ok) throw new Error("groq chat " + res.status);
  const j = await res.json();
  const txt = String(j.content || "").replace(/```json|```/g, "").trim();
  return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
}

/* --------------------------- Sarvam, same-origin -------------------------- */
/* Sarvam's key lives server-side (app/api/sarvam/*), mirroring the Groq setup
   above — the browser only ever talks to our own /api routes, never
   api.sarvam.ai directly. */

function sarvamBase() { return "/api/sarvam"; }
const sarvamReady = () => true;   // the key lives on the server; failures are caught per-call

async function sarvamTranscribeOnce(blob, langCode, { translate = false, mode = "verbatim", timestamps = false } = {}) {
  const base = sarvamBase();
  if (!base) throw new Error("no-proxy");
  const fd = new FormData();
  fd.append("file", blob, "speech.webm");
  if (!translate) {
    fd.append("mode", mode);
    fd.append("language_code", langCode && langCode !== "auto" ? langCode : "unknown");
    if (timestamps) fd.append("with_timestamps", "true");
  }
  const res = await fetch(base + (translate ? "/sttTranslate" : "/stt"), { method: "POST", body: fd });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`sarvam ${res.status}: ${body.slice(0, 300)}`);
  }
  const j = await res.json();
  return {
    text: String(j.transcript || "").trim(),
    language: j.language_code || null,
    confidence: typeof j.language_probability === "number" ? j.language_probability : null,
    timestamps: j.timestamps || null,
    mode: j.mode || mode,
  };
}

/* Duration via a plain <audio> element — cheap, no need to decode samples
   just to find out whether splitting is even necessary. */
function clipDuration(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(audio.duration || 0); };
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    audio.src = url;
  });
}

function writeAsciiString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

/* Mono 16-bit PCM WAV — the simplest format Sarvam accepts, and simple
   enough to hand-encode without a library. */
function encodeWav(samples, sampleRate) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buf);
  writeAsciiString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeAsciiString(view, 8, "WAVE");
  writeAsciiString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);          // PCM
  view.setUint16(22, 1, true);          // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAsciiString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);
  let o = 44;
  for (let i = 0; i < samples.length; i++, o += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}

/* Sarvam's synchronous speech-to-text endpoint hard-caps a request at 30
   seconds of audio ("use the batch API for longer files") — but Table
   Topics alone runs up to 5 minutes, so anything past a Table Topic's
   shortest slot was 400ing outright with no transcript at all. Decode the
   tape once and cut it into sub-30s pieces so every mode keeps working
   regardless of length; the cuts land on fixed timestamps rather than
   silences, so an occasional word is split across a chunk boundary — a much
   smaller cost than losing the whole take. */
async function splitIntoChunks(blob, chunkSeconds = 25) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  try {
    const audioBuffer = await ctx.decodeAudioData(await blob.arrayBuffer());
    const sr = audioBuffer.sampleRate;
    const chunkLen = Math.floor(chunkSeconds * sr);
    const mono = audioBuffer.numberOfChannels === 1
      ? audioBuffer.getChannelData(0)
      : (() => {
          const chans = Array.from({ length: audioBuffer.numberOfChannels }, (_, i) => audioBuffer.getChannelData(i));
          const out = new Float32Array(audioBuffer.length);
          for (let i = 0; i < out.length; i++) {
            let sum = 0; for (const c of chans) sum += c[i];
            out[i] = sum / chans.length;
          }
          return out;
        })();
    const parts = [];
    for (let start = 0; start < mono.length; start += chunkLen) {
      parts.push(encodeWav(mono.subarray(start, Math.min(start + chunkLen, mono.length)), sr));
    }
    return parts;
  } finally {
    ctx.close().catch(() => {});
  }
}

/** Transcribe a recorded clip. Returns the words in the language they were
 *  spoken in — YAP analyses the original, never a translation.
 *
 *  Mode matters more than it looks. Sarvam's default "transcribe" normalises
 *  the audio into tidy prose, which quietly deletes the filler words the
 *  Ah-Counter exists to count. "verbatim" keeps every "um", "matlab" and false
 *  start, so the coaching is about what was actually said. */
async function sarvamTranscribe(blob, langCode, opts = {}) {
  const dur = await clipDuration(blob);
  if (!dur || dur <= 28) return sarvamTranscribeOnce(blob, langCode, opts);

  const chunks = await splitIntoChunks(blob);
  const results = await Promise.all(
    chunks.map((c) => sarvamTranscribeOnce(c, langCode, opts).catch(() => null))
  );
  const ok = results.filter(Boolean);
  if (!ok.length) throw new Error("sarvam: every chunk failed");
  return {
    text: ok.map((r) => r.text).filter(Boolean).join(" ").trim(),
    language: ok.find((r) => r.language)?.language || null,
    confidence: ok.find((r) => typeof r.confidence === "number")?.confidence ?? null,
    timestamps: null,
    mode: ok[0].mode,
  };
}

/* ---- Sarvam-105B: the better writer when the reply is going out in an
   Indian language. Claude stays the default for English. --------------- */

async function sarvamChat(system, user, maxTokens = 900) {
  const base = sarvamBase();
  if (!base) throw new Error("no-proxy");
  const res = await fetch(base + "/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_tokens: maxTokens, temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error("sarvam chat " + res.status);
  const j = await res.json();
  const txt = String(j.content || "").replace(/```json|```/g, "").trim();
  return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
}

/* ---- Bulbul: role-players with voices. -------------------------------- */

/* Distinct voices per panellist, so a group discussion sounds like a room
   rather than one narrator reading four parts. */
const VOICE_FOR = {
  kavya: "manisha", arjun: "abhilash", meera: "vidya", rohit: "karun",
  interviewer: "arya", moderator: "anushka", coach: "anushka",
};

async function sarvamSpeak(text, { language = "en-IN", speaker = "anushka", pace } = {}) {
  const base = sarvamBase();
  if (!base) throw new Error("no-proxy");
  const res = await fetch(base + "/tts", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language_code: language, speaker, pace }),
  });
  if (!res.ok) throw new Error("sarvam tts " + res.status);
  const j = await res.json();
  const chunks = j.audios || [];
  if (!chunks.length) return null;
  // base64 wav chunks -> one playable blob
  const bytes = chunks.map((b64) => {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  });
  return URL.createObjectURL(new Blob(bytes, { type: "audio/wav" }));
}

/* One shared player so two panellists can never talk over each other. */
const speech = { audio: null, url: null, token: 0 };
function stopSpeaking() {
  speech.token += 1;
  if (speech.audio) { try { speech.audio.pause(); } catch (e) { /* already stopped */ } }
  if (speech.url) { URL.revokeObjectURL(speech.url); speech.url = null; }
}
async function speakAs(who, text, language) {
  if (!sarvamReady() || !text) return false;
  const mine = ++speech.token;
  try {
    const url = await sarvamSpeak(text, { language: language || replyLangCode(),
      speaker: VOICE_FOR[who] || "anushka" });
    if (!url || mine !== speech.token) { if (url) URL.revokeObjectURL(url); return false; }
    stopSpeaking(); speech.token = mine;
    speech.url = url;
    speech.audio = new Audio(url);
    await speech.audio.play().catch(() => {});
    return true;
  } catch (e) { return false; }
}

async function sarvamTranslate(text, from, to) {
  const base = sarvamBase();
  if (!base) throw new Error("no-proxy");
  const res = await fetch(base + "/translate", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: String(text).slice(0, 900), source_language_code: from || "auto",
      target_language_code: to, model: "sarvam-translate:v1", mode: "formal",
    }),
  });
  if (!res.ok) throw new Error("sarvam " + res.status);
  const j = await res.json();
  return String(j.translated_text || j.output || "").trim();
}

async function sarvamTransliterate(text, from, to) {
  const base = sarvamBase();
  if (!base) throw new Error("no-proxy");
  const res = await fetch(base + "/transliterate", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: String(text).slice(0, 900),
      source_language_code: from || "auto", target_language_code: to }),
  });
  if (!res.ok) throw new Error("sarvam " + res.status);
  const j = await res.json();
  return String(j.transliterated_text || j.output || "").trim();
}

function replyLangCode() {
  try { return window.localStorage.getItem("yap:replyLang") || "en-IN"; } catch (e) { return "en-IN"; }
}

/* One place to tell the model both halves of the language question: what it is
   reading, and what it should write. Before this it was only ever told the
   second, so a Hindi transcript arrived with no explanation and the model was
   free to treat it as broken English. */
function languageDirective(spoken) {
  const reply = replyLangCode();
  const heard = spoken && spoken !== "auto" ? spoken : null;
  const lines = [];

  if (heard && heard !== "en-IN") {
    const h = langName(heard);
    lines.push(`WHAT YOU ARE READING: this transcript is ${h}, or ${h} mixed with English. It is not broken English and must never be treated as an error, a typo, or something to correct. Judge the ideas, the structure and the delivery — never the choice of language.`);
    lines.push(`Do not comment on English grammar, English word choice or English idiom. Those rules do not apply here. If you would have made a point about English usage, make a point about clarity or structure instead.`);
  }

  if (reply && reply !== "en-IN") {
    const r = langName(reply);
    lines.push(`WRITE YOUR REPLY IN ${r.toUpperCase()}: every field VALUE, including short labels. Natural spoken ${r}, not translated-sounding ${r}.`);
    lines.push(`The JSON keys in the schema above are not part of the reply — keep every key exactly as given, in English, unchanged, with the exact same structure (same nesting, same arrays). Only the text inside the values moves to ${r}.`);
    lines.push(`If the speaker mixed ${r} with English, mix the same way they did — that is how they actually talk, and flattening it into pure ${r} or pure English would misrepresent them.`);
    lines.push(`Quote their own words verbatim, in whatever language they said them. Never translate a quotation.`);
  } else if (heard && heard !== "en-IN") {
    lines.push(`Write your reply in English, but quote their words verbatim in ${langName(heard)} — never translate a quotation.`);
  }

  return lines.length ? "\n\n" + lines.join("\n") : "";
}

/* Which model should write the coaching? Claude for English, Sarvam-105B when
   the reply is going out in an Indian language — it is native to those
   languages and reads far less like a translation. */
function preferSarvamWriter() {
  try {
    if (window.localStorage.getItem("yap:writer") === "claude") return false;
  } catch (e) { /* default below */ }
  const r = replyLangCode();
  return sarvamReady() && r && r !== "en-IN";
}

async function askClaude(system, user, maxTokens = 900, spoken) {
  if (preferSarvamWriter()) {
    try {
      return await sarvamChat(system + languageDirective(spoken || spokenLangCode()), user, maxTokens);
    } catch (e) { /* fall through to Claude rather than losing the feature */ }
  }
  const proxy = proxyUrl();
  const key = storedKey();
  // Groq is the default evaluator: the key lives on the server, so this works
  // out of the box with nothing to type in. An explicitly configured Claude
  // proxy/key is a deliberate choice and takes priority over that default.
  if (!proxy && !key) {
    try {
      return await groqChat(system + languageDirective(spoken || spokenLangCode()), user, maxTokens);
    } catch (e) { /* fall through to Claude rather than losing the feature */ }
  }
  const headers = { "Content-Type": "application/json" };
  // a proxy keeps the key on the server, which is the only safe option once
  // this is on a real domain; the browser key stays as a local-only fallback
  if (!proxy && key) {
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }
  const res = await fetch(proxy || "https://api.anthropic.com/v1/messages", {
    method: "POST", headers,
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTokens,
      system: system + languageDirective(spoken || spokenLangCode()),
      messages: [{ role: "user", content: user }] }),
  });
  if (!res.ok) throw new Error("api " + res.status);
  const data = await res.json();
  const t = data.content.filter((c) => c.type === "text").map((c) => c.text).join("\n").replace(/```json|```/g, "").trim();
  return JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
}

const EVAL_SYS = `You are the General Evaluator at a Toastmasters-style meeting, reviewing a student's impromptu answer in India. You are reading a speech-to-text transcript: no punctuation, no capitals — never mention either.
Return ONLY raw JSON:
{"structure":"one sentence on how the speech was organised — did it open with a position, build a case, and close, or just wander","flow":"one sentence on how ideas moved from one to the next — smooth transitions, or abrupt jumps a listener has to bridge themselves","content":"one sentence on the substance offered — real reasons and examples, or mostly restating the question","language":"one sentence on how clear and precise the language was — could a listener follow it first-time, or did it need re-reading","coverage":"one sentence on how much of the topic they actually covered — one angle only, or several sides of it","commend":"one specific thing that worked, quoting their words, 1-2 sentences","recommend":"the single change that would most improve the next speech, 1-2 sentences, concrete","vocab":[{"weak":"phrase they used","better":"stronger alternative","why":"under 10 words"}]}
Max 3 vocab items. Warm but not soft — a real evaluator commends first, then gives one recommendation they can act on tomorrow. Address them as "you". Every field must be grounded in what they actually said — quote or paraphrase specifics, never generic praise or generic criticism.`;

/* ==========================================================================
   MICROPHONE
   Rewritten against MIC-FIXES.md. Three jobs, kept separable:
     1. permission + stream (with explicit constraints and a device choice)
     2. metering + silence, calibrated to the room's own noise floor
     3. transcription, with confidence captured and restarts guarded
   Audio is now retained, so a verdict can always be checked against the tape.
   ========================================================================== */


/* Like usePersisted but usable before the store section is defined. */
function usePersistedRef(key, initial) {
  const [v, setV] = useState(() => {
    try { const raw = window.localStorage.getItem("yap:" + key); return raw == null ? initial : JSON.parse(raw); }
    catch (e) { return initial; }
  });
  const set = useCallback((next) => {
    setV(next);
    try { window.localStorage.setItem("yap:" + key, JSON.stringify(next)); } catch (e) { /* memory only */ }
  }, [key]);
  return [v, set];
}

const MIC_LANGS = [
  { id: "auto", label: "Detect automatically" },
  { id: "en-IN", label: "English (India)" },
  { id: "en-US", label: "English (US)" },
  { id: "en-GB", label: "English (UK)" },
  { id: "en-AU", label: "English (Australia)" },
  // Indian languages, transcribed by Sarvam when a proxy is configured
  { id: "hi-IN", label: "हिन्दी · Hindi" },
  { id: "bn-IN", label: "বাংলা · Bengali" },
  { id: "gu-IN", label: "ગુજરાતી · Gujarati" },
  { id: "kn-IN", label: "ಕನ್ನಡ · Kannada" },
  { id: "ml-IN", label: "മലയാളം · Malayalam" },
  { id: "mr-IN", label: "मराठी · Marathi" },
  { id: "od-IN", label: "ଓଡ଼ିଆ · Odia" },
  { id: "pa-IN", label: "ਪੰਜਾਬੀ · Punjabi" },
  { id: "ta-IN", label: "தமிழ் · Tamil" },
  { id: "te-IN", label: "తెలుగు · Telugu" },
];

function useMic() {
  const [sandboxed] = useState(() => { try { return window.self !== window.top; } catch (e) { return true; } });
  const [secure] = useState(() =>
    typeof window === "undefined" ? false :
    window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1");
  const [canRecord] = useState(() =>
    typeof window !== "undefined" && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  const [canTranscribe] = useState(() =>
    typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition));

  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);        // non-fatal: recording works, transcription doesn't
  const [speaking, setSpeaking] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [level, setLevel] = useState(() => new Array(22).fill(0));
  const [clip, setClip] = useState(null);            // {url, blob, seconds}
  const [sarvam, setSarvam] = useState(null);        // {state, text, language}
  const sarvamRef = useRef(null); sarvamRef.current = sarvam;
  const sarvamPendingRef = useRef(false);
  // MediaRecorder.stop() is async under the hood — the native "stop" event
  // (and the onstop handler that decides whether an accuracy pass even
  // starts) can land a tick or more later. settled() must span that gap too,
  // or it resolves before sarvamPendingRef has ever been set.
  const recorderStoppingRef = useRef(false);
  const finalTextRef = useRef("");
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = usePersistedRef("micDevice", "");
  const [lang, setLang] = usePersistedRef("micLang", "auto");
  const langRef = useRef(lang); langRef.current = lang;

  const rec = useRef(null), stream = useRef(null), ctx = useRef(null), raf = useRef(null);
  const recorder = useRef(null), chunks = useRef([]);
  const session = useRef(0);
  const fin = useRef(""), want = useRef(false), voiced = useRef(0);
  const restarts = useRef(0), lastRestart = useRef(0);
  const confidences = useRef([]);
  const floor = useRef(0.02), calibrating = useRef(true);
  const levelRef = useRef(new Array(22).fill(0));
  const startedAt = useRef(0);
  const hardStop = useRef(false);

  /* ---- transcript quality, so the app can tell "you were unclear" from
         "the recogniser failed" (MIC-FIXES #3) ---- */
  const confidence = useCallback(() => {
    const c = confidences.current.filter((x) => typeof x === "number" && x > 0);
    if (!c.length) return null;
    return c.reduce((a, b) => a + b, 0) / c.length;
  }, []);

  const stop = useCallback(() => {
    want.current = false;
    setListening(false); setSpeaking(false);
    /* detach handlers before stopping: an in-flight instance whose events fire
       after teardown must never write into the refs a new session reuses —
       that's how two overlapping recognisers used to corrupt a transcript */
    if (rec.current) {
      rec.current.onresult = null; rec.current.onerror = null; rec.current.onend = null;
      try { rec.current.stop(); } catch (e) { /* already stopped */ }
    }
    if (recorder.current) {
      // onstop is deliberately left attached: it's what turns the tape into a
      // blob and kicks off the accuracy pass, and that has to run on the
      // ordinary "recording finished" stop, not just survive it. A stale
      // instance's onstop is guarded by the session token instead (below),
      // so it can't write into a new session's refs.
      recorder.current.ondataavailable = null;
      if (recorder.current.state !== "inactive") {
        recorderStoppingRef.current = true;
        try { recorder.current.stop(); } catch (e) { recorderStoppingRef.current = false; }
      }
    }
    cancelAnimationFrame(raf.current);
    if (stream.current) stream.current.getTracks().forEach((t) => t.stop());
    if (ctx.current && ctx.current.state !== "closed") ctx.current.close().catch(() => {});
    stream.current = null; ctx.current = null; rec.current = null; recorder.current = null;
    levelRef.current = new Array(22).fill(0);
    setLevel(levelRef.current);
  }, []);

  /* ---- device list (MIC-FIXES #8) ---- */
  const refreshDevices = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter((d) => d.kind === "audioinput")
        .map((d, i) => ({ id: d.deviceId, label: d.label || `Microphone ${i + 1}` })));
    } catch (e) { /* needs permission first; harmless */ }
  }, []);

  useEffect(() => {
    if (!canRecord) return;
    const on = () => refreshDevices();
    try { navigator.mediaDevices.addEventListener("devicechange", on); } catch (e) { /* older browsers */ }
    return () => { try { navigator.mediaDevices.removeEventListener("devicechange", on); } catch (e) { /* noop */ } };
  }, [canRecord, refreshDevices]);

  /* ---- permission state, so we can tell "not asked" from "blocked" (#11) ---- */
  const permissionState = useCallback(async () => {
    try {
      const st = await navigator.permissions.query({ name: "microphone" });
      return st.state;                       // granted | prompt | denied
    } catch (e) { return "unknown"; }
  }, []);

  const start = useCallback(async ({ record = true } = {}) => {
    // a caller that starts a new take without stopping the last one used to
    // leave the old recognizer running, so both wrote into the same refs and
    // the transcript came back duplicated or interleaved (Camera Practice's
    // "another take" was the clearest case of this)
    if (want.current || rec.current || recorder.current || stream.current) stop();
    session.current += 1;
    const mySession = session.current;
    setError(null); setNotice(null);
    fin.current = ""; finalTextRef.current = ""; setFinalText(""); setInterim("");
    // a previous take's multilingual result must never be scored on this one
    sarvamRef.current = null; sarvamPendingRef.current = false; setSarvam(null);
    voiced.current = 0; restarts.current = 0; confidences.current = [];
    chunks.current = []; hardStop.current = false;
    calibrating.current = true; floor.current = 0.02;
    setClip(null);

    if (!canRecord) {
      setError(sandboxed
        ? "The preview frame blocks the microphone — that's the frame, not your settings. Run this on localhost, or write your answer instead."
        : "This browser can't reach a microphone. Write your answer instead and everything is still scored.");
      return false;
    }
    if (!secure) {
      setError("Microphones only work over https or on localhost. Opening the file directly (file://) blocks them.");
      return false;
    }
    if ((await permissionState()) === "denied") {
      setError("Microphone access is blocked for this site. Open the padlock in your address bar, allow the microphone, then reload.");
      return false;
    }

    /* explicit constraints rather than `audio: true` (#7) */
    const constraints = {
      audio: {
        echoCancellation: true, noiseSuppression: true, autoGainControl: true,
        channelCount: 1,
        ...(deviceId ? { deviceId: { ideal: deviceId } } : {}),
      },
    };

    let s;
    try {
      s = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      const name = e && e.name;
      setError(
        name === "NotAllowedError" ? "You'll need to allow the microphone. Tap the padlock in the address bar, allow it, and start again."
        : name === "NotFoundError" ? "No microphone found. Plug one in or check it isn't disabled in your system settings."
        : name === "NotReadableError" ? "Another app is holding the microphone. Close Zoom, Meet or your recorder and try again."
        : sandboxed ? "The preview frame blocks the microphone. Run this on localhost to record."
        : "Couldn't open the microphone. Check permissions and try again.");
      return false;
    }
    stream.current = s;
    refreshDevices();

    /* warn about the Bluetooth call profile, which wrecks recognition */
    try {
      const st = s.getAudioTracks()[0] && s.getAudioTracks()[0].getSettings();
      if (st && st.sampleRate && st.sampleRate <= 16000) {
        setNotice("Your headset is in call mode, which lowers audio quality a lot. The phone's own mic will transcribe far better.");
      }
    } catch (e) { /* getSettings unsupported */ }

    /* ---- retain the audio (#1) ---- */
    if (record && typeof MediaRecorder !== "undefined") {
      try {
        const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported(m));
        recorder.current = new MediaRecorder(s, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
        recorder.current.ondataavailable = (e) => { if (e.data && e.data.size) chunks.current.push(e.data); };
        recorder.current.onstop = () => {
          // the handler has now run and settled() no longer needs to wait on
          // this account — whether or not it goes on to start an accuracy
          // pass is decided below, via sarvamPendingRef
          recorderStoppingRef.current = false;
          // guards against a stale recorder's stop event landing after a new
          // session has already begun (see the comment on `stop`, above)
          if (session.current !== mySession) return;
          if (!chunks.current.length) return;
          const blob = new Blob(chunks.current, { type: chunks.current[0].type || "audio/webm" });
          const secs = Math.round((Date.now() - startedAt.current) / 1000);
          setClip({ url: URL.createObjectURL(blob), blob, seconds: secs });
          // Web Speech has already given an instant preview. Re-transcribe the
          // tape for accuracy: Whisper Large v3 (via Groq) for English, and
          // Sarvam for Indian languages once that proxy is configured.
          const isEnglish = langRef.current === "auto" || /^en-/.test(langRef.current);
          const reread = blob.size <= 2000 ? null
            : isEnglish ? groqTranscribe(blob).then((r) => (r.text
                ? { state: "done", text: r.text, language: r.language, source: "groq" }
                : { state: "empty" }))
            : sarvamReady() ? sarvamTranscribe(blob, langRef.current).then((r) => (r.text
                ? { state: "done", text: r.text, language: r.language,
                    confidence: r.confidence, mode: r.mode, source: "sarvam" }
                : { state: "empty" }))
            : null;
          if (!reread) return;
          sarvamPendingRef.current = true;
          setSarvam({ state: "working" });
          reread
            .then((next) => { sarvamRef.current = next; setSarvam(next); })
            .catch((err) => {
              // surfaced only in devtools — the UI just says "unavailable",
              // but this is what actually broke, for whoever's debugging it
              console.error("[YAP] accuracy pass failed:", err);
              sarvamRef.current = { state: "failed" }; setSarvam({ state: "failed" });
            })
            .finally(() => { sarvamPendingRef.current = false; });
        };
        recorder.current.start(1000);
      } catch (e) { /* recording is a bonus, never a blocker */ }
    }

    /* ---- metering ---- */
    const AC = window.AudioContext || window.webkitAudioContext;
    const c = new AC(); ctx.current = c;
    if (c.state === "suspended") { try { await c.resume(); } catch (e) { /* needs a gesture */ } }
    const an = c.createAnalyser();
    an.fftSize = 1024; an.smoothingTimeConstant = 0.7;
    c.createMediaStreamSource(s).connect(an);
    const time = new Uint8Array(an.fftSize);
    const freq = new Uint8Array(an.frequencyBinCount);

    startedAt.current = Date.now();
    let last = performance.now();
    let lastPaint = 0;
    let onFor = 0, offFor = 0, on = false;
    const calibUntil = performance.now() + 600;        // sample the room first (#5)
    const floorSamples = [];

    const loop = () => {
      an.getByteTimeDomainData(time);
      let sum = 0;
      for (let i = 0; i < time.length; i++) { const v = (time[i] - 128) / 128; sum += v * v; }
      const rms = Math.sqrt(sum / time.length);

      const now = performance.now();
      if (calibrating.current) {
        floorSamples.push(rms);
        if (now > calibUntil) {
          floorSamples.sort((a, b) => a - b);
          const median = floorSamples[Math.floor(floorSamples.length / 2)] || 0.01;
          floor.current = Math.max(0.008, median);
          calibrating.current = false;
        }
      }

      /* hysteresis: different thresholds to start and stop, so it doesn't chatter */
      const onGate = floor.current * 2.6 + 0.006;
      const offGate = floor.current * 1.7 + 0.003;
      const dt = now - last; last = now;
      if (!on && rms > onGate) { onFor += dt; if (onFor > 120) { on = true; offFor = 0; } }
      else if (on && rms < offGate) { offFor += dt; if (offFor > 220) { on = false; onFor = 0; } }
      else { if (on) offFor = 0; else onFor = 0; }
      if (on) voiced.current += dt / 1000;

      /* paint at ~20Hz, not 60, and only touch React when it changes (#6) */
      if (now - lastPaint > 50) {
        lastPaint = now;
        an.getByteFrequencyData(freq);
        const bars = [];
        for (let i = 0; i < 22; i++) {
          const v = freq[Math.floor((i / 22) * (freq.length * 0.35))] / 255;
          bars.push(v);
        }
        levelRef.current = bars;
        setLevel(bars);
        setSpeaking(on);
      }
      raf.current = requestAnimationFrame(loop);
    };
    loop();

    /* ---- transcription ---- */
    if (!canTranscribe) {
      setNotice("This browser records but can't transcribe live — Chrome or Edge can. Your audio is still saved.");
      setListening(true);
      return true;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = lang === "auto" ? "en-IN" : lang; r.maxAlternatives = 3;

    r.onresult = (ev) => {
      let itr = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i];
        if (res.isFinal) {
          const text = res[0].transcript.trim();
          if (typeof res[0].confidence === "number") confidences.current.push(res[0].confidence);
          /* de-duplicate across a restart boundary (#4): a repeated tail used to
             be appended twice and then scored as the user repeating themselves */
          const tail = fin.current.trim().slice(-Math.max(20, text.length));
          if (text && !tail.endsWith(text)) fin.current += text + " ";
          finalTextRef.current = fin.current; setFinalText(fin.current);
        } else itr += res[0].transcript;
      }
      setInterim(itr);
    };

    r.onerror = (ev) => {
      const kind = ev.error;
      if (kind === "not-allowed" || kind === "service-not-allowed") {
        hardStop.current = true;
        setError("Microphone access was blocked mid-session. Allow it for this site and start again.");
      } else if (kind === "audio-capture") {
        hardStop.current = true;
        setError("The microphone disappeared — check it's still connected.");
      } else if (kind === "network") {
        setNotice("Live transcription lost its connection. Your audio is still being recorded.");
      }
      /* "no-speech" and "aborted" are normal; they must not surface as errors */
    };

    r.onend = () => {
      if (!want.current || hardStop.current) return;
      const now = Date.now();
      if (now - lastRestart.current > 10000) restarts.current = 0;   // healthy stretch, reset
      if (restarts.current >= 8) {
        setNotice("Live transcription keeps dropping out. The recording is still running.");
        return;
      }
      const delay = Math.min(2000, 120 * Math.pow(2, restarts.current));   // backoff, no tight loop
      restarts.current += 1; lastRestart.current = now;
      setTimeout(() => {
        if (!want.current || hardStop.current) return;
        try { r.start(); } catch (e) { /* already starting */ }
      }, delay);
    };

    rec.current = r; want.current = true;
    try { r.start(); } catch (e) { /* already running */ }
    setListening(true);
    return true;
  }, [canRecord, canTranscribe, secure, sandboxed, deviceId, lang, permissionState, refreshDevices, stop]);

  /* ---- mobile lifecycle: don't silently die when the screen locks (#10) ---- */
  useEffect(() => {
    const onHide = () => {
      if (!want.current) return;
      setNotice("Recording paused when you left the app. Everything you'd said is kept.");
    };
    document.addEventListener("visibilitychange", () => { if (document.hidden) onHide(); });
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    // capability
    supported: canRecord && canTranscribe, canRecord, canTranscribe, sandboxed, secure,
    // state
    listening, error, notice, level, speaking, finalText, interim, clip, sarvam,
    /* Whatever the browser heard live. Kept for the running caption. */
    /* The truest record we have. Web Speech is English-first, so when Sarvam
       has re-read the tape its version wins — that is the whole point of the
       multilingual pass, and it has to be what gets scored, not a nicety
       shown in a side panel. */
    bestText: () => {
      const sv = sarvamRef.current;
      const live = (finalTextRef.current || "").trim();
      if (sv && sv.state === "done" && sv.text) {
        // trust Sarvam unless it heard far less than the live pass did, which
        // usually means a truncated upload rather than a better reading
        const svWords = (sv.text.match(/\S+/g) || []).length;
        const liveWords = (live.match(/\S+/g) || []).length;
        if (svWords >= liveWords * 0.5) return { text: sv.text, source: sv.source || "sarvam", language: sv.language };
      }
      return { text: live, source: "live", language: null };
    },
    /* Resolves once Sarvam has finished, so a report never scores the weaker
       transcript just because the upload was still in flight. Also spans the
       gap between mic.stop() returning and MediaRecorder's own async "stop"
       event actually landing — without that, this used to resolve before
       sarvamPendingRef was ever set, and the accuracy pass never got waited
       on at all. */
    settled: (ms = 6000) => new Promise((resolve) => {
      const pending = () => recorderStoppingRef.current || sarvamPendingRef.current;
      if (!pending()) return resolve();
      const started = Date.now();
      const tick = setInterval(() => {
        if (!pending() || Date.now() - started > ms) {
          clearInterval(tick); resolve();
        }
      }, 120);
    }),
    transcript: (finalText + " " + interim).trim(),
    voicedSeconds: () => voiced.current,
    confidence,
    // controls
    devices, deviceId, setDeviceId, lang, setLang, langs: MIC_LANGS,
    refreshDevices, permissionState, start, stop,
  };
}


/* Counts up, not down — a Toastmasters timer shows time used. */
function useStopwatch(limit, onLimit) {
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const cb = useRef(onLimit); cb.current = onLimit;
  const val = useRef(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setT((v) => {
        const nv = v + 1; val.current = nv;
        if (nv >= limit) { clearInterval(id); setRunning(false); setTimeout(() => cb.current && cb.current(nv), 0); }
        return nv;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, limit]);
  return {
    t, running, value: () => val.current,
    start: () => { val.current = 0; setT(0); setRunning(true); },
    stop: () => setRunning(false),
    reset: () => { val.current = 0; setRunning(false); setT(0); },
  };
}

/* ==========================================================================
   ICONS — drawn, not borrowed.
   Emoji render differently on every OS and never match a typeface. This is one
   consistent stroke system: 1.7 weight, round caps, 24-unit grid.
   ========================================================================== */

const ICON_PATHS = {
  mic: (
    <>
      <rect x="9" y="2.6" width="6" height="11.2" rx="3" />
      <path d="M5.5 11.2a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.7V21" />
      <path d="M8.6 21h6.8" />
      <path d="M9.6 6.1h4.8M9.6 8.6h4.8" opacity=".5" />
    </>
  ),
  wave: (
    <>
      <path d="M3 12h1.6" /><path d="M7.2 8.2v7.6" /><path d="M10.4 5v14" />
      <path d="M13.6 9.4v5.2" /><path d="M16.8 6.6v10.8" /><path d="M20 10.6v2.8" />
    </>
  ),
  hand: (
    <>
      <path d="M8.4 11V5.6a1.6 1.6 0 0 1 3.2 0V11" />
      <path d="M11.6 10.6V4.4a1.6 1.6 0 0 1 3.2 0v6.2" />
      <path d="M14.8 11V6.4a1.6 1.6 0 0 1 3.2 0V14a7 7 0 0 1-7 7 7 7 0 0 1-7-7v-2.2a1.6 1.6 0 0 1 3.2 0V14" />
    </>
  ),
  chat: (
    <>
      <path d="M20.4 13.2a3.4 3.4 0 0 1-3.4 3.4H8.6L4 20.4V6.4A3.4 3.4 0 0 1 7.4 3h9.6a3.4 3.4 0 0 1 3.4 3.4z" />
      <path d="M8.6 8.8h6.8M8.6 12h4.2" opacity=".55" />
    </>
  ),
  arrow: <path d="M4.6 12h14M13 6.4l5.6 5.6-5.6 5.6" />,
};

function Icon({ name, size = 22, stroke = 1.7, className, style }) {
  const p = ICON_PATHS[name];
  if (!p) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true" focusable="false">
      {p}
    </svg>
  );
}

/* Numbers that climb. A score that lands instantly is data; a score that
   climbs is feedback you watch happen. */
function useCountUp(target, ms = 900, go = true) {
  const [v, setV] = useState(0);
  const reduced = useRef(false);
  useEffect(() => {
    try { reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* default */ }
  }, []);
  useEffect(() => {
    if (!go) return;
    if (reduced.current) { setV(target); return; }
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, go]);
  return v;
}


/* YAP's mascot. Five moods plus the mark and wordmark, embedded so the app
   stays one file. */
const YAP_ART = {
  encouraging: "data:image/png;base64,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",
  excited: "data:image/png;base64,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",
  focused: "data:image/png;base64,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",
  happy: "data:image/png;base64,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",
  logo: "data:image/png;base64,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",
  thinking: "data:image/png;base64,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",
};

const YAP_HEAD = {
  encouraging: "data:image/png;base64,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",
  excited: "data:image/png;base64,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",
  focused: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAMAAABmmnOVAAAB/lBMVEUiHlgmIGEdGSYoI2JqXKeGadtoZKSomtcmIVdmVMqkoahbV2Simq5sXJuclqVUTHZpWaIRDy2hkbGHY5WontWnpetfH217e/ZgWHBsM6xQNp0yKqugY6lHNpL/AP/b1d5EO3XQo7zV0NozJImoos51IPdWNspHNZBYUXSEdKY5JYeqYvv/f/+EZ87CtdbP0NQQEjlzYciFd5Y3Kon//wAsT1pEM3TysP/W0tU7O+5eGgBKShLCusoA//+PeXCDb8eZownBu8IAfwAAf/8A/wBDLXllWc5/v39//wB///+qAP+qqn+q/1X/AAAAAADPxtPq5euThu1URrGupfZqWMlFNpeUhqijmPOHeOZ1ZdQrJHPEuMnh2uSkmLE1K4ewpbpNOqbc1eTY0dv59/g7MY8iHGe5s/iIeaf///+bkvG1qsNzZ5K8ssTCufeEd5l3aK5qWo0AAH0qKjRoRbIbF1jNx/MlJTZmTMp/f3/Rq8kAAP96ZuMKBTYpJFBSRpKdka0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUicMoAAAAgHRSTlOiDBrl8fgS5131ExmcY1zmmlzo96MGDgJRDu0GDp0B2O7+puRgA/1kmJxjCAKr4BaSsVWwAQxmBGoEBQutASx7CHcCAgGXbwQCAgMGAwEA/f39/f39/f39/f37/f38/Pz8/f39/fv9/AH9/fv8/fz6+QIV+/T8Nv0C/gH9DS76+wHuoA8AABQFSURBVHja7ZvnY9pKs8aFJIroOO4lzonTT5KT5PRy33J7XUCWKAKEaAaDjXEMB8c4+F+/M7sSCCyKnZtvdxLbmCL99Mzs7MxqzZFlbH339e7urueKLGcP1+CbJxB+8qTQbBaCfw8HPIT4/TPfzy0+5A8baw32qLHmX4bh8ls4ZdjrPQQ7Ojrt5Xvxx2H45Hf3hthY+5lK4fF4ApRjoR4gw+4qnD99nEwmj9PwqFfKJ/Z/CZCG/14QP/hBBM+Tl6vUgk88eJLLBQz8ajKdRACwdNrUo1TafzJLjPkQ63BVH1a96TQe6+j06Ohw9QnoYbnHyRVbJOxNZjJJRpFmEEBxeJpIPAYl7wwBvg25M2hUWLys0yPvqmfGscBeExJOJjMmRNIGgWJUHvsdPzkP4jUJvHFnstmse3xlcLxeLgyB5/gJwHuTzFjYyaTFwCBOe4mS3+mTsyGuXoMM7iy1EQVzS88bILuXTsrxbzJuBwiKAN4El/gd4mImxMOfgUFRFAvCdAmLs148TBob0x9xkXUJhBszJMdxecogepX9wO0xMgvifzyMwaSwjmvJe9oDiin3eta23gyUCQhTCcZArZf4wz/9wZkQW+SDW7kYUVhSjJ3cC05RXH1LQgPFTjwKTArR61GKUiJMloT4lgQe9LcvLkSLYiyF5eXSKmnY46JBQln63sEtCKTo9ZACgqO0f0sKZ4jGQ88bZftClmVliuJ4HGqlIPE3bAPjW3d29M5pCEZBIU4TfydLQeDAuEAGRmE5ZEIKuLywbbxdkTfucfw4QJixeXSUjwemKGa4IyD1tymDbDlkMCUFPfYHnChMIUxnZDMOEOYYZRCnt6LCEWIDhAAGY0QxGZtjiLcewgbqDnEpfWeItJWsjhgDRgW/hDtAWkWWVcO45ZApilPv78wjv7qiijQDYpy4wfBBrxQm/7YIwkUCyoWsAoRhd8g4Ng/HFKs7a8wZFsMsCIbBHkBINxZBeMhflQtDVe1S2INzLAU8egLHW9/6UTSdMRGXNIxtwlnW83rI5XyI3xrkvYIMsylMhOPj5DFMI54NGpV2CIvi2JGiNzWPcU7Jcst9wSBUBjGimIbA87ghyjzSFEPGrsQtiqNeeDFEyG0yWFKIkxTsqGmEyAwykud1dMTAhvI0xDQF5PyFEFHFgrCksGthSUEhBnDabFaSRxAmhd0btzmOFkJgqBvzKUwpjpMwcyuyJMk2iEzGbYuJ4wmKNKJjSeKdGB6OEC/HSlgOGSUt0yFMCoQQJVG2Q2QVCSNEcWemtUgfWj+XgXjgHkOMpKByIAVqMVZCkWQbg4wSDsHwc0o2M46KCZiFEFcbxG2HYBSqruuarlfpoU0pAAImTnkEoci62qnfFNFu6p2hrsrZSSmYHd8DAqyqaUIk0umIEU3TjewYIsMgKIOkDtvFeDmfQMvHc4W2qBrKbSkgThZDPCVuZQKiqmvDVjtVKBRuUu1WRNMvMjR305hQaLgAgzFM5cp5hmByFOtDQ85MI4AdLoT4lUj9C/P09FvtUStVKDZPcrncCQjd7ghqFrUYQSjoinrOTmBhiKpJgePk2LL0wsCcyBNVcEWkDQi5XJwZgKQiupRBnY8phKRkFbGwP81QgX/5eGooZdKsLUVLLgkBBauybYyk0DopiLWTEQRyFFoavUCmBDKc5EvTOlSoAYWcnLRlIHYBwpw7qlVVi6RSReYLRlAul8rxYltQMyaEkpXFXBnCwZEiEa+ryt0hMGNeMIqqqj+CiJyGAIpmO6K6KYSiGB14qTRLikSuhSE0QZFeXQRxSXbdF9vWuGilbhBiTFFGilI5V+hUZUgTiqy24sgwQwmgKA6NzCTE4Sq2rctO5To4ozAJwSjy+XihJUAG04c3yOAEYUmRv+WQdHQRRIC4JFMJVRMZhN0flAJOCWK0W62beBkZ8Ilb/mAYiURuKE9KkQwtmkVxBuszKVAITFKOUjADBHSP+bszBUgxGRVpz8PdBRB+EhWx0KXD04RwkgIv3oxUBuEgBWKAFGp/UgkP2V1YbT+HahvnQ6E9CWGnKDEdyuVyeZ4U1PZbdn/A/B9Cry/owFwiHaO6UAeIFRPCJgXTAv7Bz7hJkbc85ESRGvsjkxGVzOHqXxprtyE+8vYGm0FoEYQwI7M5rUWZIoylKJmpwoniZJgdM8juw/TRKr9xfguC5yfaQOjJDRYSI3806fxhD09kGDmnBL5JJOLhoJMWcSt3ZzJZOQtFADYsa7cgricgnl9cTEPA/LESDnpzcbsY5ZEqpQScfB8XboNO/mgZtO5kDLRrWvWMFpycIFzkJ0EFhmptEqK5icvFK3FbYIxpSvvleBAQeP9KonQbom6YC2qynDSbQf+oC3OAePpw90J4BBA6QKwwCEpReEkjOrwa9JbjU5Z4TDY/ErIeCpYT4BqnyKQMYjXLiv9EZfW/G7MhPCTaF3wwQvVuZ2UlNaYoFFJRNrCC+WmIePBHkDD8B4RFySlhFNQMXeBU1azJ0OuNliluQ2xBljA0bu/CACXGEJSiWEwFw4HAh9wthvhJMBpciSfyM9JWESCSmWRWl2nRma/AAAkGfpg1Oraw99GFf7m4UC2IEQWmi+LKigMDNZzjZ2SLoorlcVKuYv2dPKqcglO8nn+YzhN/mjniP/8de58uBxBCxIS4GUFgjRXPzaJgA8UpYzUxJpIZXaUQiRJ8S66uzYL4mYSbfcOovYuCEo9MiJEUZsbKzcDAqQRyuUOBwyBEqAqTx8nDyiH45tD7tDEDAirMt1BiatxPF0bthdcGgQyFm5ti7mQGRCke/OD/EPQCx63hcWPQsNRF1KOUd3sz6cr+ziyIp+R52r0NI8MnXmjcBESz8PJPwgeChYlpZOSI/NtNdohg/HZUpKC4ykiargwgNhKH3mSyVHn74yyIX8krt1c11Nq7vQuYwLypUVA0C+ZJQgUnKcr7u+S7y0YgGHa9iOdxJrFDiAY062JNh15tkE54wRmVSpDMgtghr/pHMI/DIJWrgmhCUCmgHFqHMRT+brPoRIGrLwESrFQee4I4UCcwOnJGyoiCCnWxdJoAn/QqFf9MiDWyJh1mt2GQxrZVoTOCuCms8PSWz+PEvv9l/FZwlt/ihNQgXiilvnNhG2KPzvJQyQwGnKBCp+TOn0IKL1XKsyF2iV/yeg2A4L83ao+soACM0D82cGF/Hy6VZ9Fph8iHcdn8koQTlX0/pNTSxBCJq9nBQOK6KrRK7sSh252BtM3fStsWxD+v/e29+0je1jnyytC1lHcEQbOsn4RLlSckeGuI9KypOfwY3hii9TdQ0AIjn2ga2exAASUMuZ+pJCUpk0iEyc+zIOBQq9Lh2UFV4Mm2WjubgoBr9YQvSbQ5NULKcc+4YNslm3HmDxirWIAlRBkgRK6Gix3uihd+ObXdqbgNcXn1F2XgPdBBij2jNrRDXI4qr/CJAwR/iZSNRoM3IdgsAp6JD6VsVoq+qxlg2UqyD+1riGyQmRCQKaLPDmVd12IuWdfqqTqDaIYJu9fTuPQTP4PI2WPC1rlcbsbHTQFwNFUFLj4U06C5NZRE8tkzKQrjcA7Ejxv8QcZ9UNVACrXbSdUZRTEYsOa4xuVL5g4bReIXf8zXoLeyCQZmeVSAQ9GVknE1aY/XdF2Vn50mJOk9cV3OgwCZfBdpHf3xHMZHyqQoFAKxF7+QH65Qj2BumqK8TyLxX7AsI4HG+tsRBK2ARZBfkb4n2Deqz5R8YjVg7wOdIMgV8XnFgypHtrZ14Qwg6kwK0oxjZPobnpUTswewSbEaKnXefYaiCBhhTmfNCHzF8wU1i53zAc9h82o867/8m3MbaIcAyrBX17TP5JVai9TrJkUh9F2I7F6C4sHmqBOxUQRjgib44DjheN7qAhCi3JJxBUHWuZiGFOqridZnFgQEZ0jVISjWaQNkYYwnD9YONSdjM/E4EONi/GYQe2Qoyku4kgGSNIe4uCrKmubzaZrGuSZvI9ogXJ/Jue35c/KZ02s+kEJ4xCDa7ZVCcSW0ubkZNCuc5vQQSZQeg+Xy8dwntFyc1cNndE1aVjXNRfjPEN1Pr8hSEOD6332CwLu29S6NigdgdNGGVrwmBCOwRSekSKiBc58YBXuuoFIGuar7JlYlloAg608J74PeWK1pFgRisCKLUeRywTDrhyamEUbwydQoN5QVXII3qtz65bnLdX4XCHjqCmf2Pb07TFkQD1J2iiAL8XBwsuLLffONiYGRcWZkFVyCN7ZdVx5yRyXwOde5i+wcaELHYngwUfji+VeCTwhZidsrz0/foFF35HIFVWTL38YrW468AwTrCT/rNe3Bgw4Y+qNdH2EUgyu08PX+kZs0EwIfFq27BIYP89giiFlv2iHP9a5QP+swjLaFQbWgXjnJnZjjxLJPDAGeFauMQfWRnauFEJ99zkqgFnta91H9rNXqdFpgInCYleeoH2lSG6M0P8FjeKaljnTYImQZiOvZ7zIpTAOMlXEBbPVm0wZdY8sY6fCQfBnE+RUvAMVZCx1icYimHDcFG4fZpDVZ95zqQFeNMoAO6+dfAMHjh89dn2FWEMSWzdptC2MEwoKE2Q1MvkNcGceb3XNichkInvBsQSvGcTEuMjYxInbQL3U7x411frSWoA+5iKhThvMvgIjxrFv/nQcLsOY9hsYJHPco0kFB6haHzSDDdjRd5WLtiH7ggumQ3B/CPPGkXV8TntqLVoT6hU6xjAS/18/qZ2eioKmqFnshagKZNy7uMjqsCAUb//Zfm0KExcdZfWxnYOILTld1XXgnRmpq1DNj2ronxC1vPUKCM/GMUYgWgo/D+5caF1kRVGnwPrDhXx7CdTeE8wbhOmdTFo1yHFetarWaxnFiq4qbv6JkbcnAnDV3zDEXiQ1FEYWA/2eSGA2FfBCyFKFWE2KRtmDQW7lPrjxfE8Ln46LUfD5fLObjvq9Wq1CcgumcS+xocnZA7yzgHskvgGjMg/jMYf6Ak6MJOgAggV6FqFRjL+qCDv0GQqy6Hi4F8fHzXcMSIYSaxq4bjCLAD9xpcOaNxjotvE2dxd0D6dB4IXsuxJ/O2zw9c6YeF8xsIwZ6enOngzdX3BRT7Xx8yPYOpL381RdARKPA4fc7O4UnPoEhVCf2OJylvCdxeou4h5suIDSPQ/PG3lyIc+KRozzrPmcUPJzlAPs2i1aqGGcLJJWeualkdZ4/5kI8/C2aTUWh1QhMtUw2MbSqbbcJs2ErVYCeg1E0M9ZdL8+9IDbIVseLt2aLK8EZgwzy1QhBkiVWRamtegoXftli5ugm5Nq9IK7Inhv6YFpCB509AqnCjAWp3+9LjEGHGb6duinGKcQhg4jeUwlCRDc2XUgBbaizQ2KaQRGwy+ozBt0XaqWapj8ShwO6j/uv94W4voAOFPdv5E4e8GTdOSgEvHzKQClw9uSjNydla+nukN1tCd0bAsa6aa2Xm44bxs8JZ+7CGrgzWQoBM1edOrFMF5ebbAtYaE5ZsRBipd2CYIdSfiXgnMJjKhVi4M4nTgd9aHuh6MKWFTDwJmHCy3Y/ecjGPSGGqbYVFLli2GmAQL7SESLr7lUqlTQuAAhcrFPHjUA5ehvGjUtFSpQ0frhnYHJ1bLgK9EZLwfGPAWDSE2RJyiq4nFw5BQhB8HEqG6O0O2abB0MzG9EFEC7iE9utNluVKMC1OOX/S8IZUt/tLiGEV5Gr4I3asJ5iDLl43cDNeXvLNT+OSrjEOnQXYgsarsKsmCAxoa8MDpGh51ZkXYAWRWvRQdUsnhRoPt3jG+S+EFfEdYbjQ8RgB4gZf+KiKbheXqkkkkrfqGpQV3UFmMdp+Q1Fhq6/WrbQdVQiQDYxKsDBJ7ngx/9wlvQaID6hEDlFMQxaWNUE4RHtkeAR53Ph5SwFcc07vbxLNqH5q6duUtH1WXPYtSAmqRAZRcJbujrTIiJ0uzVNXieLEBZCAMX6C1EUXwRmH4Ln1LcoxKGiyKgEk6L7SOhqWlXxzMi0d4Ggh8CXLlkFerlzPlmKQpfaVY+gfim5EUJlEIgBlZ8uKwHS+HII4vJsEL/fY1so2OF5lwv+g+3wMaitDjBJeN2KZINgBa8sBeYOzmUh4OoD42Hh4n+beGOsC0Fo9HB4Qs5GCLPiBoQqzCnRZSpmzpaAF9rVQ7J3wNls73ux6fV6MVF5B4rMIKq08q5WcX0EINbuAPFxCQjIoa902l3BF1ytajxzm9vKTt04j+OOpCozVuvMT9dz99TMgdjapj0eg6gach9TJdTVGJWUgULAD7bBWeTv5I4lIdbtECBFn86eMH2aOlhGGaTse9edIK6Xgbjc4Pd0zYKgFJKSPj3N9Pt4i20kg2ptYY6Sf7pTYC7Z+T23QdA91M+kZ8+eGfZoYH0Q/RuD50t12XeEWCc/qdrYIdh8qaYGutkLmjHJtt17yNXXUMK3jRAaJTH7UBPA/M0cm2gDcZ2QrwHx8cBKiLUxxihJsjRpMiiDKPkaELjQPT4jTRhazcZjQrCSTsn+68I1s3tCcLbL1mrdbldAYz/N5GFBKM/x716/BsRPdggNTs5x5koN1g+YRi1vKO/n1flfBPHZWhdhM1W3ayUYfgxhKhH9+PSrxARcGmf6Hk3ThC5M6rjKeu7iusJkTITIV4LYIT6tNoKAzAVK0NzsCvi6XXxhNDpEz9XW14EgVy5hTAEQ3Eer2uE5OkZoshJFWQ4tuzx7dwi4Zqq7xhLUiAES9EdOYJ6i6yZ7rh3y9SAgBt+xogbq+ckXYJzQVUX94HsfeXj1NSFmTUpXeFbeh0aXvMhXVYJcn1+7XOv05u2kp66tJ3bWlz/aPSHmRQy1O33k/x7iHvb/EJb9L/eoqvaXD4s2AAAAAElFTkSuQmCC",
  happy: "data:image/png;base64,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",
  thinking: "data:image/png;base64,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",
};

/* Moods, chosen so the mascot reacts to what actually happened rather than
   being decoration. Every appearance below is tied to a real state. */
/* YAP has five expressions. Everywhere in the app already asks for a mood by
   feeling, so this maps those requests onto the five without touching callers. */
const MOOD_MAP = {
  happy: "happy", focused: "focused", thinking: "thinking",
  excited: "excited", encouraging: "encouraging", logo: "logo",
  // legacy names still used across the app
  wave: "happy", cool: "excited", curious: "thinking", confused: "thinking",
  worried: "thinking", gloomy: "thinking", panic: "thinking", shocked: "excited",
  annoyed: "focused", teach: "focused", inspect: "focused", smug: "encouraging",
};

function Mascot({ mood = "happy", size = 72, className, style, alt, head }) {
  const m = MOOD_MAP[mood] || "happy";
  // below about 56px the full body loses its face, so swap to the head crop
  const useHead = head !== undefined ? head : size <= 56;
  const src = (useHead && YAP_HEAD[m]) || YAP_ART[m] || YAP_HEAD[m] || YAP_ART.happy;
  return (
    <img src={src} width={size} height={size} className={"masc " + (className || "")}
      style={style} alt={alt || ""} aria-hidden={alt ? undefined : "true"} draggable="false" />
  );
}

/* Pick the face that matches a score. */
const moodForScore = (n) => n >= 82 ? "excited" : n >= 65 ? "happy" : n >= 48 ? "encouraging" : n >= 30 ? "thinking" : "focused";


/* -------------------------------- PIECES --------------------------------- */

function Grass({ level, live }) {
  return (
    <>
      <div className="grass" aria-hidden="true">
        {level.map((v, i) => <div key={i} className={"blade" + (live ? "" : " idle")} style={{ height: `${Math.max(9, v * 100)}%` }} />)}
      </div>
      <div className="soil" aria-hidden="true" />
    </>
  );
}

function Plant({ reps, size = 74 }) {
  const i = STAGES.indexOf(stageFor(reps));
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" role="img" aria-label={stageFor(reps).name}>
      <rect x="6" y="50" width="48" height="7" rx="3" fill="#6b4a2f" />
      {i === 0 && <ellipse cx="30" cy="47" rx="6" ry="4.5" fill="#8a6a45" stroke="#f4f1ff" strokeWidth="2" />}
      {i >= 1 && <path d="M30 50 L30 34" stroke="#7a5cf0" strokeWidth="3.5" strokeLinecap="round" />}
      {i >= 1 && <path d="M30 40 q-10 -3 -12 -11 q11 0 12 11z" fill="#7ec96a" stroke="#f4f1ff" strokeWidth="1.6" />}
      {i >= 2 && <path d="M30 36 q10 -3 12 -12 q-11 1 -12 12z" fill="#7ec96a" stroke="#f4f1ff" strokeWidth="1.6" />}
      {i >= 3 && <path d="M30 34 L30 22" stroke="#7a5cf0" strokeWidth="3.5" strokeLinecap="round" />}
      {i >= 3 && <path d="M30 26 q-12 -4 -14 -13 q13 1 14 13z" fill="#5fb85a" stroke="#f4f1ff" strokeWidth="1.6" />}
      {i >= 4 && <><circle cx="30" cy="17" r="7" fill="#ffc857" stroke="#f4f1ff" strokeWidth="2" /><circle cx="30" cy="17" r="2.6" fill="#ff7a63" /></>}
      {i >= 5 && <><circle cx="16" cy="24" r="5" fill="#e56ad0" stroke="#f4f1ff" strokeWidth="2" />
        <circle cx="44" cy="24" r="5" fill="#56c8f5" stroke="#f4f1ff" strokeWidth="2" /></>}
    </svg>
  );
}

function Petals({ go }) {
  const bits = useMemo(() => {
    if (!go) return [];
    const cols = ["#ff7a63", "#ffc857", "#7ec96a", "#56c8f5", "#e56ad0"];
    return Array.from({ length: 26 }, (_, i) => ({ id: i, left: Math.random() * 100, delay: Math.random() * .6, dur: 2.4 + Math.random() * 1.8, c: cols[i % cols.length] }));
  }, [go]);
  if (!go) return null;
  return bits.map((b) => <span key={b.id} className="petal" style={{ left: `${b.left}%`, top: "-16px", background: b.c, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }} />);
}

function Signal({ elapsed, slot }) {
  const s = signalFor(elapsed, slot);
  return (
    <div>
      <div className="signal" role="img" aria-label={`Timer signal: ${s}`}>
        <div className="lamp g" data-on={s === "green" || s === "amber" || s === "red" ? "1" : "0"} />
        <div className="lamp a" data-on={s === "amber" || s === "red" ? "1" : "0"} />
        <div className="lamp r" data-on={s === "red" ? "1" : "0"} />
      </div>
      <p className="signlbl">
        {s === "none" && `green at ${fmt(slot.green)}`}
        {s === "green" && "green — you qualify from here"}
        {s === "amber" && "amber — start closing"}
        {s === "red" && "red — finish now"}
      </p>
    </div>
  );
}

function Notice({ mic }) {
  const hard = mic.error;
  const soft = mic.notice;
  const gap = !mic.canRecord
    ? (mic.sandboxed
        ? "Preview frames block the microphone. Run this on localhost to record — or write your answer and it still gets the full evaluation."
        : "This browser can't reach a microphone. Writing your answer gets you the same analysis.")
    : !mic.secure
      ? "Opened as a file, so the microphone is blocked. Serve it over localhost and recording works."
      : !mic.canTranscribe
        ? "This browser records but can't transcribe live — Chrome or Edge can. You can still write your answer."
        : null;
  if (!hard && !soft && !gap) return null;
  return (
    <>
      {hard && <div className="warnbox" role="alert">{hard}</div>}
      {!hard && gap && <div className="warnbox">{gap}</div>}
      {soft && <div className="tip" role="status" style={{ marginBottom: 14 }}>{soft}</div>}
    </>
  );
}

/* Play back what you actually said. The scores mean nothing if you can't
   check them against the tape. */

/* Sarvam's transcript, offered next to the live one. It is usually the better
   record for anything that isn't plain English, but the user decides. */
/* Turn any piece of YAP's coaching into the user's language, on demand. */
function TranslateButton({ text, label = "Read this in my language" }) {
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  const to = replyLangCode();
  if (!sarvamReady() || !text || to === "en-IN") return null;
  const go = () => {
    setBusy(true);
    sarvamTranslate(text, "en-IN", to)
      .then((t) => setOut(t || null))
      .catch(() => setOut("__fail__"))
      .finally(() => setBusy(false));
  };
  return (
    <div style={{ marginTop: 10 }}>
      {!out && <button className="btn sm" onClick={go} disabled={busy}>
        {busy ? "Translating…" : label}</button>}
      {out && out !== "__fail__" && <div className="note" style={{ borderColor: "var(--sky)" }}>{out}</div>}
      {out === "__fail__" && <p className="ex">Translation is unavailable right now.</p>}
    </div>
  );
}

/* Romanise Indic script for anyone who speaks the language but reads it slowly. */
function RomanToggle({ text, from }) {
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!sarvamReady() || !text || !/[\u0900-\u0DFF]/.test(text)) return null;
  const go = () => {
    setBusy(true);
    sarvamTransliterate(text, from || "auto", "en-IN")
      .then((t) => setOut(t || null)).catch(() => setOut("__fail__")).finally(() => setBusy(false));
  };
  return (
    <div style={{ marginTop: 8 }}>
      {!out && <button className="btn sm" onClick={go} disabled={busy}>
        {busy ? "Working…" : "Show in Roman script"}</button>}
      {out && out !== "__fail__" && <p className="ex" style={{ fontSize: 15 }}>{out}</p>}
    </div>
  );
}

/* The one place a user sets how they speak and how YAP answers. */
function LanguageBar({ mic }) {
  const [reply] = usePersisted("replyLang", "en-IN");
  const [open, setOpen] = useState(false);
  const spoken = mic.lang;
  const spokenLabel = (MIC_LANGS.find((l) => l.id === spoken) || {}).label || spoken;
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="eye">Speaking {spokenLabel} · coached in {langName(reply)}</span>
        <button className="btn sm" onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Language"}</button>
      </div>
      {open && (
        <>
          <div className="eye" style={{ marginTop: 14 }}>I speak</div>
          <div className="row" style={{ marginTop: 8 }}>
            {MIC_LANGS.map((l) => (
              <button key={l.id} className="chip" data-on={spoken === l.id ? "1" : "0"}
                onClick={() => mic.setLang(l.id)}>{l.label}</button>
            ))}
          </div>
          <p className="ex" style={{ marginTop: 12 }}>
            Speak however you actually speak — mixing Hindi and English in one sentence is normal and
            YAP scores it as one answer, not as a mistake. Your words are analysed in the language
            you said them; only the coaching is translated.
          </p>
        </>
      )}
    </div>
  );
}

function Playback({ clip, label = "Your recording" }) {
  if (!clip || !clip.url) return null;
  return (
    <div className="card">
      <div className="eye" style={{ marginBottom: 8 }}>{label} · {fmt(clip.seconds || 0)}</div>
      <audio src={clip.url} controls preload="metadata" style={{ width: "100%" }} />
      <div className="row" style={{ marginTop: 10 }}>
        <a className="btn sm" href={clip.url} download={`yap-${Date.now()}.webm`}>Download</a>
      </div>
      <p className="ex" style={{ marginTop: 8 }}>
        Kept in this browser only — nothing is uploaded.
      </p>
    </div>
  );
}

function Writer({ value, onChange, placeholder, rows = 5 }) {
  return <textarea className="typebox" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

const ROLE_MOOD = { timer: "thinking", ah: "focused", gram: "focused", eval: "encouraging" };

function RoleHead({ role }) {
  return (
    <div className="role">
      <div className="rbadge">
        {ROLE_MOOD[role.id]
          ? <Mascot mood={ROLE_MOOD[role.id]} size={46} className="masc-pop" />
          : <Icon name={role.icon} size={23} />}
      </div>
      <div>
        <div className="rname">{role.name}</div>
        <div className="rrole">{role.role}</div>
      </div>
    </div>
  );
}

/* Shared body for the Ah-Counter's card, everywhere that role shows up
   (Table Topics, Debate, Group Discussion): a count for "ah"/"um"/"uh" by
   name first, the coaching line, then the two tallies kept visibly separate
   so a speaker can tell a hesitation sound from a habitual crutch word. */
function AhCounterBody({ a, extra }) {
  return (
    <>
      <div className="dials" style={{ margin: "4px 0 12px" }}>
        <div className="dial">
          <b className={a.soundPer < 3 ? "ok" : a.soundPer < 6 ? "warn" : "bad"}>{a.soundTotal}</b>
          <span>Ah · um · uh</span>
        </div>
        <div className="dial">
          <b className={a.crutchTotal <= 2 ? "ok" : "warn"}>{a.crutchTotal}</b>
          <span>Other crutches</span>
        </div>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.65 }}>{a.line}</p>
      {a.sounds.length > 0 && (
        <>
          <div className="eye" style={{ marginTop: 12 }}>Ah · um · uh</div>
          <div className="tally">{a.sounds.map(([w, n]) => <span className="tchip" key={w}>{w} <b>×{n}</b></span>)}</div>
        </>
      )}
      {a.crutches.length > 0 && (
        <>
          <div className="eye" style={{ marginTop: 12 }}>Other crutch words</div>
          <div className="tally">{a.crutches.map(([w, n]) => <span className="tchip" key={w}>{w} <b>×{n}</b></span>)}</div>
        </>
      )}
      {extra}
    </>
  );
}

function Corrections({ items }) {
  const label = { grammar: ["Grammar", "g"], regional: ["Fine here, odd abroad", "r"],
    vocab: ["Sharper word", "v"], register: ["Too casual", "g"] };
  return items.map((it, i) => {
    const [txt, cls] = label[it.kind] || label.grammar;
    return (
      <div className="fixrow" key={i}>
        <span className={"badge " + cls}>{txt}</span>
        <div><span className="was">{it.was}</span> → <span className="now">{it.now}</span></div>
        <p>{it.why}</p>
        {it.ctx && <span className="ctx">“{it.ctx}”</span>}
      </div>
    );
  });
}

/* ==========================================================================
   MOCK INTERVIEW ENGINE
   Every dimension here is measured from the candidate's own words. The
   follow-up logic is local, so the interviewer adapts with or without an API.
   ========================================================================== */

const IV_ROLES = {
  "Software engineer": { id: "swe", comp: ["complexity", "edge case", "test", "testing", "qa", "bug", "bugs", "crash", "scale", "latency", "trade off", "tradeoff", "refactor", "debug", "api", "database", "cache", "concurrency", "memory", "performance", "review", "deploy", "release", "ship", "rollout", "flag", "incident", "monitoring", "code"] },
  "Product manager": { id: "pm", comp: ["user", "users", "metric", "metrics", "roadmap", "stakeholder", "prioritise", "prioritize", "retention", "adoption", "hypothesis", "segment", "funnel", "launch", "scope", "trade off", "north star", "feedback", "onboarding", "drop off", "churn", "release", "backlog"] },
  "Data analyst": { id: "data", comp: ["dataset", "query", "sql", "distribution", "correlation", "sample", "significance", "dashboard", "metric", "outlier", "baseline", "cohort", "regression", "clean", "validate"] },
  "Consultant": { id: "con", comp: ["hypothesis", "framework", "segment", "driver", "market", "revenue", "cost", "margin", "benchmark", "structure", "root cause", "recommendation", "stakeholder", "sizing"] },
  "Sales / BD": { id: "sales", comp: ["pipeline", "objection", "close", "quota", "prospect", "discovery", "value", "pricing", "renewal", "churn", "relationship", "follow up", "decision maker"] },
  "Marketing": { id: "mkt", comp: ["positioning", "audience", "funnel", "campaign", "channel", "conversion", "brand", "retention", "creative", "cac", "engagement", "segment", "messaging"] },
  "Finance": { id: "fin", comp: ["margin", "cash flow", "valuation", "risk", "revenue", "cost", "forecast", "balance sheet", "ratio", "capital", "return", "assumption", "model"] },
  "Operations": { id: "ops", comp: ["process", "throughput", "bottleneck", "sla", "vendor", "inventory", "cost", "quality", "escalation", "root cause", "capacity", "workflow"] },
  "Fresher / any role": { id: "any", comp: ["team", "project", "learn", "responsibility", "deadline", "result", "challenge", "improve", "contribute", "initiative"] },
};

const IV_TYPES = {
  "HR & fit": "hr",
  "Behavioural": "beh",
  "Technical": "tech",
  "Case / problem": "case",
  "Stress": "stress",
};

const IV_LEVELS = ["Student / fresher", "0–2 years", "3–5 years", "6+ years"];
const IV_DIFF = ["Gentle", "Realistic", "Brutal"];
const IV_DURATIONS = [
  { id: 5, label: "5 min", q: 4 },
  { id: 10, label: "10 min", q: 7 },
  { id: 15, label: "15 min", q: 10 },
];

/* Opening questions by type. Role words get folded in at ask time. */
const IV_BANK = {
  hr: [
    "Tell me about yourself in under a minute.",
    "Why this role, and why now?",
    "What do you know about how we work?",
    "Where do you want to be in three years?",
    "What would your last manager say you need to work on?",
    "Why are you leaving your current place?",
    "What kind of work drains you?",
    "What are you looking for that you don't have today?",
  ],
  beh: [
    "Tell me about a time you disagreed with someone senior to you.",
    "Describe a project that failed. What did you actually do about it?",
    "Tell me about a deadline you missed.",
    "Give me an example of persuading someone who didn't want to be persuaded.",
    "Describe a time you had to learn something quickly under pressure.",
    "Tell me about feedback that stung.",
    "When did you last change your mind about something important at work?",
    "Describe a conflict inside your team and your part in it.",
  ],
  tech: [
    "Walk me through something you built end to end.",
    "What's a technical decision you'd make differently now?",
    "How do you know your work is correct before you ship it?",
    "Explain something complex from your work to someone non-technical.",
    "What's the hardest bug or problem you've debugged?",
    "How would you approach a problem you've never seen before?",
    "What trade-off did you make recently, and what did it cost?",
  ],
  case: [
    "A company's revenue dropped 20% in one quarter. How do you find out why?",
    "Estimate how many people in this city order food online on a weekday.",
    "Your main metric is flat for three months. What do you do first?",
    "A competitor undercuts you by 30%. What's your response?",
    "You have budget for one hire. Where does it go and why?",
    "Customers love the product but don't renew. Diagnose it.",
  ],
  stress: [
    "I'm not convinced you're ready for this. Change my mind.",
    "That answer sounded rehearsed. Give me the real version.",
    "Your background doesn't obviously fit. Why should we take the risk?",
    "What's the weakest thing on your CV?",
    "You've had 30 seconds and haven't said anything specific. Try again.",
    "Someone with more experience wants this role. Why you?",
  ],
};

/* ---------------- dimensions measured from the answer ------------------- */

const HEDGE_WORDS = /\b(maybe|perhaps|probably|i guess|i think|kind of|sort of|somewhat|possibly|might|could be|not sure|i'm not sure|hopefully|i feel like|or something|a bit)\b/gi;
const UNSURE = /\b(i don't know|i'm not sure|i can't remember|no idea|i forgot|not really sure|hard to say|i haven't|never done)\b/gi;
const SELF_DEPRECATE = /\b(sorry|my bad|that was bad|i'm bad at|i'm terrible|i'm not good at|that made no sense|i'm rambling)\b/gi;
const ASSERTIVE = /\b(i (led|built|owned|shipped|decided|drove|ran|delivered|launched|fixed|designed|negotiated|managed|created|pulled|showed|proposed|raised|wrote|spoke|flagged|argued|presented|changed|moved|cut|reduced|improved|took|handled|resolved|coordinated|trained|tested|measured|analysed|analyzed|rebuilt|rewrote|set up|reached out|escalated|automated|shipped)|i was responsible|my call|i chose|i pushed|i convinced|we shipped|i made sure|i could see|so i)\b/gi;

const STAR = {
  s: /\b(when i|at my|in my (last|previous)|we were|the situation|at the time|back in|during my|the context|we had a)\b/i,
  t: /\b(my job was|i was asked|the goal was|i had to|my responsibility|the task|we needed to|the target)\b/i,
  a: /\b(so i|i decided|i started|i built|i spoke|i set up|i changed|i proposed|first i|then i|what i did|i reached out|i organised|i organized)\b/i,
  r: /\b(as a result|in the end|we ended up|the outcome|it went from|increased|decreased|reduced|improved|grew|saved|shipped on time|we won|we closed|the result)\b/i,
};

const NUMBERY = /(\d+(\.\d+)?\s*(%|percent|x|k|lakh|lakhs|crore|crores|million|billion|days?|weeks?|months?|years?|hours?|people|users?|customers?|clients?|rupees|dollars|rs\.?))|₹\s*\d|\$\s*\d|\b\d{2,}\b/gi;
const CONCRETE = /\b(for example|specifically|in particular|the exact|namely|i remember|one time|last (week|month|quarter|year))\b/gi;
const REASONING = /\b(because|since|therefore|which meant|so that|as a result|the reason|that led to|which caused|due to)\b/gi;
const CRITICAL = /\b(however|on the other hand|the trade off|tradeoff|the risk|the downside|it depends|alternatively|but the problem|the counter|weighing|versus|instead of)\b/gi;
const PROBLEM = /\b(first|second|then|next|so i|then i|i'd start by|i would start|step one|break it down|root cause|hypothesis|framework|assume|validate|test|measure|prioritise|prioritize|narrow it down|rule out|looked at|checked)\b/gi;

const count = (t, re) => (t.match(new RegExp(re.source, re.flags)) || []).length;

function keyWords(t) {
  return words0(t).filter((w) => w.length > 3 && !STOPW.has(w) && !BASIC.has(w));
}

/* People answer the question without echoing its vocabulary — "we had
   different views" is a perfectly good answer to a question about disagreement.
   Straight keyword overlap calls that off-topic, so each question concept
   carries the words candidates actually use for it. */
const Q_SYNONYMS = {
  disagree: ["disagreed", "different view", "different views", "argued", "pushed back", "conflict",
    "didn't agree", "did not agree", "clashed", "opposed", "objection", "friction", "debate"],
  senior: ["manager", "lead", "boss", "supervisor", "head", "director", "professor", "mentor", "senior"],
  fail: ["failed", "failure", "went wrong", "mistake", "didn't work", "fell apart", "missed", "flopped"],
  deadline: ["late", "on time", "delayed", "slipped", "timeline", "schedule", "overrun"],
  learn: ["learned", "learnt", "picked up", "taught myself", "figured out", "studied", "ramped up"],
  persuade: ["convinced", "persuaded", "got them to", "sold them", "won them over", "changed their mind"],
  feedback: ["criticism", "review", "told me", "pointed out", "appraisal"],
  conflict: ["argument", "disagreement", "tension", "fell out", "friction"],
  weakness: ["struggle", "not good at", "working on", "improve", "gap"],
  build: ["built", "shipped", "made", "created", "developed", "wrote", "designed"],
  problem: ["issue", "bug", "challenge", "blocker", "difficulty", "broke"],
  team: ["colleagues", "teammates", "we", "group", "peers"],
  pressure: ["stress", "urgent", "crunch", "tight", "fire"],
  decision: ["decided", "chose", "picked", "call", "judgement"],
};

function relevanceOf(question, answer) {
  const q = keyWords(question);
  if (!q.length) return 70;
  const a = keyWords(answer);
  if (!a.length) return 0;
  const low = " " + (answer || "").toLowerCase() + " ";

  let covered = 0;
  q.forEach((term) => {
    if (a.includes(term)) { covered += 1; return; }
    const stem = term.slice(0, Math.max(4, term.length - 2));
    if (a.some((w) => w.startsWith(stem))) { covered += 1; return; }
    // does the answer express this concept in different words?
    const key = Object.keys(Q_SYNONYMS).find((k) => term.startsWith(k.slice(0, 5)));
    if (key && Q_SYNONYMS[key].some((syn) => low.includes(" " + syn))) covered += 1;
  });

  const cover = covered / q.length;
  const hits = a.filter((w) => q.includes(w)).length;
  const density = Math.min(hits / a.length * 4, 1);
  return Math.max(0, Math.min(100, Math.round(cover * 80 + density * 20)));
}

function analyseAnswer(question, answer, seconds, mode, role, voiced, declaredLang) {
  const base = analyse(answer, Math.max(1, seconds), mode, declaredLang);
  const t = " " + (answer || "").toLowerCase() + " ";
  const wc = base.wc;

  const relevance = relevanceOf(question, answer);

  const numbers = count(answer, NUMBERY);
  const concretes = count(t, CONCRETE);
  const specificity = wc < 8 ? 0 : Math.min(100, Math.round(numbers * 22 + concretes * 16 + Math.min(wc / 2.4, 34)));

  const reasons = count(t, REASONING);
  const depth = wc < 8 ? 0 : Math.min(100, Math.round(Math.min(wc / 90, 1) * 46 + reasons * 13 + base.units.length * 3));

  const star = { s: STAR.s.test(t), t: STAR.t.test(t), a: STAR.a.test(t), r: STAR.r.test(t) };
  const starCount = Object.values(star).filter(Boolean).length;
  const structure = Math.round((starCount / 4) * 62 + (base.hasStance ? 20 : 0) + (base.hasClose ? 18 : 0));

  const hedges = count(t, HEDGE_WORDS);
  const unsure = count(t, UNSURE);
  const selfDep = count(t, SELF_DEPRECATE);
  const assertive = count(t, ASSERTIVE);
  const confidence = wc < 6 ? 0 : Math.max(0, Math.min(100, Math.round(
    72 + assertive * 9 - hedges * 6 - unsure * 15 - selfDep * 13
  )));

  const critical = Math.min(100, count(t, CRITICAL) * 26);
  const problem = Math.min(100, count(t, PROBLEM) * 18);

  const comp = (IV_ROLES[role] || IV_ROLES["Fresher / any role"]).comp;
  const compHits = comp.filter((c) => t.includes(" " + c));
  const roleFit = Math.min(100, Math.round(compHits.length * 24));

  const silence = mode === "mic" && voiced != null ? Math.max(0, Math.round(seconds - voiced)) : null;
  const hesitation = silence == null ? null
    : Math.max(0, Math.min(100, Math.round(100 - Math.max(0, silence - 3) * 7)));

  // energy: variation in sentence length plus verb-driven language
  const lens = base.units.map((u) => (u.match(/\S+/g) || []).length);
  const mean = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const varr = lens.length > 1 ? Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length) : 0;
  const energy = wc < 10 ? 0 : Math.min(100, Math.round(Math.min(varr / 9, 1) * 45 + Math.min(assertive * 12, 30) + Math.min(base.range * 0.25, 25)));

  const score = wc < 5 ? 0 : Math.round(
    relevance * 0.20 + depth * 0.13 + specificity * 0.12 + structure * 0.14 +
    base.clarity100 * 0.09 + base.fluency * 0.09 + confidence * 0.12 +
    Math.max(critical, problem) * 0.06 + roleFit * 0.05
  );

  return { ...base, question, relevance, specificity, depth, star, starCount, structure,
    confidence, critical, problem, roleFit, compHits, hesitation, silence, energy,
    hedges, unsure, selfDep, assertive, numbers, score };
}

/* ------------------- the interviewer's adaptive brain -------------------- */
/* This decides what to ask next from what the candidate actually just did.
   It runs with no network, so the interview never degrades into a script. */

function decideFollowUp(a, asked, difficulty) {
  const hard = difficulty === "Brutal";
  const soft = difficulty === "Gentle";
  const used = (k) => asked.includes(k);

  if (a.wc < 12 && !used("thin")) return { key: "thin", probe: true,
    line: "That's not enough for me to judge. Take it again with more — what actually happened, and what did you do?" };

  if (a.relevance < 30 && a.wc >= 15 && !used("offtopic")) return { key: "offtopic", probe: true,
    line: `You've answered something adjacent to what I asked. Let me be direct: ${a.question}` };

  if (!a.star.r && a.starCount >= 2 && !used("result")) return { key: "result", probe: true,
    line: "You've told me what you did but not how it ended. What was the outcome, and how did you know?" };

  if (a.unsure >= 1 && a.confidence < 55 && !used("unsure")) return { key: "unsure", probe: true,
    line: "You've hedged that several ways. Tell me the part you are sure about." };

  if (a.specificity < 30 && a.wc > 20 && !used("specific")) return { key: "specific", probe: true,
    line: soft ? "Can you give me one concrete example from that — ideally with a number attached?"
               : "That was all shape and no substance. One example, one number, right now." };

  if (a.confidence < 42 && a.wc > 15 && !used("confidence")) return { key: "confidence", probe: true,
    line: hard ? "You don't sound like you believe your own answer. Why should I?"
               : "You sound less certain than the answer deserves. Say it again without the hedges." };

  if (a.problem < 25 && a.critical < 25 && a.wc > 30 && a.score < 62 && !used("reason")) return { key: "reason", probe: true,
    line: "Walk me through the reasoning rather than the conclusion. How did you get there?" };

  if (a.roleFit < 25 && a.wc > 25 && !used("role")) return { key: "role", probe: true,
    line: "Nothing in that was specific to this role. Connect it to the actual work you'd be doing here." };

  // they did well — escalate rather than reward
  if (a.score >= 68 && hard && !used("push")) return { key: "push", probe: true,
    line: "Fine. Now argue the opposite of what you just told me, and tell me which version you actually believe." };

  if (a.score >= 72 && !used("deeper")) return { key: "deeper", probe: true,
    line: "Good. Push it one level further — what would you do differently if you had to do it again tomorrow?" };

  return null;
}

function nextQuestion(state) {
  const { type, asked, level, difficulty } = state;
  const bank = IV_BANK[IV_TYPES[type]] || IV_BANK.hr;
  const unused = bank.filter((q) => !asked.includes(q));
  const pool = unused.length ? unused : bank;
  let q = pick(pool);
  if (/fresher|student/i.test(level) && /leaving your current|last manager/i.test(q)) {
    q = pick(pool.filter((x) => !/leaving your current|last manager/i.test(x)) || pool);
  }
  if (difficulty === "Brutal" && Math.random() < 0.3) {
    q = q + " And be specific — I'll ask for numbers.";
  }
  return q;
}

/* ------------------ moments that actually cost them ---------------------- */

function findMoments(answers) {
  const out = [];
  answers.forEach((a, i) => {
    const n = i + 1;
    if (a.wc < 12) out.push({ q: n, kind: "Too thin", cost: 18,
      why: `Answer ${n} was ${a.wc} words. An interviewer reads that as nothing to say.`, quote: a.text.slice(0, 90) });
    if (a.relevance < 30 && a.wc >= 15) out.push({ q: n, kind: "Off the question", cost: 22,
      why: `You didn't answer what was asked. The question was “${a.question}”.`, quote: a.text.slice(0, 90) });
    if (a.unsure >= 2) out.push({ q: n, kind: "Audible uncertainty", cost: 14,
      why: `${a.unsure} outright “I'm not sure” moments in one answer. One is honest; three is a verdict.`, quote: null });
    if (a.selfDep > 0) out.push({ q: n, kind: "Talked yourself down", cost: 12,
      why: "You apologised for your own answer. Interviewers take that at face value.", quote: null });
    if (a.confidence < 42 && a.wc >= 12) out.push({ q: n, kind: "Sounded unconvinced", cost: 16,
      why: `Confidence read ${a.confidence} on this answer — hedges and qualifiers outnumbered the claims.`, quote: a.text.slice(0, 90) });
    if (a.silence != null && a.silence > 8) out.push({ q: n, kind: "Long silence", cost: 10,
      why: `${a.silence} seconds of dead air. Thinking out loud beats going quiet.`, quote: null });
    if (a.fillerCount >= 6) out.push({ q: n, kind: "Filler cluster", cost: 9,
      why: `${a.fillerCount} crutch words in ${a.wc}. They cluster where you change direction.`, quote: null });
    if (!a.star.r && a.starCount >= 2) out.push({ q: n, kind: "No outcome", cost: 15,
      why: "You described the work but never landed the result. The result is the part that gets remembered.", quote: null });
    if (a.concise.longOnes.length >= 2) out.push({ q: n, kind: "Ran on", cost: 8,
      why: `${a.concise.longOnes.length} sentences over thirty words. The listener stopped following partway.`,
      quote: (a.concise.longOnes[0] || {}).text ? a.concise.longOnes[0].text.slice(0, 90) : null });
  });
  return out.sort((a, b) => b.cost - a.cost).slice(0, 6);
}

/* --------- rebuild their answer using their own material, in STAR -------- */

function improveAnswer(a) {
  if (!a.text || a.wc < 8) {
    return { skeleton: null, note: "There wasn't enough here to rebuild. The fix is length before polish." };
  }
  const units = a.units;
  const find = (re) => units.find((u) => re.test(u));
  const situation = find(STAR.s) || units[0];
  const action = find(STAR.a) || units[Math.min(1, units.length - 1)];
  const result = find(STAR.r);
  const tightened = tightenSentence(action || "");
  return {
    skeleton: [
      { label: "Situation", text: situation ? tightenSentence(situation).tightened : null,
        note: situation ? "yours, tightened" : "missing — one line of context is enough" },
      { label: "What you did", text: tightened.tightened || null,
        note: tightened.saved > 0 ? `${tightened.saved} words cut` : "yours, unchanged" },
      { label: "Result", text: result ? tightenSentence(result).tightened : null,
        note: result ? "yours, tightened" : "MISSING — add one number or one observable change" },
    ],
    note: result
      ? "The bones were there. Cutting the padding is what makes it land."
      : "You never closed the loop. Interviewers score the result, not the effort — even “it shipped two weeks late but it shipped” beats silence.",
  };
}

/* ---------------------- the final interview report ---------------------- */

function interviewReport(answers, setup) {
  const answered = answers.filter((a) => a.wc >= 5);
  const avg = (k) => answered.length ? Math.round(answered.reduce((s, a) => s + (a[k] || 0), 0) / answered.length) : 0;

  const dims = {
    relevance: avg("relevance"), depth: avg("depth"), specificity: avg("specificity"),
    structure: avg("structure"), confidence: avg("confidence"), clarity: avg("clarity100"),
    fluency: avg("fluency"), grammar: avg("accuracy"), vocabulary: avg("range"),
    pace: avg("pace"), energy: avg("energy"), critical: avg("critical"),
    problem: avg("problem"), roleFit: avg("roleFit"),
  };
  const hesitationVals = answered.filter((a) => a.hesitation != null).map((a) => a.hesitation);
  dims.hesitation = hesitationVals.length ? Math.round(hesitationVals.reduce((a, b) => a + b, 0) / hesitationVals.length) : null;

  const unansweredPenalty = (answers.length - answered.length) * 8;
  const overall = Math.max(0, Math.min(100, (answered.length
    ? Math.round(answered.reduce((s, a) => s + a.score, 0) / answered.length)
    : 0) - unansweredPenalty));

  const fillerTotal = answered.reduce((s, a) => s + a.fillerCount, 0);
  const wordTotal = answered.reduce((s, a) => s + a.wc, 0);

  const ranked = Object.entries(dims).filter(([, v]) => v != null).sort((a, b) => b[1] - a[1]);
  const LABEL = {
    relevance: "answering the actual question", depth: "developing an answer",
    specificity: "concrete detail", structure: "shaping an answer",
    confidence: "sounding certain", clarity: "saying it concisely",
    fluency: "clean delivery", grammar: "grammar", vocabulary: "vocabulary range",
    pace: "pace", energy: "energy and variation", critical: "weighing trade-offs",
    problem: "structured problem-solving", roleFit: "role-specific language",
    hesitation: "keeping the air alive",
  };
  const strengths = ranked.filter(([, v]) => v >= 60).slice(0, 3).map(([k, v]) => ({ k: LABEL[k], v }));
  const weaknesses = ranked.filter(([, v]) => v < 55).slice(-4).reverse().map(([k, v]) => ({ k: LABEL[k], v }));

  const recs = [];
  if (dims.specificity < 45) recs.push("Bring three stories with numbers attached to your next interview. Not adjectives — numbers. “Cut processing time from six hours to forty minutes” outperforms “significantly improved efficiency” every single time.");
  if (dims.structure < 50) recs.push("Practise the four-beat answer until it's automatic: where you were, what you were asked to do, what you did, how it ended. Most candidates skip the fourth beat, which is the only one being scored.");
  if (dims.confidence < 50) recs.push("Strip the hedges. Say “I decided” instead of “I kind of thought maybe we should”. If you genuinely aren't sure, say which part you're sure about rather than qualifying the whole answer.");
  if (dims.relevance < 55) recs.push("Repeat the question back in your first sentence before you answer it. It costs two seconds and it stops you drifting into the story you wanted to tell instead of the one you were asked for.");
  if (fillerTotal / Math.max(wordTotal, 1) > 0.05) recs.push("Your crutch words cluster at transitions. Replace the next one with a half-second of silence — it reads as thinking, not searching.");
  if (dims.critical < 35 && dims.problem < 35) recs.push("Show your reasoning, not just your conclusion. Say the alternative you rejected and why. Interviewers hire the thinking, and they can't see it unless you narrate it.");
  if (dims.roleFit < 35) recs.push(`Use the vocabulary of the job. For ${setup.role}, that means naming the things the role actually deals with rather than staying generic.`);
  if (!recs.length) recs.push("You're past the basics. The next gain is in the opening ten seconds of each answer — lead with your sharpest sentence instead of warming up into it.");

  return { dims, overall, strengths, weaknesses, recs: recs.slice(0, 4),
    answered: answered.length, total: answers.length,
    fillerTotal, wordTotal, moments: findMoments(answered) };
}


/* ------------------------- CONCISENESS UI -------------------------------- */

/* Highlight every clarity issue in the transcript with its own colour. */
function renderClarity(text, r) {
  if (!text) return null;
  const c = r.concise;
  const marks = [];
  const addPhrase = (phrase, cls) => {
    if (!phrase) return;
    const re = new RegExp("\\b" + esc(phrase) + "\\b", "gi");
    let m;
    while ((m = re.exec(text)) !== null) marks.push({ from: m.index, to: m.index + m[0].length, cls });
  };
  c.empty.forEach((e) => addPhrase(e.phrase, "hl-empty"));
  c.wordy.forEach((w) => addPhrase(w.was, "hl-wordy"));
  c.repeatedIdeas.slice(0, 4).forEach((x) => addPhrase(x.phrase, "hl-repeat"));
  r.fillers.forEach((f) => addPhrase(f.phrase, f.kind === "hedge" ? "hed" : "fil"));

  marks.sort((a, b) => a.from - b.from || b.to - a.to);
  const out = [];
  let at = 0;
  marks.forEach((mk, i) => {
    if (mk.from < at) return;
    if (mk.from > at) out.push(<span key={"t" + i}>{text.slice(at, mk.from)}</span>);
    out.push(<span key={"m" + i} className={mk.cls}>{text.slice(mk.from, mk.to)}</span>);
    at = mk.to;
  });
  if (at < text.length) out.push(<span key="end">{text.slice(at)}</span>);
  return out;
}

function ScoreDial({ label, value, delay = 0 }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), delay * 1000 + 120); return () => clearTimeout(t); }, [delay]);
  const n = useCountUp(value, 850, go);
  return (
    <div className="dial" style={{ animation: `rise .5s ${delay}s cubic-bezier(.2,1.2,.35,1) both` }}>
      <b className={value > 65 ? "ok" : value > 40 ? "warn" : "bad"}>{n}</b>
      <span>{label}</span>
    </div>
  );
}

function ClarityCard({ r, aiRewrites }) {
  const c = r.concise;
  if (r.wc < 12) return null;
  return (
    <div className="card sky">
      <div className="role">
        <div className="rbadge"><Mascot mood="smug" size={46} /></div>
        <div><div className="rname">Conciseness</div><div className="rrole">says it in fewer words</div></div>
      </div>
      <div className="dials" style={{ margin: "10px 0 14px" }}>
        <ScoreDial label="Clarity" value={c.score} />
        <div className="dial"><b>{Math.round(c.wastePct)}%</b><span>Words wasted</span></div>
        <div className="dial"><b className={c.longOnes.length ? "warn" : "ok"}>{c.longOnes.length}</b><span>Long sentences</span></div>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.65 }}>{c.line}</p>

      {c.empty.length > 0 && (
        <>
          <div className="eye" style={{ margin: "16px 0 8px" }}>Words doing no work · {c.emptyCount}</div>
          <div className="tally">{c.empty.slice(0, 8).map((e) => <span className="tchip" key={e.phrase}>{e.phrase} <b>×{e.n}</b></span>)}</div>
        </>
      )}

      {c.wordy.length > 0 && (
        <>
          <div className="eye" style={{ margin: "16px 0 8px" }}>Long way round</div>
          {c.wordy.slice(0, 5).map((w, i) => (
            <div className="fixrow" key={i}>
              <span className={"badge " + (w.kind === "redundant" ? "g" : "r")}>{w.kind === "redundant" ? "Says it twice" : "Wordy"}</span>
              <div><span className="was">{w.was}</span> → <span className="now">{w.now || "(cut it)"}</span></div>
            </div>
          ))}
        </>
      )}

      {c.longOnes.length > 0 && (
        <>
          <div className="eye" style={{ margin: "16px 0 8px" }}>Sentences that ran long</div>
          {c.longOnes.slice(0, 2).map((u, i) => (
            <div className="fixrow" key={i}>
              <span className="badge g">{u.words} words · {u.clauses} joins</span>
              <p style={{ marginTop: 0 }}>“{u.text}”</p>
            </div>
          ))}
        </>
      )}

      {c.tangled.length > 0 && (
        <>
          <div className="eye" style={{ margin: "16px 0 8px" }}>Hard to follow</div>
          {c.tangled.slice(0, 3).map((u, i) => (
            <div className="fixrow" key={i}>
              <span className="badge g">Unclear</span>
              <p style={{ marginTop: 0 }}>“{u.text}”</p>
              <p>{u.why}</p>
            </div>
          ))}
        </>
      )}

      {c.repeatedIdeas.length > 0 && (
        <>
          <div className="eye" style={{ margin: "16px 0 8px" }}>Ideas that came round again</div>
          <div className="tally">
            {c.repeatedIdeas.slice(0, 5).map((x) => <span className="tchip" key={x.phrase}>{x.phrase} <b>×{x.n}</b></span>)}
          </div>
          <p className="ex">Back-to-back repetition is emphasis and isn't counted. These came back later, which usually means circling rather than emphasising.</p>
        </>
      )}

      {(c.rewrites.length > 0 || (aiRewrites && aiRewrites.length > 0)) && (
        <>
          <div className="eye" style={{ margin: "18px 0 8px" }}>Sharper versions</div>
          <p className="ex" style={{ marginBottom: 10 }}>
            Only your own words are cut or swapped — nothing is added, so this still sounds like you.
          </p>
          {c.rewrites.map((rw, i) => (
            <div className="rw" key={i}>
              <span className="lbl">What you said · {rw.reason}</span>
              <span className="orig">“{rw.original}”</span>
              <span className="lbl" style={{ marginTop: 10 }}>Sharper</span>
              <span className="tight">“{rw.tightened}”</span>
              {rw.removed.length > 0 && <div className="cutlist">{rw.removed.slice(0, 5).join(" · ")}</div>}
              <span className="save">{rw.before} → {rw.after} words</span>
            </div>
          ))}
          {(aiRewrites || []).map((rw, i) => (
            <div className="rw" key={"ai" + i}>
              <span className="lbl">What you said</span>
              <span className="orig">“{rw.was}”</span>
              <span className="lbl" style={{ marginTop: 10 }}>Sharper — same voice</span>
              <span className="tight">“{rw.now}”</span>
              {rw.why && <div className="cutlist">{rw.why}</div>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* --------------------------- LIBRARY TAB --------------------------------- */

function Library({ lib, setLib }) {
  const [mode, setMode] = useState("topics");
  const [tText, setTText] = useState("");
  const [tCat, setTCat] = useState("My topics");
  const [bulk, setBulk] = useState("");
  const [wLine, setWLine] = useState("");
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2600); };

  const addTopic = () => {
    const text = tText.trim();
    if (!text) return;
    if (editing) {
      setLib({ ...lib, topics: lib.topics.map((t) => (t.id === editing ? { ...t, text, cat: tCat.trim() || "My topics" } : t)) });
      setEditing(null); flash("Topic updated.");
    } else {
      setLib({ ...lib, topics: [...lib.topics, { id: uid(), text, cat: tCat.trim() || "My topics", custom: true }] });
      flash("Topic added.");
    }
    setTText("");
  };

  const bulkTopics = () => {
    const parsed = parseTopicBulk(bulk, tCat);
    if (!parsed.length) { flash("Nothing readable in that paste."); return; }
    setLib({ ...lib, topics: [...lib.topics, ...parsed] });
    setBulk(""); flash(`${parsed.length} topics added.`);
  };

  const bulkWords = () => {
    const parsed = parseWordBulk(bulk);
    if (!parsed.length) { flash("Nothing readable in that paste."); return; }
    setLib({ ...lib, words: [...lib.words, ...parsed] });
    setBulk(""); flash(`${parsed.length} words added.`);
  };

  const addWord = () => {
    const parsed = parseWordBulk(wLine);
    if (!parsed.length) { flash("Needs at least a word."); return; }
    setLib({ ...lib, words: [...lib.words, ...parsed] });
    setWLine(""); flash("Word added.");
  };

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(lib, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "yap-library.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importAll = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const j = JSON.parse(fr.result);
        setLib({
          topics: [...lib.topics, ...(j.topics || []).map((t) => ({ ...t, id: uid() }))],
          words: [...lib.words, ...(j.words || []).map((w) => ({ ...w, id: uid() }))],
          packs: lib.packs || [],
        });
        flash(`Imported ${(j.topics || []).length} topics and ${(j.words || []).length} words.`);
      } catch (err) { flash("That file isn't a YAP library."); }
    };
    fr.readAsText(file);
  };

  const cats = [...new Set(lib.topics.map((t) => t.cat))];

  return (
    <div>
      <h1 className="h1">Bring your <em>own</em> material.</h1>
      <p className="sub">
        Anything you add here runs through exactly the same Timer, Ah-Counter, Grammarian, Conciseness
        and Evaluator as the built-in content. Nothing is treated as second class.
      </p>

      <div className="seg">
        <button data-on={mode === "topics" ? "1" : "0"} onClick={() => setMode("topics")}>Topics · {lib.topics.length}</button>
        <button data-on={mode === "words" ? "1" : "0"} onClick={() => setMode("words")}>Words · {lib.words.length}</button>
      </div>

      {msg && <div className="tip" style={{ marginBottom: 14 }}>{msg}</div>}

      {mode === "topics" ? (
        <>
          <div className="card">
            <div className="eye">{editing ? "Edit topic" : "Add one topic"}</div>
            <Writer value={tText} onChange={setTText} rows={2} placeholder="e.g. Should campus placements be replaced by year-round hiring?" />
            <div className="row" style={{ marginTop: 10 }}>
              <input className="typebox" style={{ marginTop: 0, flex: "1 1 160px", fontSize: 14 }}
                aria-label="Category" value={tCat} onChange={(e) => setTCat(e.target.value)} placeholder="Category" />
              <button className="btn go sm" onClick={addTopic}>{editing ? "Save" : "Add"}</button>
              {editing && <button className="btn sm" onClick={() => { setEditing(null); setTText(""); }}>Cancel</button>}
            </div>
          </div>

          <div className="card">
            <div className="eye">Bulk upload</div>
            <p className="ex" style={{ margin: "6px 0 0" }}>
              One topic per line. Add a category after a pipe: <b>Topic text | Category</b>
            </p>
            <Writer value={bulk} onChange={setBulk} rows={5}
              placeholder={"Should India cap working hours? | Policy\nIs remote work here to stay? | Tech\nDescribe a decision you regret"} />
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn leaf sm" onClick={bulkTopics}>Add all</button>
              <button className="btn sm" onClick={exportAll}>Export library</button>
              <label className="btn sm" style={{ display: "inline-block" }}>
                Import
                <input type="file" accept="application/json" onChange={importAll} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          {cats.map((c) => (
            <div className="card" key={c}>
              <div className="eye">{c} · {lib.topics.filter((t) => t.cat === c).length}</div>
              {lib.topics.filter((t) => t.cat === c).map((t) => (
                <div className="libitem" key={t.id}>
                  <p>{t.text}<small>{t.cat}</small></p>
                  <button className="x" aria-label={`Edit topic: ${t.text.slice(0, 40)}`} title="Edit"
                    onClick={() => { setEditing(t.id); setTText(t.text); setTCat(t.cat); }}>✎</button>
                  <button className="x" aria-label={`Delete topic: ${t.text.slice(0, 40)}`} title="Delete"
                    onClick={() => setLib({ ...lib, topics: lib.topics.filter((x) => x.id !== t.id) })}>×</button>
                </div>
              ))}
            </div>
          ))}
          {lib.topics.length === 0 && (
            <div className="card"><div className="emptystate"><Mascot mood="confused" size={76} />
              <p className="ex">Nothing here yet. Anything you add shows up as its own category in Table Topics and in the group discussion picker.</p></div></div>
          )}
        </>
      ) : (
        <>
          <div className="card">
            <div className="eye">Add one word</div>
            <p className="ex" style={{ margin: "6px 0 0" }}>
              <b>Word | part of speech | meaning | example sentence</b> — only the word is required.
            </p>
            <Writer value={wLine} onChange={setWLine} rows={2}
              placeholder="Ostensible | adjective | stated as the reason but not the real one | The ostensible reason was scale" />
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn go sm" onClick={addWord}>Add word</button>
            </div>
          </div>

          <div className="card">
            <div className="eye">Bulk upload</div>
            <Writer value={bulk} onChange={setBulk} rows={5}
              placeholder={"Untenable | adjective | impossible to defend | That position is untenable\nCorroborate | verb | back up with evidence\nSalient"} />
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn leaf sm" onClick={bulkWords}>Add all</button>
              <button className="btn sm" onClick={exportAll}>Export library</button>
            </div>
          </div>

          <div className="card">
            <div className="eye">Your words · {lib.words.length}</div>
            {lib.words.length === 0
              ? <div className="emptystate"><Mascot mood="curious" size={76} />
                  <p className="ex">No words yet. Anything you add joins the word-of-the-day rotation and the vocabulary deck.</p></div>
              : lib.words.map((w) => (
                <div className="libitem" key={w.id}>
                  <p><b>{w.w}</b> <span className="ex">{w.p}</span>
                    {w.d && <small>{w.d}</small>}
                    {w.e && <small style={{ fontStyle: "italic" }}>“{w.e}”</small>}
                  </p>
                  <button className="x" aria-label={`Delete word: ${w.w}`} title="Delete"
                    onClick={() => setLib({ ...lib, words: lib.words.filter((x) => x.id !== w.id) })}>×</button>
                </div>
              ))}
          </div>

          <div className="tip">
            A custom word is judged the same way the built-in ones are: did you use it, in a working
            sentence, grammatically, in the meaning you gave it. Naming the word or defining it out
            loud doesn't count as using it.
          </div>
        </>
      )}
    </div>
  );
}


/* ==========================================================================
   ROOMS — practise with real people
   Async: no server at all. A room is a link; a turn is a code you send back.
   Live: WebRTC mesh audio. Each browser transcribes its own speech and
   broadcasts the text, so the server only relays — it never hears anyone.
   ========================================================================== */

/* -------------------------- portable encoding ---------------------------- */

function packB64(obj) {
  const json = JSON.stringify(obj);
  const utf = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  return btoa(utf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unpackB64(str) {
  try {
    const b = str.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b + "===".slice((b.length + 3) % 4));
    const json = decodeURIComponent(bin.split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return JSON.parse(json);
  } catch (e) { return null; }
}

const roomCode = () => Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

function makeRoom({ topic, host, minutes = 5, kind = "async" }) {
  return { id: roomCode(), topic, host, minutes, kind, at: Date.now() };
}

function roomLink(room) {
  const base = (typeof window !== "undefined" && window.location)
    ? window.location.href.split("#")[0] : "";
  return `${base}#room=${packB64(room)}`;
}

function readRoomFromUrl() {
  try {
    const m = (window.location.hash || "").match(/room=([A-Za-z0-9\-_]+)/);
    return m ? unpackB64(m[1]) : null;
  } catch (e) { return null; }
}

/* A turn is small enough to paste into WhatsApp. */
function makeTurnCode({ room, name, text, seconds, mode }) {
  return packB64({ r: room.id, n: name, t: text, s: seconds, m: mode, at: Date.now() });
}
function readTurnCode(code) {
  const t = unpackB64((code || "").trim());
  if (!t || !t.r || !t.n || typeof t.t !== "string") return null;
  return { roomId: t.r, name: t.n, text: t.t, seconds: t.s || 60, mode: t.m || "mic", at: t.at || Date.now() };
}

/* --------------------- merge turns into one discussion ------------------- */

function mergeTurns(turns) {
  const seen = new Set();
  return turns
    .filter((t) => { const k = t.name + "|" + t.at; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => a.at - b.at);
}

/* Score every participant against what everyone else said. Reuses the same
   engine the solo product uses — nothing here is a separate rubric. */
function scoreRoom(room, turns) {
  const merged = mergeTurns(turns);
  const feed = merged.map((t) => ({ who: t.name, name: t.name, line: t.text }));
  const names = [...new Set(merged.map((t) => t.name))];

  const cards = names.map((name) => {
    const mine = merged.filter((t) => t.name === name);
    const text = mine.map((t) => t.text).join(" ");
    const secs = mine.reduce((s, t) => s + (t.seconds || 0), 0);
    const speech = analyse(text, Math.max(1, secs), mine[0] ? mine[0].mode : "mic");
    const others = feed.filter((f) => f.name !== name);
    const contrib = scoreContribution(
      mine.map((t) => t.text), others, Math.round((secs / Math.max(1, merged.reduce((s, t) => s + (t.seconds || 0), 0))) * 100),
      mine.length, 0, mine.length ? 0 : null, room.minutes * 60
    );
    // the leaderboard rewards what was said, not how long it took to say it
    const total = Math.round(
      contrib.originality * 0.16 + contrib.responsiveness * 0.16 + contrib.reasoning * 0.18 +
      contrib.buildOn * 0.12 + contrib.leadership * 0.09 + speech.clarity100 * 0.09 +
      speech.accuracy * 0.07 + speech.fluency * 0.07 + contrib.repetition * 0.06
    );
    return { name, text, seconds: secs, turns: mine.length, speech, contrib, total,
      share: Math.round((secs / Math.max(1, merged.reduce((s, t) => s + (t.seconds || 0), 0))) * 100) };
  }).sort((a, b) => b.total - a.total);

  return { merged, cards, memory: buildMemory(feed) };
}

function roomVerdict(cards) {
  if (!cards.length) return "Nobody has submitted a turn yet.";
  const top = cards[0], last = cards[cards.length - 1];
  if (cards.length === 1) return `${top.name} is the only voice in the room so far.`;
  const notes = [];
  const mostOriginal = cards.slice().sort((a, b) => b.contrib.originality - a.contrib.originality)[0];
  const mostResponsive = cards.slice().sort((a, b) => b.contrib.responsiveness - a.contrib.responsiveness)[0];
  const talkiest = cards.slice().sort((a, b) => b.share - a.share)[0];
  notes.push(`${top.name} takes it — not for talking most, but for ${
    top.contrib.reasoning >= top.contrib.originality ? "reasoning rather than asserting" : "bringing ground nobody else touched"}.`);
  if (mostOriginal.name !== top.name) notes.push(`${mostOriginal.name} had the most original material.`);
  if (mostResponsive.name !== top.name) notes.push(`${mostResponsive.name} listened hardest — most references to what others said.`);
  if (talkiest.name !== top.name) notes.push(`${talkiest.name} held the floor longest and still finished ${cards.indexOf(talkiest) + 1}th, which is the whole point.`);
  if (last.contrib.responsiveness < 30) notes.push(`${last.name} spoke into the room rather than to it.`);
  return notes.join(" ");
}

/* ============================ LIVE ROOM PROTOCOL =========================
   Messages the client and the signalling server exchange. Deliberately tiny:
   the server relays and tracks the floor, and never sees audio.
   ======================================================================== */



/* The moderator's local brain — used when no API key is present. */
function moderatorLine(state) {
  const { silentFor, quietest, hogging, stalled, topic, elapsed, total } = state;
  if (stalled > 12) return `Nobody's moving this forward. Take a position on ${topic} and defend it.`;
  if (hogging) return `${hogging}, let's hear from someone else on that.`;
  if (quietest) return `${quietest}, you've been quiet — what's your read?`;
  if (elapsed > total * 0.75) return "Two minutes left. Someone summarise where the group actually disagrees.";
  if (silentFor > 8) return "Silence is fine for thinking, but somebody has to break it.";
  return null;
}

/* ------------------------------ ROOMS UI --------------------------------- */

const ROOM_CSS = `
.rm-code{font-family:var(--mon);font-size:26px;font-weight:700;letter-spacing:.22em;border:2.5px dashed var(--line);border-radius:16px;padding:14px;text-align:center;background:var(--paper)}
.rm-link{font-family:var(--mon);font-size:11.5px;word-break:break-all;background:var(--paper);border:2px solid var(--line);border-radius:12px;padding:10px 12px;line-height:1.55;margin-top:10px}
.rm-people{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.rm-p{display:flex;align-items:center;gap:7px;border:2.5px solid var(--line);border-radius:999px;padding:6px 13px 6px 7px;background:var(--paper2);font-size:13px;font-weight:600;transition:transform .2s cubic-bezier(.2,1.5,.4,1)}
.rm-p:hover{transform:translateY(-2px) rotate(-2deg)}
.rm-p i{width:24px;height:24px;border-radius:8px;display:grid;place-items:center;font-family:var(--dis);font-weight:700;font-size:12px;font-style:normal;color:#0b0a1f}
.rm-p[data-live="1"]{background:var(--moss);color:#fff;border-color:var(--moss)}
.rm-p[data-mute="1"]{opacity:.5}
.rm-row{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:2px dotted var(--line)}
.rm-row:last-child{border-bottom:none}
.rm-rank{font-family:var(--dis);font-weight:700;font-size:22px;width:34px;flex:0 0 34px;text-align:center}
.rm-rank[data-r="1"]{color:var(--moss)}
.rm-meta{flex:1;min-width:0}
.rm-meta b{display:block;font-size:15.5px}
.rm-meta small{font-family:var(--mon);font-size:10.5px;color:var(--ink60)}
.rm-tot{font-family:var(--mon);font-size:19px;font-weight:700}
.rm-bars{display:flex;gap:4px;margin-top:6px}
.rm-bars i{height:5px;border-radius:99px;background:var(--moss);display:block}
.rm-live{display:flex;align-items:center;gap:7px;font-family:var(--mon);font-size:11px;color:var(--coral)}
.rm-dot{width:9px;height:9px;border-radius:50%;background:var(--coral);animation:pulse 1.1s infinite}
.rm-feed{max-height:280px;overflow-y:auto}
.rm-line{padding:9px 0;border-bottom:2px dotted var(--line);font-size:15px;line-height:1.55}
.rm-line:last-child{border-bottom:none}
.rm-line b{font-family:var(--mon);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink60);display:block;margin-bottom:3px}
.rm-line.mine{color:var(--moss)}
.rm-line.interim{opacity:.5;font-style:italic}
.rm-mod{border-left:5px solid var(--sun);padding:8px 0 8px 14px;font-size:15px;line-height:1.6;margin:10px 0}
.rm-warn{background:rgba(255,200,87,.1);border:2.5px dashed var(--line);border-radius:16px;padding:13px;font-size:13.5px;line-height:1.6}`;

const AVATAR_COLOURS = ["#ff7a63", "#ffc857", "#56c8f5", "#e56ad0", "#7a5cf0", "#e08b2f"];
const avatarFor = (name) => AVATAR_COLOURS[[...(name || "?")].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLOURS.length];

function Person({ name, live, muted }) {
  return (
    <span className="rm-p" data-live={live ? "1" : "0"} data-mute={muted ? "1" : "0"}>
      <i style={{ background: avatarFor(name) }}>{(name || "?")[0].toUpperCase()}</i>{name}
    </span>
  );
}

/* ======================== ASYNC ROOMS (no server) ======================== */

function AsyncRoom({ mic, lib, onFinish }) {
  const urlRoom = useMemo(() => readRoomFromUrl(), []);
  const [view, setView] = useState(urlRoom ? "guest" : "start");
  const [room, setRoom] = useState(urlRoom || null);
  const [hostName, setHostName] = useState("");
  const [topic, setTopic] = useState(() => pick(TOPICS["Placement & GD"]));
  const [myName, setMyName] = useState("");
  const [turns, setTurns] = useState([]);
  const [paste, setPaste] = useState("");
  const [msg, setMsg] = useState("");
  const [mode, setMode] = useState("mic");
  const [typed, setTyped] = useState("");
  const [myCode, setMyCode] = useState("");
  const [copied, setCopied] = useState(false);

  const typedRef = useRef(""); typedRef.current = typed;
  const modeRef = useRef("mic"); modeRef.current = mode;
  const nameRef = useRef(""); nameRef.current = myName;
  const roomRef = useRef(null); roomRef.current = room;

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const finishTurn = useCallback(async () => {
    const secs = Math.max(1, watch.value());
    mic.stop(); watch.stop();
    // stop the recorder first: only then does the tape get handed to Sarvam,
    // so settling before stopping used to wait for nothing and score the
    // rougher live transcript every time
    if (modeRef.current !== "type") await mic.settled();
    const text = (modeRef.current === "type" ? typedRef.current : mic.bestText().text).trim();
    if (!text) { flash("Nothing came through — try again."); return; }
    const code = makeTurnCode({ room: roomRef.current, name: nameRef.current || "Guest", text, seconds: secs, mode: modeRef.current });
    setMyCode(code);
    onFinish({ xp: 40, seconds: secs, kind: "gd" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic, onFinish]);

  const watch = useStopwatch((room && room.minutes ? room.minutes : 1) * 60, finishTurn);

  const create = () => {
    const r = makeRoom({ topic, host: hostName || "Host", minutes: 1, kind: "async" });
    setRoom(r); setTurns([]); setView("host");
  };

  const record = async () => {
    const ok = await mic.start();
    setMode(ok ? "mic" : "type"); setTyped(""); watch.start();
  };
  const write = () => { setMode("type"); setTyped(""); watch.start(); };

  const addPaste = () => {
    const codes = paste.split(/\s+/).map((x) => x.trim()).filter((x) => x.length > 20);
    const good = codes.map(readTurnCode).filter(Boolean).filter((t) => !room || t.roomId === room.id);
    if (!good.length) { flash("No readable turn codes in that. They're one long block of letters."); return; }
    setTurns((v) => mergeTurns([...v, ...good]));
    setPaste(""); flash(`${good.length} turn${good.length === 1 ? "" : "s"} added.`);
  };

  const copy = (text) => {
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch (e) { /* the field is selectable anyway */ }
  };

  /* ---------- start ---------- */
  if (view === "start") {
    return (
      <div>
        <h1 className="h1">Practise with <em>people</em>.</h1>
        <p className="sub">
          Async rooms need no server and no schedule. You set a topic, share a link, and everyone
          records their turn whenever they can. The room assembles it into one discussion and scores
          every person against what the others actually said.
        </p>
        <div className="card">
          <div className="eye">Your name</div>
          <input className="typebox" style={{ marginTop: 8, fontSize: 15 }} value={hostName}
            aria-label="Your name" onChange={(e) => setHostName(e.target.value)} placeholder="So people know who's who" />
          <div className="eye" style={{ marginTop: 16 }}>Topic</div>
          <div className="topic" style={{ minHeight: "auto", marginTop: 6, fontSize: 20 }}>{topic}</div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn sm" onClick={() => setTopic(pick([...TOPICS["Placement & GD"], ...TOPICS["Tech & AI"],
              ...TOPICS["Society & policy"], ...(lib.topics || []).map((t) => t.text)]))}>Different topic</button>
            {(lib.topics || []).length > 0 && (
              <button className="btn sm" onClick={() => setTopic(pick(lib.topics.map((t) => t.text)))}>From my library</button>
            )}
          </div>
          <button className="btn go" style={{ marginTop: 16, width: "100%" }} onClick={create}>Create the room</button>
        </div>
        <div className="rm-warn">
          Nothing is uploaded. The room lives in the link, and each turn is a code your friends send
          back to you — WhatsApp, email, anything.
        </div>
      </div>
    );
  }

  /* ---------- guest: someone opened an invite link ---------- */
  if (view === "guest") {
    return (
      <div>
        <h1 className="h1">You've been <em>invited</em>.</h1>
        <div className="card sky">
          <div className="eye">{room.host} started this room</div>
          <div className="topic" style={{ minHeight: "auto", marginTop: 6 }}>{room.topic}</div>
        </div>

        {!myCode ? (
          <div className="card">
            <div className="eye">Your name</div>
            <input className="typebox" style={{ marginTop: 8, fontSize: 15 }} value={myName}
              aria-label="Your name" onChange={(e) => setMyName(e.target.value)} placeholder="Name" />
            {!watch.running ? (
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn go" onClick={record} disabled={!myName.trim()}>
                  <span><Icon name="mic" size={18} /> Record my turn</span></button>
                <button className="btn" onClick={write} disabled={!myName.trim()}>Type it</button>
              </div>
            ) : (
              <>
                <div className="clock" style={{ marginTop: 12 }}>{fmt(watch.t)} <small>of {fmt(room.minutes * 60)}</small></div>
                <div className="vine"><i style={{ width: `${(watch.t / (room.minutes * 60)) * 100}%` }} /></div>
                {mode === "mic" ? (
                  <>
                    <Grass level={mic.level} live={mic.speaking} />
                    <div className="script" style={{ fontSize: 15.5, minHeight: 40 }}>
                      {mic.finalText}<span className="interim">{mic.interim}</span><span className="caret" />
                    </div>
                  </>
                ) : (
                  <Writer value={typed} onChange={setTyped} rows={5} placeholder="Your contribution to the discussion." />
                )}
                <button className="btn leaf" style={{ marginTop: 14 }} onClick={finishTurn}>Done</button>
              </>
            )}
          </div>
        ) : (
          <div className="card moss">
            <div className="eye">Send this back to {room.host}</div>
            <div className="rm-link">{myCode}</div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn go" onClick={() => copy(myCode)}>{copied ? "Copied" : "Copy my turn code"}</button>
              <button className="btn" onClick={() => { setMyCode(""); watch.reset(); }}>Record again</button>
            </div>
            <p className="ex" style={{ marginTop: 10 }}>
              Paste it into your group chat. It contains only your name and what you said.
            </p>
          </div>
        )}
        {msg && <div className="tip">{msg}</div>}
      </div>
    );
  }

  /* ---------- host: collect and score ---------- */
  const scored = turns.length ? scoreRoom(room, turns) : null;
  return (
    <div>
      <h1 className="h1">Room <em>{room.id}</em></h1>
      <div className="card sky">
        <div className="eye">Topic</div>
        <div className="topic" style={{ minHeight: "auto", marginTop: 6 }}>{room.topic}</div>
      </div>

      <div className="card">
        <div className="eye">Invite link — send this to your friends</div>
        <div className="rm-link">{roomLink(room)}</div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn go" onClick={() => copy(roomLink(room))}>{copied ? "Copied" : "Copy invite link"}</button>
        </div>
        <p className="ex" style={{ marginTop: 10 }}>
          They open it, record a turn, and send you back a code. Paste those below.
        </p>
      </div>

      <div className="card">
        <div className="eye">Your own turn</div>
        {!myCode ? (
          !watch.running ? (
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn go sm" onClick={() => { setMyName(hostName || "Host"); record(); }}>Record mine</button>
              <button className="btn sm" onClick={() => { setMyName(hostName || "Host"); write(); }}>Type mine</button>
            </div>
          ) : (
            <>
              <div className="clock" style={{ marginTop: 10 }}>{fmt(watch.t)}</div>
              {mode === "mic"
                ? <><Grass level={mic.level} live={mic.speaking} />
                    <div className="script" style={{ fontSize: 15 }}>{mic.finalText}<span className="interim">{mic.interim}</span></div></>
                : <Writer value={typed} onChange={setTyped} rows={4} placeholder="Your contribution." />}
              <button className="btn leaf sm" style={{ marginTop: 12 }} onClick={finishTurn}>Done</button>
            </>
          )
        ) : (
          <div className="row">
            <button className="btn sm" onClick={() => { const t = readTurnCode(myCode); if (t) { setTurns((v) => mergeTurns([...v, t])); setMyCode(""); flash("Your turn added."); } }}>
              Add my turn to the room</button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="eye">Paste turn codes</div>
        <Writer value={paste} onChange={setPaste} rows={4} placeholder="Paste one or more codes here — separated by spaces or new lines." />
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn leaf sm" onClick={addPaste}>Add to the room</button>
        </div>
        {turns.length > 0 && (
          <div className="rm-people">
            {[...new Set(turns.map((t) => t.name))].map((n) => <Person key={n} name={n} />)}
          </div>
        )}
      </div>

      {msg && <div className="tip" style={{ marginBottom: 14 }}>{msg}</div>}

      {scored && scored.cards.length > 0 && (
        <>
          <div className="card sun">
            <div className="role">
              <div className="rbadge"><Mascot mood="smug" size={46} /></div>
              <div><div className="rname">The room's verdict</div><div className="rrole">scored on contribution, not airtime</div></div>
            </div>
            <p style={{ fontSize: 15.5, lineHeight: 1.65 }}>{roomVerdict(scored.cards)}</p>
          </div>

          <div className="card">
            <div className="eye" style={{ marginBottom: 8 }}>Leaderboard</div>
            {scored.cards.map((c, i) => (
              <div className="rm-row" key={c.name}>
                <div className="rm-rank" data-r={i + 1}>{i + 1}</div>
                <div className="rm-meta">
                  <b>{c.name}</b>
                  <small>{c.turns} turn{c.turns === 1 ? "" : "s"} · {c.share}% of the airtime · {words0(c.text).length} words</small>
                  <div className="rm-bars">
                    {[["orig", c.contrib.originality], ["resp", c.contrib.responsiveness],
                      ["reason", c.contrib.reasoning], ["build", c.contrib.buildOn]].map(([k, v]) => (
                      <i key={k} style={{ width: `${Math.max(4, v / 2)}px`, opacity: 0.35 + v / 160 }} title={k} />
                    ))}
                  </div>
                </div>
                <div className="rm-tot">{c.total}</div>
              </div>
            ))}
            <p className="ex" style={{ marginTop: 10 }}>
              Bars, left to right: originality, responsiveness, reasoning, building on others.
            </p>
          </div>

          {scored.cards.map((c) => (
            <div className="card" key={c.name}>
              <div className="eye">{c.name} · {c.total}/100</div>
              <div className="gddial" style={{ marginTop: 10 }}>
                <div><b className={c.contrib.originality > 55 ? "ok" : "warn"}>{c.contrib.originality}</b><span>Original</span></div>
                <div><b className={c.contrib.responsiveness > 55 ? "ok" : "warn"}>{c.contrib.responsiveness}</b><span>Responsive</span></div>
                <div><b className={c.contrib.reasoning > 55 ? "ok" : "warn"}>{c.contrib.reasoning}</b><span>Reasoning</span></div>
                <div><b className={c.speech.clarity100 > 55 ? "ok" : "warn"}>{c.speech.clarity100}</b><span>Concise</span></div>
              </div>
              {contributionNotes(c.contrib, [c.text]).slice(0, 2).map((n, i) => (
                <div key={i} style={{ marginTop: 12 }}>
                  <div className="eye">{n.k}</div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "4px 0 0" }}>{n.v}</p>
                </div>
              ))}
              {c.speech.grammar.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="eye" style={{ marginBottom: 8 }}>Grammarian</div>
                  <Corrections items={c.speech.grammar.slice(0, 2)} />
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ========================= LIVE ROOMS (WebRTC) =========================== */

/* STUN only. Add TURN credentials here before real users — roughly one
   connection in seven fails without it on college wifi and mobile carriers. */
const ICE = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

function LiveRoom({ mic, lib, onFinish }) {
  const [phase, setPhase] = useState("setup");
  const [serverUrl, setServerUrl] = useState(() => {
    try { return window.localStorage.getItem("yap_ws") || "ws://localhost:8787"; } catch (e) { return "ws://localhost:8787"; }
  });
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(() => pick(TOPICS["Placement & GD"]));
  const [peers, setPeers] = useState([]);
  const [meId, setMeId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [floorId, setFloorId] = useState(null);
  const [queue, setQueue] = useState([]);
  const [lines, setLines] = useState([]);
  const [interimLine, setInterimLine] = useState("");
  const [modLine, setModLine] = useState(null);
  const [err, setErr] = useState(null);
  const [muted, setMuted] = useState(false);

  const wsRef = useRef(null);
  const pcs = useRef({});          // peerId -> RTCPeerConnection
  const streamRef = useRef(null);
  const audioBox = useRef(null);
  const linesRef = useRef([]);
  const sentRef = useRef("");
  const feedRef = useRef(null);


  const send = (o) => { const ws = wsRef.current; if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };

  const addLine = (l) => { linesRef.current = [...linesRef.current, l]; setLines(linesRef.current); };

  /* --- audio mesh --- */
  const makePeer = useCallback((peerId, polite) => {
    if (pcs.current[peerId]) return pcs.current[peerId];
    const pc = new RTCPeerConnection(ICE);
    pcs.current[peerId] = pc;
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => pc.addTrack(t, streamRef.current));
    pc.onicecandidate = (e) => { if (e.candidate) send({ type: "signal", to: peerId, data: { ice: e.candidate } }); };
    pc.ontrack = (e) => {
      let el = document.getElementById("aud-" + peerId);
      if (!el) {
        el = document.createElement("audio");
        el.id = "aud-" + peerId; el.autoplay = true; el.playsInline = true;
        if (audioBox.current) audioBox.current.appendChild(el);
      }
      el.srcObject = e.streams[0];
    };
    if (polite) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send({ type: "signal", to: peerId, data: { sdp: pc.localDescription } });
        } catch (e) { /* renegotiation race */ }
      };
    }
    return pc;
  }, []);

  const onSignal = useCallback(async (from, data) => {
    const pc = makePeer(from, false);
    try {
      if (data.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === "offer") {
          const ans = await pc.createAnswer();
          await pc.setLocalDescription(ans);
          send({ type: "signal", to: from, data: { sdp: pc.localDescription } });
        }
      } else if (data.ice) {
        await pc.addIceCandidate(new RTCIceCandidate(data.ice));
      }
    } catch (e) { /* candidate arrived before description */ }
  }, [makePeer]);

  const connect = async () => {
    setErr(null);
    if (!name.trim() || !code.trim()) { setErr("Room code and name are both needed."); return; }
    try { window.localStorage.setItem("yap_ws", serverUrl); } catch (e) { /* fine */ }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setErr("Couldn't open the microphone. A live room needs it — check permissions, and remember file:// blocks it.");
      return;
    }
    // our own words, transcribed locally and broadcast as text
    await mic.start();

    let ws;
    try { ws = new WebSocket(serverUrl); } catch (e) { setErr("That doesn't look like a WebSocket address."); return; }
    wsRef.current = ws;

    ws.onopen = () => { send({ type: "join", room: code.trim().toUpperCase(), name: name.trim(), topic }); setPhase("live"); };
    ws.onerror = () => setErr(`Can't reach ${serverUrl}. Is the signalling server running? (node server.js)`);
    ws.onclose = () => { if (phase === "live") setErr("Disconnected from the room."); };
    ws.onmessage = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      switch (m.type) {
        case "peers":
          setMeId(m.you); setHostId(m.host); setPeers(m.peers);
          (m.transcript || []).forEach(addLine);
          m.peers.forEach((p) => makePeer(p.id, true));   // we call the people already here
          break;
        case "joined": setPeers((v) => [...v, { id: m.id, name: m.name }]); break;
        case "left":
          setPeers((v) => v.filter((p) => p.id !== m.id));
          if (pcs.current[m.id]) { pcs.current[m.id].close(); delete pcs.current[m.id]; }
          { const el = document.getElementById("aud-" + m.id); if (el) el.remove(); }
          break;
        case "host": setHostId(m.id); break;
        case "signal": onSignal(m.from, m.data); break;
        case "say": if (m.final) addLine(m); break;
        case "queue": setQueue(m.queue || []); break;
        case "floor": setFloorId(m.id); break;
        case "moderate": setModLine(m.line); setTimeout(() => setModLine(null), 12000); break;
        case "end": setPhase("report"); break;
        case "error": setErr(m.reason); break;
        default: break;
      }
    };
  };

  /* broadcast our own finalised speech as text */
  useEffect(() => {
    if (phase !== "live") return;
    const id = setInterval(() => {
      const full = mic.finalText;
      if (full.length > sentRef.current.length) {
        const fresh = full.slice(sentRef.current.length).trim();
        sentRef.current = full;
        if (fresh) send({ type: "say", text: fresh, final: true });
      }
      setInterimLine(mic.interim);
    }, 1200);
    return () => clearInterval(id);
  }, [phase, mic.finalText, mic.interim]);

  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [lines]);

  /* host runs the moderator locally and relays its prompts */
  useEffect(() => {
    if (phase !== "live" || meId !== hostId) return;
    const id = setInterval(() => {
      const counts = {};
      linesRef.current.forEach((l) => { counts[l.name] = (counts[l.name] || 0) + words0(l.text).length; });
      const all = [{ id: meId, name }, ...peers];
      const quiet = all.map((p) => p.name).filter((n) => !counts[n] || counts[n] < 25);
      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      const hog = Object.entries(counts).find(([, v]) => v / total > 0.55);
      const lastAt = linesRef.current.length ? linesRef.current[linesRef.current.length - 1].at : Date.now();
      const line = moderatorLine({
        topic, silentFor: (Date.now() - lastAt) / 1000, quietest: quiet[0],
        hogging: hog ? hog[0] : null, stalled: (Date.now() - lastAt) / 1000,
        elapsed: 0, total: 300,
      });
      if (line) send({ type: "moderate", line });
    }, 30000);
    return () => clearInterval(id);
  }, [phase, meId, hostId, peers, name, topic]);

  const leave = () => {
    Object.values(pcs.current).forEach((pc) => pc.close());
    pcs.current = {};
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (wsRef.current) wsRef.current.close();
    mic.stop();
  };
  useEffect(() => () => leave(), []); // eslint-disable-line

  const toggleMute = () => {
    if (!streamRef.current) return;
    const on = !muted;
    streamRef.current.getAudioTracks().forEach((t) => { t.enabled = !on; });
    setMuted(on);
  };

  /* ---------- setup ---------- */
  if (phase === "setup") {
    return (
      <div>
        <h1 className="h1">Live room.<br /><em>Actual voices.</em></h1>
        <p className="sub">
          Everyone hears each other over a peer-to-peer connection. Each browser transcribes its own
          speech and shares only the text, so our server relays and nothing else — it never receives
          audio. One thing worth knowing: the browser's own speech recognition sends your audio to
          Google or Apple to turn it into text, exactly as the phone keyboard's dictation does.
        </p>
        {err && <div className="warnbox">{err}</div>}
        <div className="card">
          <div className="eye">Signalling server</div>
          <input className="typebox" style={{ marginTop: 8, fontFamily: "var(--mon)", fontSize: 13 }}
            aria-label="Signalling server address"
            value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} placeholder="ws://localhost:8787" />
          <p className="ex" style={{ marginTop: 8 }}>
            Run <b>node server.js</b> from the folder this file came in. On a real domain use wss://.
          </p>
        </div>
        <div className="card">
          <div className="eye">Room code</div>
          <input className="typebox" style={{ marginTop: 8, fontFamily: "var(--mon)", fontSize: 18, letterSpacing: ".18em", textTransform: "uppercase" }}
            aria-label="Room code"
            value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABCD123" />
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn sm" onClick={() => setCode(roomCode())}>Make a new code</button>
          </div>
          <div className="eye" style={{ marginTop: 16 }}>Your name</div>
          <input className="typebox" style={{ marginTop: 8, fontSize: 15 }} value={name}
            aria-label="Your name" onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <div className="eye" style={{ marginTop: 16 }}>Topic</div>
          <div className="topic" style={{ minHeight: "auto", marginTop: 6, fontSize: 19 }}>{topic}</div>
          <button className="btn sm" style={{ marginTop: 10 }}
            onClick={() => setTopic(pick([...TOPICS["Placement & GD"], ...TOPICS["Tech & AI"],
              ...(lib.topics || []).map((t) => t.text)]))}>Different topic</button>
          <button className="btn go" style={{ marginTop: 16, width: "100%" }} onClick={connect}>
            <span><Icon name="mic" size={18} /> Join the room</span></button>
        </div>
        <div className="rm-warn">
          First person in the room is the host and controls the floor. Share the code and the server
          address with your friends — they need both.
        </div>
      </div>
    );
  }

  /* ---------- live ---------- */
  if (phase === "live") {
    const all = [{ id: meId, name }, ...peers];
    const iHaveFloor = floorId === meId;
    const isHost = meId === hostId;
    return (
      <div>
        <div ref={audioBox} style={{ display: "none" }} />
        {err && <div className="warnbox">{err}</div>}
        <div className="card coral">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="rm-live"><span className="rm-dot" />live · room {code}</span>
            <span className="eye">{all.length} in the room</span>
          </div>
          <div style={{ fontFamily: "var(--dis)", fontWeight: 600, fontSize: 18, lineHeight: 1.3, margin: "10px 0" }}>{topic}</div>
          <div className="rm-people">
            {all.map((p) => <Person key={p.id} name={p.name} live={floorId === p.id} muted={p.id === meId && muted} />)}
          </div>
          {queue.length > 0 && <p className="queue" style={{ marginTop: 10 }}>
            <Icon name="hand" size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />waiting: {queue.join(", ")}</p>}
          {modLine && <div className="rm-mod"><b>Moderator.</b> {modLine}</div>}
        </div>

        <div className="card">
          <div className="rm-feed" ref={feedRef}>
            {lines.length === 0 && (
              <div className="emptystate"><Mascot mood="curious" size={74} />
                <p className="ex">Nobody has spoken yet. Everything said in the room appears here as text.</p></div>
            )}
            {lines.map((l, i) => (
              <div className={"rm-line" + (l.id === meId ? " mine" : "")} key={i}>
                <b>{l.name}</b>{l.text}
              </div>
            ))}
            {interimLine && <div className="rm-line interim"><b>{name}</b>{interimLine}</div>}
          </div>

          {iHaveFloor
            ? <><Grass level={mic.level} live={mic.speaking} />
                <p className="ex" style={{ textAlign: "center" }}>You have the floor.</p></>
            : null}

          <div className="row" style={{ marginTop: 14 }}>
            {iHaveFloor
              ? <button className="btn leaf" onClick={() => send({ type: "yield" })}>Hand it on</button>
              : <button className="btn gold" onClick={() => send({ type: "hand", up: true })}>Raise hand</button>}
            <button className="btn" onClick={toggleMute}>{muted ? "Unmute" : "Mute"}</button>
            {isHost && <button className="btn" onClick={() => send({ type: "end" })}>End for everyone</button>}
            <button className="btn" onClick={() => { leave(); setPhase("report"); }}>Leave</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- report: everyone has the same transcript, so scoring is local ---------- */
  const turns = lines.map((l) => ({ name: l.name, text: l.text, seconds: Math.max(4, Math.round(words0(l.text).length / 2.4)), mode: "mic", at: l.at }));
  const scored = turns.length ? scoreRoom({ id: code, minutes: 5 }, turns) : null;
  return (
    <div>
      <h1 className="h1">Room <em>debrief</em></h1>
      {!scored ? <div className="card"><p className="ex">Nothing was transcribed, so there's nothing to score.</p></div> : (
        <>
          <div className="card sun">
            <div className="role">
              <div className="rbadge"><Mascot mood="smug" size={46} /></div>
              <div><div className="rname">The room's verdict</div><div className="rrole">everyone scored on the same transcript</div></div>
            </div>
            <p style={{ fontSize: 15.5, lineHeight: 1.65 }}>{roomVerdict(scored.cards)}</p>
          </div>
          <div className="card">
            <div className="eye" style={{ marginBottom: 8 }}>Leaderboard</div>
            {scored.cards.map((c, i) => (
              <div className="rm-row" key={c.name}>
                <div className="rm-rank" data-r={i + 1}>{i + 1}</div>
                <div className="rm-meta"><b>{c.name}</b>
                  <small>{c.turns} contribution{c.turns === 1 ? "" : "s"} · {words0(c.text).length} words</small></div>
                <div className="rm-tot">{c.total}</div>
              </div>
            ))}
          </div>
          {scored.cards.filter((c) => c.name === name).map((c) => (
            <div className="card moss" key={c.name}>
              <div className="eye">Your card</div>
              <div className="gddial" style={{ marginTop: 10 }}>
                <div><b>{c.contrib.originality}</b><span>Original</span></div>
                <div><b>{c.contrib.responsiveness}</b><span>Responsive</span></div>
                <div><b>{c.contrib.reasoning}</b><span>Reasoning</span></div>
                <div><b>{c.speech.clarity100}</b><span>Concise</span></div>
              </div>
              {contributionNotes(c.contrib, [c.text]).map((n, i) => (
                <div key={i} style={{ marginTop: 12 }}>
                  <div className="eye">{n.k}</div>
                  <p style={{ fontSize: 15, lineHeight: 1.6, margin: "4px 0 0" }}>{n.v}</p>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
      <button className="btn go" onClick={() => { setPhase("setup"); setLines([]); linesRef.current = []; }}>Another room</button>
    </div>
  );
}

/* --------------------------- rooms tab shell ----------------------------- */

function Rooms({ mic, lib, onFinish }) {
  const [kind, setKind] = useState(() => (readRoomFromUrl() ? "async" : "async"));
  return (
    <div>
      <div className="seg">
        <button data-on={kind === "async" ? "1" : "0"} onClick={() => setKind("async")}>Async room</button>
        <button data-on={kind === "live" ? "1" : "0"} onClick={() => setKind("live")}>Live room</button>
      </div>
      {kind === "async"
        ? <AsyncRoom mic={mic} lib={lib} onFinish={onFinish} />
        : <LiveRoom mic={mic} lib={lib} onFinish={onFinish} />}
    </div>
  );
}


/* ==========================================================================
   DEBATE ENGINE
   A debate answer is judged on things a Table Topic isn't: did you hold the
   line you chose, did you bring evidence, did you deal with the other side.
   All three are measured from the transcript, so the mode works with no key.
   ========================================================================== */

const STANCES = [
  { id: "for", label: "FOR", blurb: "Argue the motion. Make the strongest case you can.",
    verb: "supporting", colour: "var(--moss)" },
  { id: "against", label: "AGAINST", blurb: "Oppose the motion. Attack its weakest joint.",
    verb: "opposing", colour: "var(--coral)" },
  { id: "neutral", label: "NEUTRAL", blurb: "Weigh both sides, then land somewhere specific.",
    verb: "weighing", colour: "var(--sky)" },
];
const stanceById = (id) => STANCES.find((x) => x.id === id) || STANCES[0];

const PREP_TIMES = [
  { id: 30, label: "30 sec", note: "Cold. Closest to a real GD." },
  { id: 60, label: "1 min", note: "One point, one example." },
  { id: 120, label: "2 min", note: "Room for a counter." },
  { id: 0, label: "Custom", note: "Set your own." },
];

/* ---- language that signals which side you are on ---- */

const FOR_MARKERS = /\b(i support|i agree|in favour|in favor|we should|we must|the motion is right|this is necessary|clearly beneficial|strongly believe|the benefits|makes sense to|worth doing|i'd back|i back this)\b/gi;
const AGAINST_MARKERS = /\b(i oppose|i disagree|against this|should not|shouldn't|must not|the motion fails|this is wrong|harmful|a mistake|i reject|doesn't work|does not work|the danger|the risk of doing)\b/gi;
const NEUTRAL_MARKERS = /\b(on balance|both sides|it depends|there is merit|partly|to an extent|neither|somewhere between|conditional|with caveats|nuanced|in some cases)\b/gi;

/* ---- the pieces of a real argument ---- */
const DBT_CLAIM = /\b(i argue|my case is|the point is|the core issue|fundamentally|the key question|my position|i'd say)\b/gi;
const DBT_EVIDENCE = /(\b(for example|for instance|research|study|studies|survey|data|report|according to|percent|per cent|statistics|evidence|case of|look at|consider the case|history shows|in \d{4})\b|\b(lakhs?|crores?|million|billion|thousand)\b|\d+\s*%|₹\s*\d|\$\s*\d)/gi;
const DBT_COUNTER = /\b(some (would |will |might )?(say|argue|claim)|critics (say|argue|claim)|the counterargument|the other side|it could be argued|one objection|admittedly|granted|of course|yes, but|while it's true|although some|opponents)\b/gi;
const DBT_REBUT = /\b(however|but that|that ignores|the problem with that|this misses|even so|nevertheless|that's precisely why|which is exactly|doesn't hold|falls apart)\b/gi;
const DBT_CONCLUDE = /\b(so my position|to conclude|in conclusion|so overall|which is why i|that's why i|for these reasons|so i stand|ultimately)\b/gi;

const countRe = (t, re) => (t.match(new RegExp(re.source, re.flags)) || []).length;

/* Did they hold the line they picked? Not a style question — a debate is
   scored on whether your case survives your own speech. */
function stanceConsistency(text, stance, base) {
  const t = " " + (text || "").toLowerCase() + " ";
  const f = countRe(t, FOR_MARKERS);
  const a = countRe(t, AGAINST_MARKERS);
  const n = countRe(t, NEUTRAL_MARKERS);
  const total = f + a + n;

  // FOR/AGAINST/NEUTRAL markers are English phrases ("i support", "on
  // balance"...), so they read as zero on a Hindi or Tamil speech even when
  // the speaker took a clear side. Falling through to "you never said
  // plainly" would be a false claim about a language this check can't parse.
  // base.hasStance already knows, in every supported language, whether a
  // position was taken at all — that's the honest thing to report instead of
  // guessing which side from markers that were never going to match.
  if (base && !base.isEnglish && total === 0) {
    const score = base.hasStance ? 62 : 30;
    const note = base.hasStance
      ? `You did take a position in ${langName(base.lang.primary)}. Automatically checking which side, and whether you held it, only works in English right now, so that part isn't scored — the rest of this report is.`
      : `I couldn't find a clear position in what you said. State it early, in your own language, before you build the case.`;
    return { score, forCount: f, againstCount: a, neutralCount: n, drifted: false, note, unscoredDirection: true };
  }

  // A neutral speaker *should* show both sides; that is the position, not drift.
  if (stance === "neutral") {
    const balanced = f > 0 && a > 0;
    const lopsided = (f > 0) !== (a > 0);          // argued one side only
    const landed = DBT_CONCLUDE.test(text || "");
    const score = Math.min(100, (balanced ? 55 : lopsided ? 18 : 34) + (n > 0 ? 25 : 0) + (landed ? 20 : 0));
    // Three different failures, three different notes. Saying "both sides have
    // merit" and stopping is not the same as secretly arguing one side.
    const note = lopsided
      ? `You called this neutral but only argued the ${f > 0 ? "for" : "against"} side. That's a stance with a hedge in front of it.`
      : !balanced
        ? "You described the debate rather than taking part in it. Neutral still means making a case — for a condition, a split, or a threshold — not narrating that opinions differ."
        : landed
          ? "You weighed both sides and still landed somewhere. That's the hard version of neutral, and you did it."
          : "You weighed both sides but never landed. Neutral isn't 'no opinion' — it's a specific position you have to state.";
    return { score, forCount: f, againstCount: a, neutralCount: n, drifted: lopsided, note };
  }

  const mine = stance === "for" ? f : a;
  const theirs = stance === "for" ? a : f;
  if (total === 0) {
    return { score: 35, forCount: f, againstCount: a, neutralCount: n, drifted: false,
      note: `You never said plainly that you were ${stanceById(stance).verb} the motion. A listener shouldn't have to infer your side.` };
  }
  const share = mine / (mine + theirs || 1);
  const drifted = theirs > mine;
  const score = Math.max(0, Math.min(100, Math.round(share * 78 + Math.min(mine, 3) * 7)));
  return { score, forCount: f, againstCount: a, neutralCount: n, drifted,
    note: drifted
      ? `You chose ${stanceById(stance).label} but argued the other side more often than your own. Conceding a point is strong; switching sides isn't.`
      : share > 0.85
        ? `You held ${stanceById(stance).label} throughout without wobbling.`
        : `Mostly held ${stanceById(stance).label}, with a few lines that read like the other side.` };
}

/* Full debate analysis. Wraps the existing engine — every ordinary speech
   metric still comes from analyse(), untouched. */
function analyseDebate(text, seconds, mode, stance, lang) {
  const base = analyse(text, seconds, mode, lang);
  const t = " " + (text || "").toLowerCase() + " ";
  const wc = base.wc;

  const consistency = stanceConsistency(text, stance, base);
  const evidenceHits = countRe(t, DBT_EVIDENCE);
  const counterHits = countRe(t, DBT_COUNTER);
  const rebutHits = countRe(t, DBT_REBUT);
  const claimHits = countRe(t, DBT_CLAIM);

  // DBT_EVIDENCE still catches numbers, percentages and currency regardless
  // of language, so it stays on either way; its phrase half ("for example",
  // "research shows"...) just won't fire outside English.
  const evidence = wc < 10 ? 0 : Math.min(100, Math.round(evidenceHits * 26 + Math.min(wc / 12, 20)));
  // raising the other side is worth something; answering it is worth more
  const counter = Math.min(100, counterHits * 30 + rebutHits * 22);
  // CLAIM/CONCLUDE are English phrases too ("my case is", "to conclude"), so
  // outside English this leans on the primitives analyse() already detects
  // in every supported language — hasStance and hasClose — instead of
  // silently reading as "no argument" for a language it can't parse.
  const argument = wc < 10 ? 0 : Math.min(100, Math.round(base.isEnglish
    ? (claimHits > 0 ? 26 : 0) + Math.min(base.connectives * 11, 33) +
      (DBT_CONCLUDE.test(text || "") ? 21 : 0) + Math.min(evidenceHits * 10, 20)
    : (base.hasStance ? 26 : 0) + Math.min(base.connectives * 11, 33) +
      (base.hasClose ? 21 : 0) + Math.min(evidenceHits * 10, 20)
  ));

  /* Delivery counts, but a debate is won on the case. Weights say so. */
  const overall = wc < 8 ? 0 : Math.round(
    argument * 0.21 + consistency.score * 0.19 + evidence * 0.15 + counter * 0.13 +
    base.structure * 0.12 + base.clarity100 * 0.1 + base.fluency * 0.1
  );

  return { ...base, stance, consistency, evidence, counter, argument,
    evidenceHits, counterHits, rebutHits, debateScore: overall };
}

/* ---- the PREP scaffold, and what to say when the user has no key ---- */

const PREP_FRAME = [
  { k: "P", label: "Point", ask: "One sentence. What is your position?" },
  { k: "R", label: "Reason", ask: "Why? The mechanism, not the slogan." },
  { k: "E", label: "Example", ask: "One concrete case, ideally with a number." },
  { k: "P", label: "Point", ask: "Say the position again, sharpened by what you just proved." },
];

/* A usable brief with no API key. Generic by necessity, but it is a real
   scaffold rather than a placeholder that shrugs. */
function localBrief(topic, stance) {
  const s = stanceById(stance);
  const angles = {
    for: ["Who gains, and how much — name them.",
      "What breaks if we do nothing? The cost of the status quo is your strongest ground.",
      "The strongest objection is usually cost or feasibility. Concede it, then show why it's worth paying.",
      "Find one place this already works. Precedent beats prediction."],
    against: ["Attack the mechanism, not the motive. Everyone agrees the goal is good.",
      "Who bears the cost, and were they asked?",
      "What are the second-order effects nobody planned for?",
      "Name the cheaper alternative that achieves most of the same benefit."],
    neutral: ["Say what would have to be true for each side to be right.",
      "Split the motion: which part do you accept, which do you reject?",
      "Name the condition that decides it, then say which side of that line we're on.",
      "End with a position, not a shrug. 'It depends' is only useful if you say on what."],
  };
  return {
    local: true,
    stance: s.id,
    summary: `You're ${s.verb} “${topic}”. Without a research key, here's the shape of a strong ${s.label} case — the substance has to come from you, which is closer to how a real GD works anyway.`,
    points: angles[s.id],
    counters: ["Assume the other side is competent and has the obvious rebuttal ready.",
      "Whatever your weakest claim is, they will find it. Say it yourself first and defuse it."],
    facts: [], examples: [],
  };
}

const BRIEF_SYS = `You prepare a debate brief for an Indian college student who has two minutes to get ready. Be concrete and honest — never invent statistics, and never cite a study you are not confident exists.
Return ONLY raw JSON:
{"summary":"what this debate is really about, 1-2 sentences, framed for their chosen side",
"points":["3-4 arguments FOR THEIR SIDE, each one sentence, each a different line of attack"],
"counters":["2-3 objections the other side will raise, each with a short answer in the same string"],
"facts":["2-3 verifiable facts or figures, each with its source named inline. If you are not confident, return an empty array rather than a plausible-sounding number."],
"examples":["1-2 concrete real cases, Indian where possible"]}
Write for someone about to speak out loud, not for an essay: short, sayable sentences.`;

const DEBATE_EVAL_SYS = `You are judging one debate speech. The speaker chose a side before speaking and had limited prep time. The text is a speech transcript — no punctuation, ignore it.
Return ONLY raw JSON:
{"argument":"the quality of the case they built, 1-2 sentences, quoting them",
"consistency":"did they hold their chosen side, and where did they wobble, 1-2 sentences",
"evidence":"what they used as support and what was missing, 1 sentence",
"counter":"how they handled the other side, or that they ignored it, 1 sentence",
"fix":"the single change that would most improve the next round, 2 sentences, concrete"}
Judge the case, never the position — a well-argued side you disagree with scores high. Be direct, no praise padding.`;


/* ---------------------------- INTERVIEW UI -------------------------------- */

const IV_CSS = `
.iv-q{font-family:var(--dis);font-weight:600;font-size:clamp(20px,5.2vw,26px);line-height:1.25;letter-spacing:-.02em;margin:6px 0 0}
.iv-probe{border-left:5px solid var(--coral);padding:8px 0 8px 14px;margin-top:12px;font-size:15.5px;line-height:1.6;animation:rise .45s cubic-bezier(.2,1.2,.35,1) both}
.iv-who{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.iv-av{width:38px;height:38px;border-radius:13px;border:2.5px solid var(--line);color:var(--ink);flex:0 0 38px}
.iv-name{font-size:12.5px;font-weight:700}
.iv-sub{font-family:var(--mon);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink60)}
.iv-log{max-height:210px;overflow-y:auto;padding-right:4px}
.iv-turn{padding:10px 0;border-bottom:2px dotted var(--line);font-size:14.5px;line-height:1.55}
.iv-turn:last-child{border-bottom:none}
.iv-turn b{display:block;font-family:var(--mon);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink60);margin-bottom:3px}
.iv-turn.me{color:var(--moss)}
.iv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:8px}
.iv-opt:hover{transform:translateY(-2px)}
.iv-opt:active{transform:scale(.95)}
.iv-opt{border:2.5px solid var(--line);background:var(--paper2);border-radius:14px;padding:11px 12px;cursor:pointer;text-align:left;font-size:13.5px;font-weight:600;font-family:var(--bod);transition:transform .2s cubic-bezier(.2,1.4,.4,1),background .2s,box-shadow .2s}
.iv-opt[data-on="1"]{transform:translateY(-2px) rotate(-.8deg);background:var(--ink);color:var(--paper);box-shadow:0 6px 20px rgba(157,128,255,.35)}
.iv-opt small{display:block;font-weight:400;font-size:11px;opacity:.65;margin-top:2px}
.tl{width:100%;height:132px;overflow:visible}
.tl-lbl{font-family:var(--mon);font-size:9.5px;fill:var(--ink60)}
.mom{border:2.5px solid var(--coral);border-radius:16px;padding:13px 15px;margin-bottom:10px;background:rgba(255,122,99,.09)}
.mom .k{font-family:var(--mon);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;background:var(--coral);color:#fff;border-radius:999px;padding:3px 10px;display:inline-block;margin-bottom:8px}
.mom .cost{float:right;font-family:var(--mon);font-size:12px;color:var(--coral);font-weight:700}
.mom q{display:block;font-style:italic;color:var(--ink60);font-size:13px;margin-top:8px;line-height:1.5}
.star4{display:flex;gap:6px;margin-top:8px}
.star4 span{flex:1;text-align:center;font-family:var(--mon);font-size:9px;letter-spacing:.1em;border:2px solid var(--line);border-radius:8px;padding:5px 2px;background:var(--paper)}
.star4 span[data-on="1"]{background:var(--moss);color:#fff;border-color:var(--moss)}
.skel{border:2.5px solid var(--line);border-radius:16px;overflow:hidden;margin-top:10px}
.skel-row{padding:12px 14px;border-bottom:2px dotted var(--line)}
.skel-row:last-child{border-bottom:none}
.skel-row b{font-family:var(--mon);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink60);display:block;margin-bottom:5px}
.skel-row p{margin:0;font-size:15px;line-height:1.6}
.skel-row.gap{background:rgba(255,122,99,.09)}
.skel-row.gap p{color:var(--coral);font-weight:600}
.skel-row small{display:block;font-family:var(--mon);font-size:10.5px;color:var(--ink60);margin-top:6px}`;

/* Performance across the interview, drawn as one line with the low points marked. */
function Timeline({ answers }) {
  const w = 320, h = 110, pad = 14;
  const pts = answers.map((a, i) => ({
    x: pad + (answers.length === 1 ? (w - pad * 2) / 2 : (i / (answers.length - 1)) * (w - pad * 2)),
    y: h - pad - (a.score / 100) * (h - pad * 2),
    s: a.score, i,
  }));
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const avg = answers.length ? answers.reduce((s, a) => s + a.score, 0) / answers.length : 0;
  const avgY = h - pad - (avg / 100) * (h - pad * 2);
  return (
    <svg className="tl" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img"
      aria-label="Performance across the interview">
      {[0, 50, 100].map((v) => {
        const y = h - pad - (v / 100) * (h - pad * 2);
        return <line key={v} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#c9d9bd" strokeWidth="1" strokeDasharray="3 4" />;
      })}
      <line x1={pad} y1={avgY} x2={w - pad} y2={avgY} stroke="#7a5cf0" strokeWidth="1.5" opacity=".45" />
      <path d={path} fill="none" stroke="#f4f1ff" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p) => (
        <g key={p.i}>
          <circle cx={p.x} cy={p.y} r="5.5" fill={p.s >= 65 ? "#7a5cf0" : p.s >= 45 ? "#ffc857" : "#ff7a63"}
            stroke="#f4f1ff" strokeWidth="2" />
          <text className="tl-lbl" x={p.x} y={h - 2} textAnchor="middle">Q{p.i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

const IV_SYS = `You are conducting a mock job interview for an Indian candidate. You are the interviewer, not a coach — do not give feedback during the interview.
You will be given the role, level, interview type, difficulty, the question you just asked, the candidate's transcribed answer, and a measured analysis of that answer.
Return ONLY raw JSON: {"line":"your next thing to say","isFollowUp":true|false}
If the analysis shows a specific weakness (no result, vague, off-topic, hedging), follow up on THAT weakness by quoting or referring to something they actually said. Otherwise move to a new question appropriate to the role and type.
One or two sentences. Speak like a real interviewer: direct, unimpressed by fluff, specific. Difficulty "Gentle" = warm and encouraging. "Realistic" = neutral and probing. "Brutal" = sceptical, interrupts padding, demands numbers. Never use emoji or stage directions.`;

const IV_COACH_SYS = `You are an interview coach reviewing one answer from a mock interview. The answer is a speech transcript — ignore punctuation and capitalisation.
Return ONLY raw JSON: {"rewrite":"their answer restructured, using THEIR OWN facts, examples and vocabulary, 3-5 sentences","why":"what changed and why it lands better, 1-2 sentences"}
Rules: never invent facts they didn't give. If they gave no result, write the result line as a bracketed instruction like "[add the outcome here — a number if you have one]". Keep their tone and level of formality. Do not make them sound like a corporate press release.`;

function MockInterview({ mic, onFinish, lib }) {
  const [stage, setStage] = useState("setup");
  const [setup, setSetup] = useState({
    role: "Fresher / any role", industry: "Technology", level: "Student / fresher",
    type: "HR & fit", difficulty: "Realistic", duration: 10,
  });
  const [current, setCurrent] = useState("");
  const [probe, setProbe] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [log, setLog] = useState([]);
  const [mode, setMode] = useState("mic");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [rewrites, setRewrites] = useState({});

  const askedKeys = useRef([]);
  const askedQs = useRef([]);
  const answersRef = useRef([]);
  const logRef = useRef([]);
  const currentRef = useRef("");
  const typedRef = useRef(""); typedRef.current = typed;
  const modeRef = useRef("mic"); modeRef.current = mode;
  const scrollRef = useRef(null);

  const plan = IV_DURATIONS.find((d) => d.id === setup.duration) || IV_DURATIONS[1];
  const answerLimit = setup.difficulty === "Brutal" ? 75 : 90;

  const pushLog = (who, text) => {
    logRef.current = [...logRef.current, { who, text }];
    setLog(logRef.current);
  };

  const submit = useCallback(async () => {
    const secs = Math.max(1, watch.value());
    const voiced = modeRef.current === "mic" ? Math.round(mic.voicedSeconds()) : null;
    mic.stop(); watch.stop();
    if (modeRef.current !== "type") await mic.settled();
    const text = (modeRef.current === "type" ? typedRef.current : mic.bestText().text).trim();

    const a = analyseAnswer(currentRef.current, text, secs, modeRef.current, setup.role, voiced);
    answersRef.current = [...answersRef.current, a];
    setAnswers(answersRef.current);
    pushLog("me", text || "(nothing said)");
    setTyped("");

    if (answersRef.current.length >= plan.q) { finishInterview(); return; }

    setBusy(true);
    const local = decideFollowUp(a, askedKeys.current, setup.difficulty);
    const fallback = () => {
      if (local) {
        askedKeys.current = [...askedKeys.current, local.key];
        setProbe(local.line);
        pushLog("iv", local.line);
        currentRef.current = local.line.includes("?") ? local.line : currentRef.current;
      } else {
        const q = nextQuestion({ ...setup, asked: askedQs.current });
        askedQs.current = [...askedQs.current, q];
        setProbe(null); setCurrent(q); currentRef.current = q;
        pushLog("iv", q);
      }
      setBusy(false); setStage("answer");
    };

    askClaude(IV_SYS,
      `Role: ${setup.role} · Industry: ${setup.industry} · Level: ${setup.level}\n` +
      `Type: ${setup.type} · Difficulty: ${setup.difficulty}\n` +
      `Question asked: "${currentRef.current}"\nCandidate answered: """${text}"""\n` +
      `Measured: relevance ${a.relevance}, specificity ${a.specificity}, depth ${a.depth}, ` +
      `structure ${a.structure}, confidence ${a.confidence}, STAR result present: ${a.star.r}, ` +
      `hedges ${a.hedges}, unsure ${a.unsure}, words ${a.wc}.\n` +
      `Questions already asked: ${askedQs.current.join(" | ")}`, 320)
      .then((j) => {
        const line = String(j.line);
        if (j.isFollowUp) { setProbe(line); } else { setProbe(null); setCurrent(line); askedQs.current = [...askedQs.current, line]; }
        currentRef.current = line;
        pushLog("iv", line);
        setBusy(false); setStage("answer");
      })
      .catch(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic, setup, plan.q]);

  const watch = useStopwatch(answerLimit, submit);

  const finishInterview = () => { mic.stop(); watch.stop(); setStage("report"); onFinish({ xp: 80, seconds: 0, kind: "topic" }); };

  const begin = async () => {
    answersRef.current = []; logRef.current = []; askedKeys.current = []; askedQs.current = [];
    setAnswers([]); setLog([]); setProbe(null); setRewrites({});
    const q = nextQuestion({ ...setup, asked: [] });
    askedQs.current = [q]; setCurrent(q); currentRef.current = q;
    pushLog("iv", q);
    setStage("answer");
  };

  const startAnswer = async () => {
    setTyped("");
    const ok = await mic.start();
    setMode(ok ? "mic" : "type");
    watch.start();
  };
  const writeAnswer = () => { setTyped(""); setMode("type"); watch.start(); };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [log]);

  const askRewrite = (i) => {
    const a = answers[i];
    setRewrites((r) => ({ ...r, [i]: { loading: true } }));
    askClaude(IV_COACH_SYS, `Question: "${a.question}"\nTheir answer: """${a.text}"""`, 600)
      .then((j) => setRewrites((r) => ({ ...r, [i]: j })))
      .catch(() => setRewrites((r) => ({ ...r, [i]: { fail: true } })));
  };

  /* ---------------- setup ---------------- */
  if (stage === "setup") {
    const Group = ({ label, opts, val, onPick, sub }) => (
      <div className="card">
        <div className="eye">{label}</div>
        <div className="iv-grid" style={{ marginTop: 10 }}>
          {opts.map((o) => {
            const v = typeof o === "string" ? o : o.label;
            const id = typeof o === "string" ? o : o.id;
            return (
              <button key={v} className="iv-opt" data-on={val === id ? "1" : "0"} onClick={() => onPick(id)}>
                {v}{sub && sub[id] && <small>{sub[id]}</small>}
              </button>
            );
          })}
        </div>
      </div>
    );
    return (
      <div>
        <h1 className="h1">Mock <em>interview</em></h1>
        <p className="sub">
          A real interviewer doesn't read from a list — they follow what you just said. This one does
          the same, then scores every answer on twenty dimensions and shows you the moments that cost
          you.
        </p>
        <Notice mic={mic} />
        <Group label="Role" opts={Object.keys(IV_ROLES)} val={setup.role} onPick={(v) => setSetup({ ...setup, role: v })} />
        <Group label="Industry" opts={["Technology", "Finance", "Consulting", "FMCG / retail", "Healthcare", "Manufacturing", "Media", "Public sector"]}
          val={setup.industry} onPick={(v) => setSetup({ ...setup, industry: v })} />
        <Group label="Experience" opts={IV_LEVELS} val={setup.level} onPick={(v) => setSetup({ ...setup, level: v })} />
        <Group label="Interview type" opts={Object.keys(IV_TYPES)} val={setup.type} onPick={(v) => setSetup({ ...setup, type: v })}
          sub={{ "HR & fit": "motivation, self-awareness", "Behavioural": "past behaviour, STAR",
                 "Technical": "how you work and decide", "Case / problem": "structured thinking", "Stress": "pressure and pushback" }} />
        <Group label="Difficulty" opts={IV_DIFF} val={setup.difficulty} onPick={(v) => setSetup({ ...setup, difficulty: v })}
          sub={{ Gentle: "warm, encouraging", Realistic: "neutral, probing", Brutal: "sceptical, demands numbers" }} />
        <Group label="Length" opts={IV_DURATIONS.map((d) => ({ id: d.id, label: d.label }))} val={setup.duration}
          onPick={(v) => setSetup({ ...setup, duration: v })}
          sub={IV_DURATIONS.reduce((m, d) => ({ ...m, [d.id]: `${d.q} questions` }), {})} />
        <button className="btn go" onClick={begin} style={{ width: "100%" }}>
          <span><Icon name="chat" size={19} /> Start the interview</span>
        </button>
      </div>
    );
  }

  /* ---------------- live ---------------- */
  if (stage === "answer") {
    const done = answers.length;
    return (
      <div>
        <div className="card coral">
          <div className="tag">{done} of {plan.q}</div>
          <div className="iv-who">
            <div className="iv-av">
              <span className="avtint" style={{ background: "var(--coral)" }} />
              <Mascot mood={setup.difficulty === "Brutal" ? "annoyed" : setup.difficulty === "Gentle" ? "wave" : "inspect"} size={38} />
            </div>
            <div><div className="iv-name">Your interviewer</div>
              <div className="iv-sub">{setup.type} · {setup.difficulty} · {setup.role}</div></div>
          </div>
          <div className="iv-q" role="status" aria-live="polite">{current}</div>
          {sarvamReady() && (
            <button className="btn sm" style={{ marginTop: 10 }}
              onClick={() => speakAs("interviewer", probe || current, replyLangCode())}>
              <span><Icon name="wave" size={16} /> Hear the question</span>
            </button>
          )}
          {probe && (
            <div className="mascrow" style={{ marginTop: 12 }}>
              <Mascot mood="inspect" size={54} className="masc-peek" />
              <div className="bubble">{probe}</div>
            </div>
          )}
          {busy && <p className="ex" style={{ marginTop: 10 }}><span className="spin" />they're considering that…</p>}
          <div className="vine" style={{ marginTop: 14 }}>
            <i style={{ width: `${(done / plan.q) * 100}%` }} />
          </div>
        </div>

        <div className="card">
          {!watch.running ? (
            <div className="row">
              <button className="btn go" onClick={startAnswer} disabled={busy}>
                <span><Icon name="mic" size={18} /> Answer out loud</span></button>
              <button className="btn" onClick={writeAnswer} disabled={busy}>Type the answer</button>
              <button className="btn" onClick={finishInterview}>End early</button>
            </div>
          ) : (
            <>
              <div className="clock">{fmt(watch.t)} <small>of {fmt(answerLimit)}</small></div>
              <div className="vine"><i className={watch.t > answerLimit * 0.8 ? "r" : ""}
                style={{ width: `${(watch.t / answerLimit) * 100}%` }} /></div>
              {mode === "mic" ? (
                <>
                  <Grass level={mic.level} live={mic.speaking} />
                  <div className="script" style={{ fontSize: 15.5, minHeight: 40 }}>
                    {mic.finalText}<span className="interim">{mic.interim}</span><span className="caret" />
                  </div>
                </>
              ) : (
                <Writer value={typed} onChange={setTyped} rows={5}
                  placeholder="Answer the way you'd say it out loud — the analysis is on the words, not the typing." />
              )}
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn leaf" onClick={submit}>Submit answer</button>
              </div>
            </>
          )}
        </div>

        {log.length > 1 && (
          <div className="card">
            <div className="eye" style={{ marginBottom: 8 }}>So far</div>
            <div className="iv-log" ref={scrollRef}>
              {log.map((l, i) => (
                <div className={"iv-turn" + (l.who === "me" ? " me" : "")} key={i}>
                  <b>{l.who === "me" ? "you" : "interviewer"}</b>{l.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------- report ---------------- */
  const rep = interviewReport(answers, setup);
  const DIM_LABELS = [
    ["Relevance", rep.dims.relevance], ["Depth", rep.dims.depth], ["Specificity", rep.dims.specificity],
    ["Structure", rep.dims.structure], ["Confidence", rep.dims.confidence], ["Conciseness", rep.dims.clarity],
    ["Fluency", rep.dims.fluency], ["Grammar", rep.dims.grammar], ["Vocabulary", rep.dims.vocabulary],
    ["Pace", rep.dims.pace], ["Energy", rep.dims.energy], ["Critical thinking", rep.dims.critical],
    ["Problem-solving", rep.dims.problem], ["Role fit", rep.dims.roleFit],
  ].concat(rep.dims.hesitation != null ? [["Composure", rep.dims.hesitation]] : []);

  return (
    <div>
      <h1 className="h1">Interview <em>debrief</em></h1>

      <div className="card moss">
        <div className="eye">{setup.role} · {setup.type} · {setup.difficulty}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
          <Mascot mood={moodForScore(rep.overall)} size={96} className="masc-pop" />
        </div>
        <div className="popring" style={{ textAlign: "center" }}>
          <div className="big" style={{ fontSize: 66, margin: "4px 0 0" }}>
            {rep.overall}<span style={{ fontSize: 20, color: "var(--ink60)" }}>/100</span>
          </div>
        </div>
        <p className="ex" style={{ textAlign: "center", margin: "2px 0 12px" }}>
          {rep.answered} of {rep.total} questions properly answered · {rep.wordTotal} words · {rep.fillerTotal} crutch words
        </p>
        <div className="dials">
          <ScoreDial label="Confidence" value={rep.dims.confidence} />
          <ScoreDial label="Conciseness" value={rep.dims.clarity} delay={0.08} />
          <ScoreDial label="Relevance" value={rep.dims.relevance} delay={0.16} />
        </div>
      </div>

      <div className="card">
        <div className="eye">How you moved through it</div>
        <Timeline answers={answers} />
        <p className="ex" style={{ marginTop: 6 }}>
          {(() => {
            const best = answers.reduce((b, a, i) => (a.score > answers[b].score ? i : b), 0);
            const worst = answers.reduce((b, a, i) => (a.score < answers[b].score ? i : b), 0);
            if (best === worst) return "One answer isn't a shape yet — run a longer interview to see the pattern.";
            return `Your best was Q${best + 1} (${answers[best].score}) and your weakest Q${worst + 1} (${answers[worst].score}). ${
              worst > best ? "You faded as it went on, which usually means stamina rather than knowledge." :
              "You started slow and recovered — worth fixing, because the first answer sets the frame."}`;
          })()}
        </p>
      </div>

      <div className="card">
        <div className="eye" style={{ marginBottom: 10 }}>Every dimension</div>
        <div className="dials" style={{ flexWrap: "wrap" }}>
          {DIM_LABELS.map(([k, v], i) => <ScoreDial key={k} label={k} value={v} delay={i * 0.04} />)}
        </div>
      </div>

      {rep.strengths.length > 0 && (
        <div className="card sky">
          <div className="eye">What worked</div>
          {rep.strengths.map((s) => (
            <div className="stat" key={s.k}><span>{s.k}</span><b className="ok">{s.v}</b></div>
          ))}
        </div>
      )}

      {rep.weaknesses.length > 0 && (
        <div className="card coral">
          <div className="eye">What cost you</div>
          {rep.weaknesses.map((s) => (
            <div className="stat" key={s.k}><span>{s.k}</span><b className="bad">{s.v}</b></div>
          ))}
        </div>
      )}

      {rep.moments.length > 0 && (
        <div className="card">
          <div className="mascrow" style={{ marginBottom: 14 }}>
            <Mascot mood="gloomy" size={58} />
            <div className="bubble">These are the specific seconds a real interviewer would remember.</div>
          </div>
          <div className="eye" style={{ marginBottom: 12 }}>The exact moments that hurt</div>
          {rep.moments.map((m, i) => (
            <div className="mom" key={i}>
              <span className="cost">−{m.cost}</span>
              <span className="k">Q{m.q} · {m.kind}</span>
              <div style={{ fontSize: 14.5, lineHeight: 1.6 }}>{m.why}</div>
              {m.quote && <q>“{m.quote}…”</q>}
            </div>
          ))}
        </div>
      )}

      <div className="card sun">
        <div className="eye" style={{ marginBottom: 10 }}>For your next interview</div>
        {rep.recs.map((r, i) => (
          <div className="note" key={i} style={{ marginBottom: 12 }}>{r}</div>
        ))}
      </div>

      {answers.map((a, i) => {
        const imp = improveAnswer(a);
        const rw = rewrites[i];
        return (
          <div className="card" key={i}>
            <div className="eye">Q{i + 1} · scored {a.score}</div>
            <p style={{ fontFamily: "var(--dis)", fontWeight: 600, fontSize: 17, lineHeight: 1.3, margin: "6px 0 10px" }}>
              {a.question}
            </p>
            <div className="script" style={{ fontSize: 15.5 }}>
              {a.text ? renderClarity(a.text, a) : <span className="ex">Nothing recorded.</span>}
            </div>
            <RomanToggle text={a.text} from={a.lang && a.lang.primary} />
            <div className="star4">
              {[["S", a.star.s], ["T", a.star.t], ["A", a.star.a], ["R", a.star.r]].map(([k, on]) => (
                <span key={k} data-on={on ? "1" : "0"}>{k}</span>
              ))}
            </div>
            <div className="stat" style={{ marginTop: 10 }}><span>Answered the question</span>
              <b className={a.relevance > 60 ? "ok" : "bad"}>{a.relevance}</b></div>
            <div className="stat"><span>Specific detail</span>
              <b className={a.specificity > 50 ? "ok" : "warn"}>{a.specificity}</b></div>
            <div className="stat"><span>Confidence</span>
              <b className={a.confidence > 60 ? "ok" : "warn"}>{a.confidence}</b></div>
            {a.silence != null && <div className="stat"><span>Silence</span>
              <b className={a.silence > 8 ? "bad" : "ok"}>{a.silence}s</b></div>}

            {imp.skeleton && (
              <>
                <div className="eye" style={{ margin: "16px 0 6px" }}>Rebuilt from your own words</div>
                <div className="skel">
                  {imp.skeleton.map((row, k) => (
                    <div className={"skel-row" + (row.text ? "" : " gap")} key={k}>
                      <b>{row.label}</b>
                      <p>{row.text || "— you never said this —"}</p>
                      <small>{row.note}</small>
                    </div>
                  ))}
                </div>
              </>
            )}
            <p className="ex" style={{ marginTop: 10 }}>{imp.note}</p>

            {!rw && <button className="btn sm" style={{ marginTop: 10 }} onClick={() => askRewrite(i)}>
              Write me a stronger version</button>}
            {rw && rw.loading && <p className="ex" style={{ marginTop: 10 }}><span className="spin" />rewriting…</p>}
            {rw && rw.fail && <div className="tip" style={{ marginTop: 10 }}>
              The full rewrite needs an API key. The rebuild above is assembled from your own sentences and needs nothing.
            </div>}
            {rw && rw.rewrite && (
              <div className="rw" style={{ marginTop: 12 }}>
                <span className="lbl">Stronger version — your facts, your voice</span>
                <span className="tight">{rw.rewrite}</span>
                {rw.why && <div className="cutlist">{rw.why}</div>}
              </div>
            )}
          </div>
        );
      })}

      <div className="row">
        <button className="btn go" onClick={() => setStage("setup")}>Run another interview</button>
      </div>
    </div>
  );
}


/* ------------------------------ DEBATE UI --------------------------------- */

const DEBATE_CSS = `
.stance{display:flex;gap:10px;flex-wrap:wrap}
.stancecard{flex:1 1 150px;border:2.5px solid var(--line);background:var(--paper);border-radius:18px;
  padding:16px 14px;cursor:pointer;text-align:left;transition:.16s cubic-bezier(.2,1.3,.4,1);
  font-family:var(--bod);color:var(--ink)}
.stancecard:hover{transform:translateY(-3px)}
.stancecard b{display:block;font-family:var(--dis);font-weight:700;font-size:22px;letter-spacing:-.02em;margin-bottom:4px}
.stancecard span{font-size:13px;color:var(--ink60);line-height:1.5}
.stancecard[data-on="1"]{border-color:currentColor;box-shadow:0 8px 24px rgba(0,0,0,.45),0 0 0 1px currentColor}
.stancecard[data-on="1"] span{color:inherit;opacity:.8}
.flow{display:flex;gap:4px;align-items:center;margin:0 0 16px;flex-wrap:wrap}
.flow i{font-style:normal;font-family:var(--mon);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--ink60);border:2px solid var(--line);border-radius:999px;padding:4px 10px;white-space:nowrap}
.flow i[data-on="1"]{background:var(--moss);border-color:var(--moss);color:#fff}
.flow i[data-done="1"]{border-color:var(--moss);color:var(--moss)}
.flow em{font-style:normal;color:var(--ink60);opacity:.5;font-size:11px}
.prepgrid{display:flex;gap:8px;flex-wrap:wrap}
.preptile{flex:1 1 90px;border:2.5px solid var(--line);background:var(--paper);border-radius:14px;
  padding:11px 8px;cursor:pointer;text-align:center;font-family:var(--bod);color:var(--ink);transition:.14s}
.preptile[data-on="1"]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.preptile b{display:block;font-family:var(--mon);font-size:15px}
.preptile span{font-size:10px;opacity:.7;line-height:1.35;display:block;margin-top:3px}
.prepbig{font-family:var(--mon);font-size:clamp(48px,15vw,84px);font-weight:700;text-align:center;
  letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums}
.prepbig.low{color:var(--coral)}
.frame{border:2.5px solid var(--line);border-radius:18px;overflow:hidden;margin-top:12px}
.framerow{display:flex;gap:12px;padding:13px 15px;border-bottom:2px dotted var(--line);align-items:flex-start}
.framerow:last-child{border-bottom:none}
.framekey{flex:0 0 30px;height:30px;border-radius:10px;border:2.5px solid var(--line);display:grid;
  place-items:center;font-family:var(--dis);font-weight:700;font-size:14px;background:var(--paper2)}
.framerow[data-filled="1"] .framekey{background:var(--moss);border-color:var(--moss);color:#fff}
.framebody{flex:1;min-width:0}
.framebody b{display:block;font-size:14px;margin-bottom:2px}
.framebody small{font-size:12px;color:var(--ink60);line-height:1.5;display:block}
.framebody textarea{width:100%;background:var(--paper);border:2px solid var(--line);border-radius:11px;
  color:var(--ink);font-family:var(--bod);font-size:14.5px;line-height:1.55;padding:8px 10px;
  resize:vertical;margin-top:7px}
.framebody textarea:focus{outline:none;border-color:var(--moss)}
.brief li{font-size:14.5px;line-height:1.6;margin-bottom:7px}
.brief ul{margin:6px 0 0;padding-left:18px}
.pill{display:inline-block;font-family:var(--mon);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;
  border:2px solid var(--line);border-radius:999px;padding:3px 10px;margin-bottom:8px}
`;

function FlowRail({ at }) {
  const steps = [["stance", "Stance"], ["research", "Research"], ["prep", "Prep"],
    ["speak", "Speak"], ["report", "Feedback"]];
  const idx = steps.findIndex(([k]) => k === at);
  return (
    <div className="flow" aria-label={`Step ${idx + 1} of ${steps.length}`}>
      {steps.map(([k, label], i) => (
        <React.Fragment key={k}>
          <i data-on={i === idx ? "1" : "0"} data-done={i < idx ? "1" : "0"}>{label}</i>
          {i < steps.length - 1 && <em>→</em>}
        </React.Fragment>
      ))}
    </div>
  );
}

function DebateMode({ mic, onFinish, lib, profile }) {
  const [stage, setStage] = useState("stance");
  const [topic, setTopic] = useState(() => pick(TOPICS["Placement & GD"]));
  const [stance, setStance] = useState(null);
  const [brief, setBrief] = useState(null);
  const [briefState, setBriefState] = useState("idle");
  const [prepChoice, setPrepChoice] = useState(60);
  const [customPrep, setCustomPrep] = useState(90);
  const [notes, setNotes] = useState(["", "", "", ""]);
  const [slotId, setSlotId] = useState(120);
  const [mode, setMode] = useState("mic");
  const [typed, setTyped] = useState("");
  const [rep, setRep] = useState(null);
  const [ai, setAi] = useState(null);
  const [aiState, setAiState] = useState("idle");
  const [petals, setPetals] = useState(false);

  const slot = SLOTS.find((x) => x.id === slotId) || SLOTS[2];
  const prepSeconds = prepChoice === 0 ? Math.max(10, Math.min(600, customPrep)) : prepChoice;
  const typedRef = useRef(""); typedRef.current = typed;
  const modeRef = useRef("mic"); modeRef.current = mode;
  const notesRef = useRef(notes); notesRef.current = notes;

  /* ---- prep countdown ---- */
  const prep = useStopwatch(prepSeconds, () => setStage("speak"));

  /* ---- the speech itself, reusing the existing recording experience ---- */
  const finish = useCallback(async (forced) => {
    const secs = typeof forced === "number" ? forced : Math.max(1, watch.value());
    const m = modeRef.current;
    mic.stop(); watch.stop();
    if (m !== "type") await mic.settled();
    const text = (m === "type" ? typedRef.current : mic.bestText().text).trim();

    const r = analyseDebate(text, secs, m, stance);
    const tRep = timerReport(secs, slot);
    setRep({ r, tRep, aRep: ahReport(r), gRep: gramReport(r, null, false), slot });
    setStage("report");
    setPetals(true); setTimeout(() => setPetals(false), 3200);
    onFinish({ xp: 45 + Math.round(r.debateScore / 2), seconds: secs, kind: "topic" });

    if (r.unintelligible || r.wc < 15) { setAiState("skip"); return; }
    setAiState("loading");
    askClaude(DEBATE_EVAL_SYS,
      `Motion: "${topic}"\nThey argued: ${stanceById(stance).label}\nPrep time: ${prepSeconds}s\n` +
      `Their notes: ${notesRef.current.filter(Boolean).join(" | ") || "(none written)"}\n` +
      `Measured: stance consistency ${r.consistency.score}, evidence ${r.evidence}, ` +
      `counterargument ${r.counter}, argument ${r.argument}, words ${r.wc}.\n` +
      `Transcript:\n"""${text}"""`, 900)
      .then((j) => { setAi(j); setAiState("done"); })
      .catch(() => setAiState("offline"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic, stance, slot, topic, prepSeconds, onFinish]);

  const watch = useStopwatch(slot.red + 30, finish);

  const getBrief = () => {
    setBriefState("loading");
    askClaude(BRIEF_SYS, `Motion: "${topic}"\nThey are arguing: ${stanceById(stance).label} (${stanceById(stance).verb} the motion).`, 1100)
      .then((j) => { setBrief({ ...j, stance }); setBriefState("done"); })
      .catch(() => { setBrief(localBrief(topic, stance)); setBriefState("local"); });
  };

  const startSpeaking = async () => {
    setTyped("");
    const ok = await mic.start();
    setMode(ok ? "mic" : "type");
    setStage("live"); watch.start();
  };
  const writeInstead = () => { setTyped(""); setMode("type"); setStage("live"); watch.start(); };

  const reset = () => {
    setStage("stance"); setStance(null); setBrief(null); setBriefState("idle");
    setNotes(["", "", "", ""]); setRep(null); setAi(null); setAiState("idle");
    prep.reset(); watch.reset();
  };

  const setNote = (i, v) => setNotes((n) => n.map((x, k) => (k === i ? v : x)));

  /* ============================ 1 · STANCE ============================ */
  if (stage === "stance") {
    const pool = [...TOPICS["Placement & GD"], ...TOPICS["Society & policy"],
      ...TOPICS["Tech & AI"], ...TOPICS["Hot takes"], ...(lib.topics || []).map((t) => t.text)];
    return (
      <div>
        <FlowRail at="stance" />
        <h1 className="h1">Pick a side.<br /><em>Then defend it.</em></h1>
        <p className="sub">
          A debate isn't a Table Topic with a stronger opinion. You commit to a position before you
          know what you'll say, and you're scored on whether the case survives your own speech.
        </p>
        <Notice mic={mic} />

        <div className="card sky">
          <div className="eye">The motion</div>
          <div className="topic" style={{ minHeight: "auto", marginTop: 6 }}>{topic}</div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn sm" onClick={() => setTopic(pick(pool))}>Different motion</button>
            {(lib.topics || []).length > 0 && (
              <button className="btn sm" onClick={() => setTopic(pick(lib.topics.map((t) => t.text)))}>From my library</button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="eye" style={{ marginBottom: 12 }}>Your position</div>
          <div className="stance">
            {STANCES.map((st) => (
              <button key={st.id} className="stancecard" data-on={stance === st.id ? "1" : "0"}
                style={{ color: stance === st.id ? st.colour : undefined }}
                aria-pressed={stance === st.id} onClick={() => setStance(st.id)}>
                <b>{st.label}</b><span>{st.blurb}</span>
              </button>
            ))}
          </div>
          <p className="ex" style={{ marginTop: 12 }}>
            Choosing the side you disagree with is the better exercise. You'll find the other side's
            real arguments instead of the version you've been arguing against in your head.
          </p>
          <button className="btn go" style={{ marginTop: 14, width: "100%" }}
            disabled={!stance} onClick={() => setStage("research")}>
            <span>Lock it in <Icon name="arrow" size={18} /></span>
          </button>
        </div>
      </div>
    );
  }

  /* =========================== 2 · RESEARCH =========================== */
  if (stage === "research") {
    const st = stanceById(stance);
    return (
      <div>
        <FlowRail at="research" />
        <h1 className="h1">Arm yourself.<br /><em>Optional.</em></h1>

        <div className="card" style={{ borderColor: st.colour }}>
          <span className="pill" style={{ color: st.colour, borderColor: st.colour }}>Arguing {st.label}</span>
          <div className="topic" style={{ minHeight: "auto", fontSize: 20 }}>{topic}</div>
        </div>

        {!brief && (
          <div className="card">
            <p style={{ fontSize: 15.5, lineHeight: 1.65, margin: "0 0 14px" }}>
              A brief gives you arguments, the objections you'll face, and any facts worth citing.
              Skipping it is the harder and more realistic drill — a real GD gives you nothing.
            </p>
            <div className="row">
              <button className="btn go" onClick={getBrief} disabled={briefState === "loading"}>
                {briefState === "loading" ? <><span className="spin" />Researching…</> : "Get a research brief"}
              </button>
              <button className="btn" onClick={() => setStage("prep")}>Skip — go in cold</button>
            </div>
          </div>
        )}

        {brief && (
          <>
            {briefState === "local" && (
              <div className="tip" style={{ marginBottom: 14 }}>
                No research key connected, so this is the shape of a strong case rather than
                researched material. Everything else in this mode works exactly the same.
              </div>
            )}
            <div className="card moss">
              <div className="eye">What this is really about</div>
              <p style={{ fontSize: 15.5, lineHeight: 1.65 }}>{brief.summary}</p>
            </div>

            {(brief.points || []).length > 0 && (
              <div className="card">
                <div className="eye">Your arguments</div>
                <ul className="brief">{brief.points.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            )}
            {(brief.counters || []).length > 0 && (
              <div className="card coral">
                <div className="eye">What they'll come back with</div>
                <ul className="brief">{brief.counters.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            )}
            {(brief.facts || []).length > 0 && (
              <div className="card sun">
                <div className="eye">Worth citing</div>
                <ul className="brief">{brief.facts.map((x, i) => <li key={i}>{x}</li>)}</ul>
                <p className="ex" style={{ marginTop: 8 }}>
                  Check anything you plan to say as fact. A confident wrong number is worse than no number.
                </p>
              </div>
            )}
            {(brief.examples || []).length > 0 && (
              <div className="card">
                <div className="eye">Cases you could use</div>
                <ul className="brief">{brief.examples.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            )}
            <div className="row">
              <button className="btn go" onClick={() => setStage("prep")}>
                <span>Start prep <Icon name="arrow" size={18} /></span>
              </button>
              <button className="btn" onClick={() => { setBrief(null); setBriefState("idle"); }}>Clear</button>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ============================= 3 · PREP ============================= */
  if (stage === "prep") {
    const st = stanceById(stance);
    const running = prep.running;
    const left = Math.max(0, prepSeconds - prep.t);
    return (
      <div>
        <FlowRail at="prep" />
        {!running ? (
          <>
            <h1 className="h1">How long do you<br /><em>actually need?</em></h1>
            <div className="card">
              <div className="eye">Prep time</div>
              <div className="prepgrid" style={{ marginTop: 10 }}>
                {PREP_TIMES.map((pt) => (
                  <button key={pt.id} className="preptile" data-on={prepChoice === pt.id ? "1" : "0"}
                    onClick={() => setPrepChoice(pt.id)}>
                    <b>{pt.label}</b><span>{pt.note}</span>
                  </button>
                ))}
              </div>
              {prepChoice === 0 && (
                <div className="row" style={{ marginTop: 12 }}>
                  <input type="number" min="10" max="600" value={customPrep}
                    onChange={(e) => setCustomPrep(Number(e.target.value) || 10)}
                    className="typebox" style={{ marginTop: 0, width: 110, fontFamily: "var(--mon)" }}
                    aria-label="Custom prep seconds" />
                  <span className="ex">seconds</span>
                </div>
              )}

              <div className="eye" style={{ marginTop: 18 }}>Then speak for</div>
              <div className="prepgrid" style={{ marginTop: 10 }}>
                {SLOTS.map((sl) => (
                  <button key={sl.id} className="preptile" data-on={slotId === sl.id ? "1" : "0"}
                    onClick={() => setSlotId(sl.id)}><b>{sl.label}</b></button>
                ))}
              </div>

              <button className="btn go" style={{ marginTop: 18, width: "100%" }} onClick={() => prep.start()}>
                <span>Start the clock <Icon name="arrow" size={18} /></span>
              </button>
              <p className="ex" style={{ marginTop: 10 }}>
                The prep clock runs whether you write anything or not, which is the point.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="card coral">
              <div className="tag">prep</div>
              <div className={"prepbig" + (left <= 10 ? " low" : "")}>{fmt(left)}</div>
              <div className="vine">
                <i className={left <= 10 ? "r" : left <= prepSeconds * 0.4 ? "a" : ""}
                  style={{ width: `${(prep.t / prepSeconds) * 100}%` }} />
              </div>
              <p className="ex" style={{ textAlign: "center", margin: 0 }}>
                Arguing <b style={{ color: st.colour }}>{st.label}</b> · {topic}
              </p>
            </div>

            <div className="card">
              <div className="role">
                <div className="rbadge"><Mascot mood="thinking" size={46} /></div>
                <div><div className="rname">Structure it</div>
                  <div className="rrole">point · reason · example · point</div></div>
              </div>
              <p className="ex" style={{ marginBottom: 4 }}>
                Notes are for you — nothing here is scored. Speakers who write one line per box
                almost always beat speakers who write paragraphs.
              </p>
              <div className="frame">
                {PREP_FRAME.map((row, i) => (
                  <div className="framerow" key={i} data-filled={notes[i].trim() ? "1" : "0"}>
                    <div className="framekey">{row.k}</div>
                    <div className="framebody">
                      <b>{row.label}</b>
                      <small>{row.ask}</small>
                      <textarea rows={i === 2 ? 2 : 1} value={notes[i]}
                        onChange={(e) => setNote(i, e.target.value)}
                        placeholder={i === 0 && stance
                          ? `I am ${st.verb} this because…`
                          : ""} />
                    </div>
                  </div>
                ))}
              </div>

              {brief && (brief.points || []).length > 0 && (
                <>
                  <div className="eye" style={{ marginTop: 16 }}>From your brief — tap to drop into Reason</div>
                  <div className="row" style={{ marginTop: 8 }}>
                    {brief.points.slice(0, 4).map((pt, i) => (
                      <button key={i} className="chip" style={{ textAlign: "left", maxWidth: "100%" }}
                        onClick={() => setNote(1, (notes[1] ? notes[1] + " " : "") + pt)}>
                        {pt.length > 58 ? pt.slice(0, 56) + "…" : pt}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="row" style={{ marginTop: 16 }}>
                <button className="btn leaf" onClick={() => { prep.stop(); setStage("speak"); }}>
                  Ready early
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ============================ 4 · SPEAK ============================= */
  if (stage === "speak" || stage === "live") {
    const st = stanceById(stance);
    const live = stage === "live";
    return (
      <div>
        <FlowRail at="speak" />
        <div className="card" style={{ borderColor: st.colour }}>
          <span className="pill" style={{ color: st.colour, borderColor: st.colour }}>Arguing {st.label}</span>
          <div className="topic" style={{ minHeight: "auto", fontSize: 20 }}>{topic}</div>
        </div>

        {notes.some((n) => n.trim()) && !live && (
          <div className="card">
            <div className="eye">Your plan — last look</div>
            <div className="frame">
              {PREP_FRAME.map((row, i) => notes[i].trim() ? (
                <div className="framerow" key={i} data-filled="1">
                  <div className="framekey">{row.k}</div>
                  <div className="framebody"><b>{row.label}</b><small style={{ color: "var(--ink)", fontSize: 14.5 }}>{notes[i]}</small></div>
                </div>
              ) : null)}
            </div>
            <p className="ex" style={{ marginTop: 10 }}>
              These disappear when you start. Reading notes aloud is not the skill being trained.
            </p>
          </div>
        )}

        {!live ? (
          <div className="card">
            <p style={{ fontSize: 15.5, lineHeight: 1.65, margin: "0 0 14px" }}>
              {slot.label} on the clock. Green at {fmt(slot.green)}, red at {fmt(slot.red)}.
            </p>
            <div className="row">
              <button className="btn go" onClick={startSpeaking}>
                <span><Icon name="mic" size={18} /> Speak now</span></button>
              <button className="btn" onClick={writeInstead}>Write it</button>
            </div>
          </div>
        ) : (
          <div className="card coral">
            <div className="tag">{mode === "mic" ? "on the clock" : "writing"}</div>
            <div className={"clock" + (watch.t > slot.red ? " over" : "")}>
              {fmt(watch.t)} <small>of {slot.label}</small>
            </div>
            <div className="vine">
              <i className={watch.t >= slot.red ? "r" : watch.t >= slot.amber ? "a" : ""}
                style={{ width: `${Math.min(100, (watch.t / slot.red) * 100)}%` }} />
            </div>
            <Signal elapsed={watch.t} slot={slot} />
            {mode === "mic" ? (
              <>
                <Grass level={mic.level} live={mic.speaking} />
                <div className="script" style={{ marginTop: 10 }}>
                  {mic.finalText}<span className="interim">{mic.interim}</span><span className="caret" />
                </div>
              </>
            ) : (
              <Writer value={typed} onChange={setTyped} rows={7}
                placeholder="Argue it the way you'd say it out loud." />
            )}
            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn leaf" onClick={() => finish()}>Finish</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ============================ 5 · REPORT ============================ */
  const { r, tRep, aRep, gRep } = rep;
  const st = stanceById(stance);
  return (
    <div>
      <Petals go={petals} />
      <FlowRail at="report" />
      <h1 className="h1">The <em>verdict</em></h1>

      <div className="card moss">
        <span className="pill" style={{ color: st.colour, borderColor: st.colour }}>Argued {st.label}</span>
        <div className="popring" style={{ textAlign: "center" }}>
          <div className="big" style={{ fontSize: 62, margin: "4px 0 0" }}>
            {r.debateScore}<span style={{ fontSize: 19, color: "var(--ink60)" }}>/100</span>
          </div>
        </div>
        <p className="ex" style={{ textAlign: "center", margin: "2px 0 12px" }}>
          {r.wc} words in {fmt(r.seconds)} · {topic}
        </p>
        <div className="dials">
          <ScoreDial label="Argument" value={r.argument} />
          <ScoreDial label="Held side" value={r.consistency.score} delay={0.08} />
          <ScoreDial label="Evidence" value={r.evidence} delay={0.16} />
          <ScoreDial label="Counter" value={r.counter} delay={0.24} />
        </div>
      </div>

      <div className="card" style={{ borderColor: r.consistency.drifted ? "var(--coral)" : "var(--line)" }}>
        <div className="role">
          <div className="rbadge"><Mascot mood={r.consistency.drifted ? "focused" : "encouraging"} size={46} /></div>
          <div><div className="rname">Did you hold the line?</div>
            <div className="rrole">the question a debate actually asks</div></div>
        </div>
        <p style={{ fontSize: 15.5, lineHeight: 1.65 }}>{r.consistency.note}</p>
        <div className="tally">
          <span className="tchip">for-language <b>×{r.consistency.forCount}</b></span>
          <span className="tchip">against-language <b>×{r.consistency.againstCount}</b></span>
          <span className="tchip">balanced <b>×{r.consistency.neutralCount}</b></span>
        </div>
      </div>

      <div className="card sun">
        <div className="role">
          <div className="rbadge"><Icon name="timer" size={23} /></div>
          <div><div className="rname">The Timer</div><div className="rrole">keeps you honest</div></div>
        </div>
        <div className={"clock" + (r.seconds > slot.red ? " over" : "")}>{fmt(r.seconds)}</div>
        <Signal elapsed={r.seconds} slot={rep.slot} />
        <p style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 0 }}>{tRep.line}</p>
      </div>

      <div className="card coral">
        <RoleHead role={ROLES[1]} />
        <AhCounterBody a={aRep} />
      </div>

      <div className="card">
        <div className="eye" style={{ marginBottom: 10 }}>How the case was built</div>
        <div className="stat"><span>Evidence offered</span>
          <b className={r.evidenceHits ? "ok" : "bad"}>{r.evidenceHits}</b></div>
        <div className="stat"><span>Other side raised</span>
          <b className={r.counterHits ? "ok" : "warn"}>{r.counterHits}</b></div>
        <div className="stat"><span>…and answered</span>
          <b className={r.rebutHits ? "ok" : "warn"}>{r.rebutHits}</b></div>
        <div className="stat"><span>Reasoning connectives</span><b>{r.connectives}</b></div>
        <div className="stat"><span>Closed the case</span>
          <b className={r.hasClose ? "ok" : "bad"}>{r.hasClose ? "yes" : "no"}</b></div>
        {r.counterHits === 0 && (r.isEnglish ? (
          <div className="note badl" style={{ marginTop: 12 }}>
            You never mentioned the other side. Even one sentence — “some would argue X, but…” — makes
            a case look considered rather than rehearsed, and it's the cheapest mark on the sheet.
          </div>
        ) : (
          <div className="note warnl" style={{ marginTop: 12 }}>
            This count only recognises English phrasing for raising the other side, so it may be missing
            it here — the number above isn't a reliable zero in {langName(r.lang.primary)}.
          </div>
        ))}
        {r.evidenceHits === 0 && r.isEnglish && (
          <div className="note warnl" style={{ marginTop: 12 }}>
            No example, no number, no case. Assertion is the default; evidence is what separates you
            from the person who read the same headline.
          </div>
        )}
      </div>

      <ClarityCard r={r} />

      <div className="card sky">
        <div className="eye">The transcript</div>
        <div className="script" style={{ marginTop: 8 }}>
          {r.text ? renderClarity(r.text, r) : <span className="ex">Nothing came through.</span>}
        </div>
        <RomanToggle text={r.text} from={r.lang && r.lang.primary} />
      </div>

      {gRep.errs.length > 0 && (
        <div className="card">
          <div className="eye" style={{ marginBottom: 10 }}>Grammar</div>
          <Corrections items={gRep.errs} />
        </div>
      )}

      {aiState === "loading" && <div className="card"><span className="spin" />The judge is writing…</div>}
      {aiState === "skip" && (
        <div className="card"><div className="note warnl">
          Too short to judge as an argument. A case needs at least a claim and a reason before anyone
          can weigh it.
        </div></div>
      )}
      {aiState === "offline" && (
        <div className="card"><div className="tip">
          The written judgement needs an API key. Every number above is measured from your own words
          and stands on its own.
        </div></div>
      )}
      {aiState === "done" && ai && (
        <div className="card sun">
          <div className="role">
            <div className="rbadge"><Icon name="cap" size={23} /></div>
            <div><div className="rname">The judge</div><div className="rrole">on the case, not the side</div></div>
          </div>
          {[["Argument", ai.argument], ["Holding your side", ai.consistency],
            ["Evidence", ai.evidence], ["The other side", ai.counter]].map(([k, v]) => v ? (
            <div key={k} style={{ marginTop: 12 }}>
              <div className="eye">{k}</div>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: "4px 0 0" }}>{v}</p>
            </div>
          ) : null)}
          {ai.fix && (<>
            <div className="eye" style={{ marginTop: 16 }}>Next round</div>
            <div className="note">{ai.fix}</div>
            <TranslateButton text={ai.fix} />
          </>)}
        </div>
      )}

      <div className="row">
        <button className="btn go" onClick={() => {
          const other = stance === "for" ? "against" : stance === "against" ? "for" : "for";
          reset(); setStance(other); setStage("research");
        }}>
          Same motion, other side
        </button>
        <button className="btn" onClick={reset}>New motion</button>
      </div>
    </div>
  );
}


/* ============================== TABLE TOPICS ============================== */

function TableTopics({ mic, onFinish, wotd, lib, profile }) {
  const allTopics = useMemo(() => {
    const merged = { ...TOPICS };
    (lib.topics || []).forEach((t) => {
      merged[t.cat] = merged[t.cat] ? [...merged[t.cat], t.text] : [t.text];
    });
    return merged;
  }, [lib.topics]);
  const cats = Object.keys(allTopics);
  const [cat, setCat] = useState(["Table Topics", "Placement & GD"]);
  const [slotId, setSlotId] = useState(60);
  const [topic, setTopic] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState("pick");
  const [mode, setMode] = useState("mic");
  const [typed, setTyped] = useState("");
  const [rep, setRep] = useState(null);
  const [ai, setAi] = useState(null);
  const [aiState, setAiState] = useState("idle");
  const [petals, setPetals] = useState(false);

  const slot = SLOTS.find((s) => s.id === slotId);
  const typedRef = useRef(""); typedRef.current = typed;
  const modeRef = useRef("mic"); modeRef.current = mode;
  const pool = useMemo(() => cat.flatMap((c) => allTopics[c] || []), [cat, allTopics]);

  const finish = useCallback(async (forced) => {
    const secs = typeof forced === "number" ? forced : Math.max(1, watch.value());
    const m = modeRef.current;
    const voiced = m === "mic" ? Math.round(mic.voicedSeconds()) : null;
    mic.stop(); watch.stop();
    // wait for the multilingual pass before scoring, or a Hindi answer gets
    // judged on the English-first live transcript. This only works because
    // mic.stop() (just above) is what triggers the recorder to hand the tape
    // to Sarvam in the first place — settling before stopping waits for nothing.
    if (m !== "type") await mic.settled();
    const best = m === "type" ? { text: typedRef.current, source: "typed" } : mic.bestText();
    const text = (best.text || "").trim();

    const r = analyse(text, secs, m);
    r.voiced = voiced;
    r.asrConfidence = m === "mic" ? mic.confidence() : null;
    r.clip = mic.clip;
    const tRep = timerReport(secs, slot);
    const aRep = ahReport(r);
    const usedW = usedWord(wotd.w, text);
    const gRep = gramReport(r, wotd, usedW);
    const eRep = evalReport(r, tRep);

    setRep({ r, tRep, aRep, gRep, eRep, usedW, slot });
    setPhase("report");
    setPetals(true); setTimeout(() => setPetals(false), 3400);
    onFinish({ xp: 30 + Math.round(r.overall / 2) + (usedW ? 15 : 0), seconds: secs, kind: "topic" });

    if (r.unintelligible || r.wc < 15) { setAiState("skip"); return; }
    setAiState("loading");
    askClaude(EVAL_SYS, `Topic: "${topic}"\nTime slot: ${slot.label}\nSeconds spoken: ${secs}\nTranscript:\n"""${text}"""`, 1100)
      .then((j) => { setAi(j); setAiState("done"); })
      .catch(() => setAiState("offline"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic, topic, slot, wotd, onFinish]);

  const watch = useStopwatch(slot.red + 30, finish);

  const toggle = (c) => setCat((v) => (v.includes(c) ? (v.length > 1 ? v.filter((x) => x !== c) : v) : [...v, c]));

  const spin = () => {
    setPhase("pick"); setRep(null); setAi(null); setAiState("idle"); setTyped(""); watch.reset();
    setSpinning(true);
    let i = 0;
    const id = setInterval(() => { setTopic(pick(pool)); if (++i > 10) { clearInterval(id); setSpinning(false); } }, 62);
  };

  const record = async () => {
    setTyped("");
    const ok = await mic.start();
    setMode(ok ? "mic" : "type");
    setPhase("live"); watch.start();
  };
  const write = () => { setTyped(""); setMode("type"); setPhase("live"); watch.start(); };

  if (phase === "report" && rep) {
    const { r, tRep, aRep, gRep, eRep, usedW } = rep;
    const vocab = ai && ai.vocab ? ai.vocab.map((v) => ({ was: v.weak, now: v.better, why: v.why, kind: "vocab" })) : [];
    return (
      <div>
        <Petals go={petals} />
        <h1 className="h1">The club <em>reports back</em></h1>
        <p className="sub">Four role-players watched that. Here's each of them, in the order a real meeting runs.</p>

        {r.unintelligible && r.asrConfidence !== null && r.asrConfidence < 0.62 && (
          <div className="warnbox mascrow" style={{ alignItems: "flex-start" }}>
            <Mascot mood="worried" size={62} />
            <div>
              <b>That was the microphone, not you.</b> The recogniser was only {Math.round(r.asrConfidence * 100)}%
              confident in what it heard, which is well below the level where its output means anything.
              Nothing below is being counted against you. Move somewhere quieter, get closer to the mic,
              and the same answer will score properly. Play the recording back — you'll hear that you
              were clearer than the transcript suggests.
            </div>
          </div>
        )}

        {r.unintelligible && !(r.asrConfidence !== null && r.asrConfidence < 0.62) && (
          <div className="warnbox mascrow" style={{ alignItems: "flex-start" }}>
            <Mascot mood="panic" size={62} />
            <div>
            Only {r.intelligibility}% came through as English
            {r.junk.length ? ` — “${r.junk.slice(0, 3).join("”, “")}”` : ""}. Every report below is held down to match.
            If you were speaking normally, the mic misheard you — get closer, somewhere quieter, and run it again.
            </div>
          </div>
        )}

        <div className="card sun">
          <RoleHead role={ROLES[0]} />
          <div className={"clock" + (r.seconds > rep.slot.red ? " over" : "")}>{fmt(r.seconds)}</div>
          <Signal elapsed={r.seconds} slot={rep.slot} />
          <div className="verdict {tRep.vclass}" style={{ display: "none" }} />
          <div style={{ textAlign: "center" }}>
            <span className={"verdict " + tRep.vclass}>
              {tRep.verdict === "qualified" ? "qualifies" : tRep.verdict === "under" ? "under time" : "over time"}
            </span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 0 }}>{tRep.line}</p>
        </div>

        <div className="card coral">
          <RoleHead role={ROLES[1]} />
          <AhCounterBody a={aRep} extra={r.stumbles.length > 0 && (
            <p className="ex" style={{ marginTop: 10 }}>
              Also {r.stumbles.length} restart{r.stumbles.length === 1 ? "" : "s"} — “{r.stumbles[0].phrase}”. That's the sound of a sentence being rebuilt mid-air.
            </p>
          )} />
        </div>

        <div className="card moss">
          <RoleHead role={ROLES[2]} />
          <p style={{ fontSize: 15, lineHeight: 1.65 }}>{gRep.line}</p>
          <div className={"note " + (usedW ? "" : "warnl")} style={{ margin: "12px 0" }}>
            <b>Word of the day: {wotd.w}.</b> {usedW
              ? " You used it. That's the fifteen bonus points."
              : " Not used. Next speech, decide where it goes before you start talking."}
          </div>
          {gRep.junk.length > 0 && (
            <>
              <div className="eye" style={{ margin: "14px 0 8px" }}>Not recognised as words</div>
              <div className="tally">
                {gRep.junk.slice(0, 8).map((j) => <span className="tchip" key={j.word}>{j.word} <b>×{j.n}</b></span>)}
              </div>
            </>
          )}
          {r.registerCount > 0 && (
            <>
              <div className="eye" style={{ margin: "16px 0 8px" }}>Too casual for a panel</div>
              <Corrections items={r.register.map((x) => ({ was: x.was, now: x.now, why: x.why, kind: "register" }))} />
            </>
          )}
          {r.vagueCount >= 3 && (
            <>
              <div className="eye" style={{ margin: "16px 0 8px" }}>Vague words · {r.vagueCount}</div>
              <div className="tally">
                {r.vague.slice(0, 6).map((v) => <span className="tchip" key={v.word}>{v.word} <b>×{v.n}</b></span>)}
              </div>
              <p className="ex" style={{ marginTop: 8 }}>Each of these is a place a specific noun would have been stronger.</p>
            </>
          )}
          {r.repeats && r.repeats.length > 0 && (
            <>
              <div className="eye" style={{ margin: "16px 0 8px" }}>Words you leaned on</div>
              <div className="tally">
                {r.repeats.slice(0, 5).map((v) => <span className="tchip" key={v.word}>{v.word} <b>×{v.n}</b></span>)}
              </div>
            </>
          )}
          {gRep.errs.length > 0 && (
            <><div className="eye" style={{ margin: "16px 0 8px" }}>Grammar · {gRep.errs.length}</div>
              <Corrections items={gRep.errs} /></>
          )}
          {gRep.regional.length > 0 && (
            <><div className="eye" style={{ margin: "16px 0 8px" }}>Fine here, odd abroad</div>
              <Corrections items={gRep.regional} /></>
          )}
        </div>

        {profile && (profile.blocks || []).length > 0 && (() => {
          const checks = {
            filler: ["Filler words", r.fillerCount, r.fillerCount <= 2],
            ramble: ["Rambling", `${Math.round(r.concise.wastePct)}% wasted`, r.concise.score >= 65],
            fast: ["Speaking too fast", `${r.wpm} wpm`, r.wpm <= 170],
            slow: ["Trailing off", `${r.wpm} wpm`, r.wpm >= 110],
            grammar: ["Grammar slips", r.grammar.filter((g) => g.kind === "grammar").length, r.accuracy >= 75],
            vocab: ["Same few words", `${r.variety}% variety`, r.range >= 55],
            long: ["Long sentences", r.concise.longOnes.length, r.concise.longOnes.length === 0],
            repeat: ["Repeating myself", r.concise.repeatedIdeas.length, r.concise.repeatedIdeas.length === 0],
            structure: ["No clear point", r.hasStance ? "took a position" : "no position", r.structure >= 60],
            blank: ["Going blank", r.mode === "mic" ? `${Math.max(0, r.seconds - r.voiced)}s silence` : "—", r.mode !== "mic" || (r.seconds - r.voiced) <= 8],
            nerves: ["Nerves", `${r.hedgeCount} hedges`, r.hedgeCount <= 3],
          };
          const rows = profile.blocks.map((b) => checks[b]).filter(Boolean);
          if (!rows.length) return null;
          const won = rows.filter((x) => x[2]).length;
          return (
            <div className="card moss">
              <div className="role">
                <div className="rbadge"><Mascot mood="inspect" size={46} /></div>
                <div><div className="rname">Your own targets</div>
                  <div className="rrole">{won} of {rows.length} clear this rep</div></div>
              </div>
              {rows.map(([label, val, ok], i) => (
                <div className="stat" key={i}>
                  <span>{label}</span><b className={ok ? "ok" : "bad"}>{val} {ok ? "✓" : "✗"}</b>
                </div>
              ))}
            </div>
          );
        })()}

        <ClarityCard r={r} aiRewrites={ai && ai.rewrites} />

        <div className="card sky">
          <RoleHead role={ROLES[3]} />
          <div className="dials" style={{ margin: "6px 0 14px" }}>
            {[["Structure", r.structure], ["Flow", r.fluency], ["Grammar", r.accuracy],
              ["Range", r.range], ["Clarity", r.clarity100]].map(([k, v], i) => (
              <ScoreDial key={k} label={k} value={v} delay={i * 0.08} />
            ))}
          </div>
          <p className="ex" style={{ marginTop: 10 }}>
            Range is vocabulary reach: {r.sophistication}% of your content words went beyond the
            everyday two thousand{r.vagueCount ? `, and ${r.vagueCount} vague word${r.vagueCount === 1 ? "" : "s"} pulled it down` : ""}.
          </p>
          {ai && (ai.structure || ai.flow || ai.content || ai.language || ai.coverage) && (
            <>
              <div className="eye" style={{ marginTop: 14 }}>The full picture</div>
              {[["Structure", ai.structure], ["Flow", ai.flow], ["Content", ai.content],
                ["Language", ai.language], ["Coverage", ai.coverage]].filter(([, v]) => v).map(([label, text]) => (
                <p key={label} style={{ fontSize: 14.5, lineHeight: 1.6, margin: "8px 0 0" }}>
                  <b>{label}.</b> {text}
                </p>
              ))}
            </>
          )}
          <div className="eye" style={{ marginTop: 14 }}>Commendation</div>
          <p style={{ fontSize: 15.5, lineHeight: 1.65, marginTop: 6 }}>{ai && ai.commend ? ai.commend : eRep.commend}</p>
          <div className="eye" style={{ marginTop: 14 }}>Recommendation</div>
          <div className="note">{ai && ai.recommend ? ai.recommend : eRep.recommend}</div>
          <TranslateButton text={ai && ai.recommend ? ai.recommend : eRep.recommend} />
          {sarvamReady() && (
            <button className="btn sm" style={{ marginTop: 10 }}
              onClick={() => speakAs("coach", ai && ai.recommend ? ai.recommend : eRep.recommend, replyLangCode())}>
              <span><Icon name="wave" size={16} /> Read it to me</span>
            </button>
          )}
          {aiState === "loading" && <p className="ex" style={{ marginTop: 12 }}><span className="spin" />the evaluator is still writing…</p>}
          {aiState === "offline" && <div className="tip" style={{ marginTop: 12 }}>
            This evaluation was written from your measured numbers. Connect an API key for a written one that quotes you directly.
          </div>}
          <p className="ex" style={{ marginTop: 12 }}>
            Structure counts three things: you took a position{r.hasStance ? " ✓" : " ✗"}, gave reasons ({r.connectives} connective{r.connectives === 1 ? "" : "s"}), and closed it{r.hasClose ? " ✓" : " ✗"}.
          </p>
        </div>

        {vocab.length > 0 && (
          <div className="card"><div className="eye" style={{ marginBottom: 12 }}>Words the evaluator would swap</div>
            <Corrections items={vocab} /></div>
        )}

        <Playback clip={r.clip} label="Hear it back" />

        <div className="card">
          <div className="eye">The transcript{r.lang && !r.isEnglish ? ` · ${langName(r.lang.primary)}` : ""}</div>
          <div className="script" style={{ marginTop: 8 }}>
            {r.text ? renderClarity(r.text, r) : <span className="ex">Nothing came through. Check the mic, or write it instead.</span>}
          </div>
          <RomanToggle text={r.text} from={r.lang && r.lang.primary} />
          <div className="legend">
            <span><i style={{ background: "#ff7a63" }} />filler</span>
            <span><i style={{ background: "#ffc857" }} />hedge</span>
            <span><i style={{ background: "#a79fd4" }} />no work</span>
            <span><i style={{ background: "#ff9f45" }} />wordy</span>
            <span><i style={{ background: "#9d80ff" }} />repeated idea</span>
          </div>
          <div className="stat" style={{ marginTop: 10 }}><span>Speed</span><b className={r.wpm >= 110 && r.wpm <= 170 ? "ok" : "warn"}>{r.wpm} wpm</b></div>
          {r.mode === "mic" && <div className="stat"><span>Silence</span>
            <b className={r.seconds - r.voiced > 15 ? "bad" : "ok"}>{Math.max(0, r.seconds - r.voiced)}s</b></div>}
          <div className="stat"><span>Word variety</span><b className={r.variety > 55 ? "ok" : "warn"}>{r.variety}%</b></div>
        </div>

        <div className="row">
          <button className="btn go" onClick={spin}>Next topic</button>
          <button className="btn" onClick={() => setPhase("pick")}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="h1">Table Topics.<br /><em>No prep, on the clock.</em></h1>
      <p className="sub">
        Pick a length, spin, and speak. The Timer shows green when you qualify and red at the limit —
        exactly like a real meeting. Use the word of the day and you take fifteen bonus points.
      </p>
      <Notice mic={mic} />

      <div className="card sun">
        <div className="eye">Word of the day</div>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
          <div>
            <span className="word" style={{ fontSize: 30 }}>{wotd.w}</span>
            <span className="pos" style={{ marginLeft: 10 }}>{wotd.p.toUpperCase()}</span>
          </div>
        </div>
        <p className="ex" style={{ margin: "6px 0 0" }}>{wotd.d}</p>
      </div>

      <div className="card">
        <div className="eye">Speech length</div>
        <div className="row" style={{ margin: "10px 0 18px", gap: 8 }}>
          {SLOTS.map((s) => (
            <button key={s.id} className="slot" data-on={slotId === s.id ? "1" : "0"} onClick={() => setSlotId(s.id)}>
              <b>{s.label}</b><span>{s.name}</span>
            </button>
          ))}
        </div>
        <p className="ex" style={{ marginTop: -8 }}>
          {slot.blurb} Green at {fmt(slot.green)}, amber {fmt(slot.amber)}, red {fmt(slot.red)}.
        </p>

        <div className="eye" style={{ marginTop: 18 }}>Topic pool</div>
        <div className="row" style={{ margin: "10px 0 16px" }}>
          {cats.map((c) => (
            <button key={c} className="chip" data-on={cat.includes(c) ? "1" : "0"} onClick={() => toggle(c)}>{c}</button>
          ))}
        </div>
        <div className={"topic" + (spinning ? " fade" : "")}>{topic || `${pool.length} topics loaded. Spin for one.`}</div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" onClick={spin} disabled={phase === "live"}>{spinning ? "Spinning…" : topic ? "Respin" : "Spin"}</button>
          {phase !== "live" && (
            <>
              <button className="btn go" onClick={record} disabled={!topic || spinning}>Speak {slot.label}</button>
              <button className="btn" onClick={write} disabled={!topic || spinning}>Write it</button>
            </>
          )}
        </div>
      </div>

      {phase === "live" && (
        <div className="card coral">
          <div className="tag">{mode === "mic" ? "on the clock" : "writing"}</div>
          <div className={"clock" + (watch.t > slot.red ? " over" : "")}>{fmt(watch.t)} <small>of {slot.label}</small></div>
          <div className="vine">
            <i className={watch.t >= slot.red ? "r" : watch.t >= slot.amber ? "a" : ""}
              style={{ width: `${Math.min(100, (watch.t / slot.red) * 100)}%` }} />
          </div>
          <Signal elapsed={watch.t} slot={slot} />
          {mode === "mic" ? (
            <>
              <Grass level={mic.level} live={mic.speaking} />
              <div className="script" style={{ marginTop: 10 }} role="log" aria-live="polite" aria-atomic="false">
                {mic.finalText}<span className="interim">{mic.interim}</span><span className="caret" />
              </div>
            </>
          ) : (
            <Writer value={typed} onChange={setTyped} rows={7}
              placeholder="Write it the way you'd say it out loud — fillers and all, because that's what the Ah-Counter tallies." />
          )}
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn leaf" onClick={() => finish()}>Finish speech</button>
          </div>
        </div>
      )}
    </div>
  );
}
/* ============================ GROUP DISCUSSION ============================
   A real GD, not a chat log. One speaker holds the floor for as long as their
   point takes to say. Turns are handed out by who has spoken least, so
   everybody gets in. You either wait to be invited or you cut in and risk it.
   ======================================================================== */

const GD_SYS = `You are one participant in a live Indian college group discussion — four students plus one human. You will be told which participant you are and given the current state of the room.
Return ONLY raw JSON: {"speaker":"kavya|arjun|meera|rohit","line":"what they say"}

WHO YOU MIGHT BE:
- kavya: steamroller. Long confident claims, impatient, irritated when a point is repeated.
- arjun: quotes statistics and asks for denominators. His numbers are sometimes shaky and he'll admit it.
- meera: pulls the topic sideways to culture, other countries, personal anecdotes.
- rohit: quiet and precise. Summarises the split, concedes when he's wrong.

HOW A REAL DISCUSSION WORKS — follow all of these:
1. Respond to something specific that was actually said. Name the person and refer to their actual words or example.
2. Never restate a point already on the table. If your instinct is a point someone made, take it further or challenge it instead.
3. If the human's last point has not been answered, answer it — agree and extend it, or push back on the specific thing they claimed. Do not change the subject away from it.
4. Positions are sticky. If you argued something earlier, stay consistent, or explicitly say you've changed your mind and why.
5. Answer open questions in the room rather than letting them hang.
6. Move the discussion forward: a new angle, a consequence, a counter-example, a trade-off nobody has named.

Two to four sentences. Spoken register, no stage directions, no emoji, no meta-commentary. Indian in reference and idiom without caricature.`;

const GD_EVAL_SYS = `You are the General Evaluator reviewing one student's participation in a group discussion. You see the full transcript of the room and, separately, that student's own contributions.
Judge them against what the room actually said: whether their points were original or already made by someone else, whether they engaged with specific arguments, whether they reasoned or just asserted, whether they built on or constructively challenged others, and whether they moved the discussion forward.
Return ONLY raw JSON: {"commend":"one specific thing they did well, quoting them and naming who they engaged with, 1-2 sentences","recommend":"the single highest-value change for their next GD, 1-2 sentences, blunt and concrete"}
If they barely spoke, say so plainly. Address them as "you".`;

const GD_LENGTHS = [
  { id: 300, label: "5 min", blurb: "Standard placement round." },
  { id: 480, label: "8 min", blurb: "Long round — pacing starts to matter." },
];

/* How long a contribution takes to say, out loud, at a normal pace. */
function speakSeconds(line) {
  const w = (line.match(/\S+/g) || []).length;
  return Math.max(9, Math.min(26, Math.round(w * 0.42 + 2.5)));
}

function GroupDiscussion({ mic, onFinish, lib }) {
  const [stage, setStage] = useState("setup");
  const [length, setLength] = useState(300);
  const [topic, setTopic] = useState(() => pick(TOPICS["Placement & GD"]));
  const [feed, setFeed] = useState([]);
  const [turn, setTurn] = useState(null);      // {who,name,color,line,dur}
  const [progress, setProgress] = useState(0);
  const [counts, setCounts] = useState({ kavya: 0, arjun: 0, meera: 0, rohit: 0, me: 0 });
  const [floor, setFloor] = useState({ kavya: 0, arjun: 0, meera: 0, rohit: 0, me: 0 });
  const [handUp, setHandUp] = useState(false);
  const [entries, setEntries] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [firstEntry, setFirstEntry] = useState(null);
  const [myLines, setMyLines] = useState([]);
  const [mode, setMode] = useState("mic");
  const [typed, setTyped] = useState("");
  const [ai, setAi] = useState(null);
  const [aiState, setAiState] = useState("idle");

  const [voice, setVoice] = usePersisted("gdVoice", true);
  const voiceRef = useRef(voice); voiceRef.current = voice;
  const feedRef = useRef([]);
  const memRef = useRef(null);
  const scrollRef = useRef(null);
  const nextRef = useRef(null);        // prefetched line
  const bIdx = useRef({ kavya: 0, arjun: 0, meera: 0, rohit: 0 });
  const countsRef = useRef(counts); countsRef.current = counts;
  const handRef = useRef(false); handRef.current = handUp;
  const turnRef = useRef(null); turnRef.current = turn;
  const myStart = useRef("");
  const linesRef = useRef([]);
  const modeRef = useRef("mic"); modeRef.current = mode;
  const startedAt = useRef(0);
  const invited = useRef(false);

  const finish = useCallback(() => {
    mic.stop(); watch.stop(); stopSpeaking();
    setStage("report");
    const mine = linesRef.current.join(" ").trim();
    onFinish({ xp: 55, seconds: watch.value(), kind: "gd" });
    if (words0(mine).length < 12) { setAiState("thin"); return; }
    setAiState("loading");
    askClaude(GD_EVAL_SYS,
      `Topic: "${topic}"\n\nTHE WHOLE DISCUSSION:\n` +
      feedRef.current.filter((f) => f.who !== "mod").map((f) => `${f.name}: ${f.line}`).join("\n") +
      `\n\nTHE STUDENT'S OWN CONTRIBUTIONS:\n"""${mine}"""`, 600)
      .then((j) => { setAi(j); setAiState("done"); })
      .catch(() => setAiState("offline"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic, topic, onFinish]);

  const watch = useStopwatch(length, finish);

  const push = (item) => { feedRef.current = [...feedRef.current, item]; setFeed(feedRef.current); };

  /* Fetch a panel contribution. Prefetching keeps the room from going silent. */
  const fetchLine = useCallback(async (avoid) => {
    const history = feedRef.current.slice(-6).map((f) => `${f.name}: ${f.line}`).join("\n");
    const mem = buildMemory(feedRef.current);
    memRef.current = mem;
    // whoever has spoken least goes next, with a nudge for the louder ones
    const pool = PANEL.filter((p) => p.id !== avoid);
    const min = Math.min(...pool.map((p) => countsRef.current[p.id]));
    const due = pool.filter((p) => countsRef.current[p.id] <= min + 0.5);
    const weighted = due.flatMap((p) => Array(Math.max(1, Math.round(p.weight * 2))).fill(p));
    const target = pick(weighted);
    try {
      const j = await askClaude(GD_SYS,
        `${memoryBrief(mem, topic)}\n\nRECENT EXCHANGES:\n${history || "(nobody has spoken yet)"}\n\n` +
        `YOU ARE: ${target.name} (${target.role} — ${target.brief})\n` +
        `Write ${target.name}'s next contribution, following all six rules.`, 340);
      const who = PANEL.find((p) => p.id === j.speaker && p.id !== avoid) || target;
      const line = String(j.line);
      return { who: who.id, name: who.name, color: who.color, line, dur: speakSeconds(line) };
    } catch (e) {
      const b = BACKUP[target.id];
      const line = b[bIdx.current[target.id]++ % b.length];
      return { who: target.id, name: target.name, color: target.color, line, dur: speakSeconds(line) };
    }
  }, [topic]);

  const beginTurn = useCallback((item) => {
    turnRef.current = item;
    setTurn(item); setProgress(0);
    startedAt.current = Date.now();
    push({ ...item, at: Math.round(watch.value()) });
    setCounts((c) => ({ ...c, [item.who]: c[item.who] + 1 }));
    setFloor((f) => ({ ...f, [item.who]: f[item.who] + item.dur }));
    if (item.who !== "me") {
      // the panel speaks aloud when voices are on: a GD you can only read is
      // a chat log, and the whole point is practising against interruption
      if (voiceRef.current) speakAs(item.who, item.line, replyLangCode());
      fetchLine(item.who).then((n) => { nextRef.current = n; });
    } else {
      stopSpeaking();          // never talk over the human
    }
  }, [fetchLine, watch]);

  /* the clock that drives one turn to its end */
  useEffect(() => {
    if (stage !== "live" || !turn) return;
    const id = setInterval(() => {
      const el = (Date.now() - startedAt.current) / 1000;
      const p = Math.min(1, el / turn.dur);
      setProgress(p);
      if (p >= 1) {
        clearInterval(id);
        if (turn.who === "me") { handBack(); return; }
        // hand the floor on
        if (handRef.current && !invited.current) {
          invited.current = true;
          setHandUp(false);
          const inv = { who: "mod", name: "Moderator", color: "#f4f1ff", line: pick(MODERATOR), dur: 4 };
          push({ ...inv, at: Math.round(watch.value()) });
          setTimeout(() => takeFloor(true), 1400);
          return;
        }
        invited.current = false;
        const nxt = nextRef.current;
        nextRef.current = null;
        if (nxt) beginTurn(nxt);
        else fetchLine(turn.who).then(beginTurn);
      }
    }, 140);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, turn]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [feed]);

  const takeFloor = (wasInvited) => {
    if (firstEntry === null) setFirstEntry(Math.round(watch.value()));
    setEntries((v) => v + 1);
    myStart.current = mic.finalText; setTyped("");
    const item = { who: "me", name: "You", color: "#161334", line: "— the floor is yours —", dur: 45, invited: wasInvited };
    beginTurn(item);
  };

  const raiseHand = () => setHandUp(true);

  const cutIn = () => {
    const cur = turnRef.current;
    const early = progress < 0.55;                       // interrupting mid-point is rude and risky
    const tough = cur && cur.who === "kavya";
    const fails = (tough && early && Math.random() < 0.7) || (early && Math.random() < 0.35);
    if (fails) {
      setBlocked((v) => v + 1);
      push({ who: cur.who, name: cur.name, color: cur.color, line: "— sorry, let me just finish this point —", at: Math.round(watch.value()) });
      return;
    }
    takeFloor(false);
  };

  const handBack = () => {
    const said = (modeRef.current === "type" ? typed : mic.finalText.slice(myStart.current.length)).trim();
    nextRef.current = null;   // the prefetched line predates your point — discard it
    if (said) {
      linesRef.current = [...linesRef.current, said];
      setMyLines(linesRef.current);
      const idx = feedRef.current.map((f) => f.who === "me" && f.line.startsWith("—")).lastIndexOf(true);
      if (idx >= 0) {
        feedRef.current = feedRef.current.map((f, i) => (i === idx ? { ...f, line: said } : f));
        setFeed(feedRef.current);
      }
    }
    setTyped("");
    const spoke = Math.round((Date.now() - startedAt.current) / 1000);
    setFloor((f) => ({ ...f, me: f.me - 45 + spoke }));
    const nxt = nextRef.current; nextRef.current = null;
    if (nxt) beginTurn(nxt); else fetchLine("me").then(beginTurn);
  };

  const begin = async () => {
    const ok = await mic.start();
    setMode(ok ? "mic" : "type");
    feedRef.current = []; linesRef.current = []; nextRef.current = null;
    bIdx.current = { kavya: 0, arjun: 0, meera: 0, rohit: 0 };
    setFeed([]); setMyLines([]); setEntries(0); setBlocked(0); setFirstEntry(null);
    setHandUp(false); invited.current = false;
    setCounts({ kavya: 0, arjun: 0, meera: 0, rohit: 0, me: 0 });
    setFloor({ kavya: 0, arjun: 0, meera: 0, rohit: 0, me: 0 });
    setAi(null); setAiState("idle");
    setStage("live"); watch.start();
    const opener = { who: "kavya", name: "Kavya", color: "#ff7a63", line: BACKUP.kavya[0], dur: speakSeconds(BACKUP.kavya[0]) };
    beginTurn(opener);
  };

  const total = Object.values(floor).reduce((a, b) => a + Math.max(0, b), 0) || 1;
  const share = Math.round((Math.max(0, floor.me) / total) * 100);

  /* ---------- setup ---------- */
  if (stage === "setup") {
    return (
      <div>
        <h1 className="h1">Four people.<br /><em>One floor.</em></h1>
        <p className="sub">
          Everyone speaks in turn and finishes their point — the same as a real round. You can raise
          your hand and be invited in, or cut in and risk being talked over. Staying silent is also a
          choice, and the report will say so.
        </p>
        <Notice mic={mic} />

        <div className="card sky">
          <div className="eye">Today's topic</div>
          <div className="topic" style={{ minHeight: "auto", marginTop: 6 }}>{topic}</div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn sm" onClick={() => setTopic(pick([
              ...TOPICS["Placement & GD"], ...TOPICS["Tech & AI"], ...TOPICS["Society & policy"],
              ...(lib.topics || []).map((t) => t.text)]))}>
              Different topic
            </button>
            {(lib.topics || []).length > 0 && (
              <button className="btn sm" onClick={() => setTopic(pick(lib.topics.map((t) => t.text)))}>
                Use my own topic
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="eye">Round length</div>
          <div className="row" style={{ margin: "10px 0 18px", gap: 8 }}>
            {GD_LENGTHS.map((l) => (
              <button key={l.id} className="slot" data-on={length === l.id ? "1" : "0"} onClick={() => setLength(l.id)}>
                <b>{l.label}</b><span>{l.blurb}</span>
              </button>
            ))}
          </div>
          <div className="eye">Who you're up against</div>
          {PANEL.map((p) => (
            <div key={p.id} className="said">
              <div className="av">
                <span className="avtint" style={{ background: p.color }} />
                <Mascot mood={p.mood} size={46} />
              </div>
              <div><div className="who">{p.name} · {p.role}</div>
                <div className="line" style={{ color: "var(--ink60)", fontSize: 14.5 }}>{p.brief}</div></div>
            </div>
          ))}
          <button className="btn go" style={{ marginTop: 16 }} onClick={begin}>Join the round</button>
        </div>
      </div>
    );
  }

  /* ---------- live ---------- */
  if (stage === "live") {
    const mine = turn && turn.who === "me";
    const remaining = turn ? Math.max(0, Math.ceil(turn.dur * (1 - progress))) : 0;
    return (
      <div>
        <div className="card coral">
          <div className="tag">{fmt(length - watch.t)} left</div>
          <div style={{ fontFamily: "var(--dis)", fontWeight: 600, fontSize: 18, lineHeight: 1.25, marginBottom: 10 }}>{topic}</div>
          <div className="vine"><i style={{ width: `${(watch.t / length) * 100}%` }} /></div>
          <div className="mini">
            {PANEL.map((p) => (
              <div key={p.id} className="pc" data-live={turn && turn.who === p.id ? "1" : "0"}>
                <div className="av">
                  <span className="avtint" style={{ background: p.color }} />
                  <Mascot mood={p.mood} size={46} />
                </div>
                <small>{p.name}</small><i>{counts[p.id]} turn{counts[p.id] === 1 ? "" : "s"}</i>
              </div>
            ))}
            <div className="pc" data-live={mine ? "1" : "0"}>
              <div className="av" style={{ background: "var(--paper)" }}>Y</div>
              <small>You</small><i>{counts.me} turn{counts.me === 1 ? "" : "s"}</i>
            </div>
          </div>
        </div>

        {turn && (
          <div className="nowspeak">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="eye">{mine ? "you have the floor" : `${turn.name} is speaking`}</span>
              <span className="eye">{remaining}s</span>
            </div>
            <div className="turnbar"><i style={{ width: `${progress * 100}%`, background: mine ? "var(--moss)" : turn.color }} /></div>
            {handUp && !mine && (
              <p className="queue"><Icon name="hand" size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
                hand raised — you'll be invited after this point</p>
            )}
          </div>
        )}

        <div className="card">
          <div className="feed" ref={scrollRef} role="log" aria-live="polite">
            {feed.map((f, i) => (
              <div key={i} className={"said" + (f.who === "me" ? " me" : "")}>
                <div className="av" style={{ background: f.color, color: f.who === "mod" ? "#fff" : "#f4f1ff" }}>
                  {f.who === "mod" ? "M" : f.name[0]}
                </div>
                <div><div className="who">{f.name}</div><div className="line">{f.line}</div></div>
              </div>
            ))}
          </div>

          {mine && mode === "mic" && (
            <>
              <Grass level={mic.level} live={mic.speaking} />
              <div className="script" style={{ fontSize: 15.5, minHeight: 26, color: "var(--moss)" }}>
                {mic.finalText.slice(myStart.current.length)}<span className="interim">{mic.interim}</span><span className="caret" />
              </div>
            </>
          )}
          {mine && mode === "type" && (
            <Writer value={typed} onChange={setTyped} rows={3} placeholder="Your point — the panel reads it and answers you." />
          )}

          <div className="row" style={{ marginTop: 14 }}>
            {mine ? <button className="btn leaf" onClick={handBack}>Hand it back</button> : (
              <>
                <button className="btn gold" onClick={raiseHand} disabled={handUp}>
                  {handUp ? "Hand raised" : "Raise hand"}
                </button>
                <button className="btn go" onClick={cutIn}>Cut in</button>
              </>
            )}
            <button className="btn" onClick={() => { const v = !voice; setVoice(v); if (!v) stopSpeaking(); }}>
              {voice ? "Mute panel" : "Panel voices"}
            </button>
            <button className="btn" onClick={finish}>End round</button>
          </div>
          <p className="ex" style={{ marginTop: 10 }}>
            {mine
              ? (mode === "type" ? "Write your point, then hand the floor back." : "Speak now — every word is transcribed and evaluated.")
              : "Raise your hand and you'll be brought in cleanly. Cut in and you might get rolled over — especially over Kavya, and especially early in someone's point."}
          </p>
        </div>
      </div>
    );
  }

  /* ---------- report ---------- */
  const segs = [{ id: "me", name: "You", color: "#161334" }, ...PANEL];
  const mineText = myLines.join(" ");
  const gdR = analyse(mineText, Math.max(1, Math.max(0, floor.me)), mode);
  const gdAh = ahReport(gdR);
  const contrib = scoreContribution(myLines, feedRef.current, share, entries, blocked, firstEntry, length);
  const notes = contributionNotes(contrib, myLines);
  return (
    <div>
      <h1 className="h1">Your <em>floor report</em></h1>

      <div className="card sky">
        <RoleHead role={ROLES[0]} />
        <div className="eye">Who held the floor</div>
        <div className="ribbon">
          {segs.map((s) => <div key={s.id} style={{ background: s.color, width: `${(Math.max(0, floor[s.id]) / total) * 100}%` }} />)}
        </div>
        <div className="key">
          {segs.map((s) => <span key={s.id}><i className="dot" style={{ background: s.color }} />{s.name} {Math.round((Math.max(0, floor[s.id]) / total) * 100)}%</span>)}
        </div>
        <div className="stat" style={{ marginTop: 12 }}><span>Time to first entry</span>
          <b className={firstEntry === null ? "bad" : firstEntry < 45 ? "ok" : "warn"}>{firstEntry === null ? "never" : fmt(firstEntry)}</b></div>
        <div className="stat"><span>Turns taken</span><b className={counts.me >= 3 ? "ok" : "warn"}>{counts.me}</b></div>
        <div className="stat"><span>Talked over</span><b className={blocked > 2 ? "bad" : "ok"}>{blocked}</b></div>
        <div className="stat"><span>Share of the floor</span><b className={share >= 18 ? "ok" : "warn"}>{share}%</b></div>
      </div>

      {myLines.length > 0 && (
        <>
          <div className="card sun">
            <div className="role">
              <div className="rbadge"><Mascot mood="teach" size={46} /></div>
              <div><div className="rname">Contribution</div>
                <div className="rrole">what you added, not how long you spoke</div></div>
            </div>
            <div className="gddial" style={{ marginTop: 10 }}>
              <div><b className={contrib.originality > 55 ? "ok" : "warn"}>{contrib.originality}</b><span>Original</span></div>
              <div><b className={contrib.responsiveness > 55 ? "ok" : "warn"}>{contrib.responsiveness}</b><span>Responsive</span></div>
              <div><b className={contrib.reasoning > 55 ? "ok" : "warn"}>{contrib.reasoning}</b><span>Reasoning</span></div>
              <div><b className={contrib.buildOn > 45 ? "ok" : "warn"}>{contrib.buildOn}</b><span>Builds on</span></div>
            </div>
            {notes.map((n, i) => (
              <div key={i} style={{ marginTop: 14 }}>
                <div className="eye">{n.k}</div>
                <p style={{ fontSize: 15, lineHeight: 1.6, margin: "4px 0 0" }}>{n.v}</p>
              </div>
            ))}
          </div>

          <div className="card coral">
            <RoleHead role={ROLES[1]} />
            <AhCounterBody a={gdAh} />
          </div>

          <div className="card moss">
            <RoleHead role={ROLES[2]} />
            <p style={{ fontSize: 15, lineHeight: 1.65 }}>{gramReport(gdR, null, false).line}</p>
            {gdR.grammar.length > 0 && <Corrections items={gdR.grammar} />}
          </div>

          <div className="card">
            <div className="eye" style={{ marginBottom: 10 }}>Everything you said</div>
            {myLines.map((l, i) => <div className="fixrow" key={i}>{l}</div>)}
            <RomanToggle text={mineText} from={gdR.lang && gdR.lang.primary} />
          </div>
        </>
      )}

      <div className="card sun">
        <RoleHead role={ROLES[3]} />
        {aiState === "loading" && <p className="ex"><span className="spin" />the evaluator is writing…</p>}
        {aiState === "thin" && <div className="note badl">
          <b>You barely entered.</b> A panel remembers whoever speaks in the first ninety seconds. Next
          round, raise your hand inside the first minute — even with a mediocre point. Entering early
          buys the right to be heard later.
        </div>}
        {(aiState === "offline" || aiState === "done") && (
          <>
            <div className="eye">Commendation</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.65, marginTop: 6 }}>
              {ai ? ai.commend : (firstEntry !== null && firstEntry < 60
                ? "You got in early. That single habit separates people who are remembered from people who aren't."
                : "You contributed real content rather than filler agreement.")}
            </p>
            <div className="eye" style={{ marginTop: 14 }}>Recommendation</div>
            <div className="note">
              {ai ? ai.recommend : (blocked > 2
                ? "You kept cutting in mid-point, which is why you were rolled over. Wait for a falling tone or use the hand — then open with the last speaker's name. Naming someone makes interrupting sound like listening."
                : share < 15
                  ? "You entered but didn't stay. Once you have the floor, give the point a shape: claim, one reason, one example. Twenty seconds, and nobody can take it from you mid-structure."
                  : "Next level: summarise the group's split before adding your own view. Moderators score that highest and nobody else in the room does it.")}
            </div>
          </>
        )}
      </div>

      <div className="row">
        <button className="btn go" onClick={() => { setStage("setup"); setTopic(pick(TOPICS["Placement & GD"])); }}>Run another</button>
      </div>
    </div>
  );
}
/* ================================ VOCAB =================================== */


function Vocabulary({ mic, onFinish, wotd, lib }) {
  const deck = useMemo(() => [...(lib.words || []), ...VOCAB], [lib.words]);
  const [i, setI] = useState(() => Math.max(0, deck.findIndex((v) => v.w === wotd.w)));
  const [flipped, setFlipped] = useState(false);
  const [bank, setBank] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [mode, setMode] = useState("mic");
  const [typed, setTyped] = useState("");
  const [said, setSaid] = useState("");
  const [result, setResult] = useState(null);
  const [petals, setPetals] = useState(false);

  const card = deck[i % deck.length] || deck[0];
  const typedRef = useRef(""); typedRef.current = typed;
  const modeRef = useRef("mic"); modeRef.current = mode;
  const cardRef = useRef(card); cardRef.current = card;

  const judge = useCallback(async () => {
    const c = cardRef.current;
    const m = modeRef.current;
    mic.stop(); watch.stop();
    if (m !== "type") await mic.settled();
    const text = (m === "type" ? typedRef.current : mic.bestText().text).trim();
    setSaid(text);
    if (!text) {
      setResult({ used: false, correct: false, verdict: "Nothing came through. Record again, or write it instead.", better: "", grammar: [] });
      setPhase("result"); return;
    }
    // Local judgement first: did they use it, or merely mention it?
    const usage = checkWordUsage(c.w, text);
    const grammar = usageGrammar(c.w, usage.unit || text);
    setPhase("judging");
    askClaude(WORD_JUDGE_SYS,
      `Target word: "${c.w}" (${c.p})${c.d ? ` — meaning: ${c.d}` : ""}${c.e ? `\nIntended use: "${c.e}"` : ""}\nWhat they said: """${text}"""`, 500)
      .then((j) => {
        // The model can pass something the local check knows is only a mention.
        const used = j.used && usage.used;
        const correct = used && j.grammatical !== false && j.natural !== false && j.intended !== false && usage.natural;
        setResult({ ...j, used, correct, usage, grammar });
        setPhase("result");
        if (used && correct) {
          setBank((v) => (v.includes(c.w) ? v : [...v, c.w]));
          setPetals(true); setTimeout(() => setPetals(false), 2600);
          onFinish({ xp: 20, seconds: 30, kind: "vocab" });
        }
      })
      .catch(() => {
        const ok = usage.used && usage.natural && grammar.length === 0;
        setResult({
          used: usage.used, correct: ok, usage, grammar, better: "",
          verdict: usage.reason + (ok
            ? " Grammatically clean too. The meaning check needs an API key, so this passes on structure alone."
            : grammar.length ? " The clause itself has a grammar problem — see below." : ""),
        });
        if (ok) { setBank((v) => (v.includes(c.w) ? v : [...v, c.w])); onFinish({ xp: 20, seconds: 30, kind: "vocab" }); }
        setPhase("result");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic, onFinish]);

  const watch = useStopwatch(30, judge);

  const record = async () => {
    setTyped(""); setResult(null);
    const ok = await mic.start();
    setMode(ok ? "mic" : "type"); setPhase("live"); watch.start();
  };
  const write = () => { setTyped(""); setResult(null); setMode("type"); setPhase("live"); watch.start(); };
  const next = () => { setI((v) => (v + 1) % deck.length); setFlipped(false); setPhase("idle"); setResult(null); setSaid(""); setTyped(""); watch.reset(); };

  const isWotd = card.w === wotd.w;

  return (
    <div>
      <Petals go={petals} />
      <h1 className="h1">Words that <em>land</em> in a room.</h1>
      <p className="sub">
        The Grammarian sets a word for the day. Say one sentence that would work in a real discussion —
        a word joins your bank only when you've used it correctly out loud.
      </p>
      <Notice mic={mic} />

      <div className={"card " + (isWotd ? "sun" : "sky")}>
        {isWotd && <div className="tag">word of the day</div>}
        <div className="flip" data-flip={flipped ? "1" : "0"} onClick={() => phase !== "live" && setFlipped((v) => !v)}>
          <div className="flip-in">
            <div className="flip-face">
              <div className="pos">{card.p.toUpperCase()}</div>
              <div className="word">{card.w}</div>
              <div className="flip-hint"><i>→</i> tap the card to turn it over</div>
              <p className="ex" style={{ marginTop: 10 }}>Try defining it out loud before you look.</p>
            </div>
            <div className="flip-back" aria-hidden={!flipped}>
              <div className="pos">MEANING</div>
              <div className="def" style={{ fontSize: 18 }}>{card.d || "No definition given — say it in a sentence and we'll judge the usage."}</div>
              {card.e && <div className="ex">“{card.e}”</div>}
              <div className="flip-hint"><i>→</i> tap to flip back</div>
            </div>
          </div>
        </div>

        {phase === "live" && (
          <>
            <div className="clock" style={{ marginTop: 14 }}>{fmt(watch.t)} <small>of 0:30</small></div>
            <div className="vine"><i style={{ width: `${(watch.t / 30) * 100}%` }} /></div>
            {mode === "mic" ? (
              <>
                <Grass level={mic.level} live={mic.speaking} />
                <div className="script" style={{ fontSize: 15.5, minHeight: 30 }}>
                  {mic.finalText}<span className="interim">{mic.interim}</span><span className="caret" />
                </div>
              </>
            ) : (
              <Writer value={typed} onChange={setTyped} rows={3} placeholder={`One sentence using “${card.w}” the way you'd say it in a discussion.`} />
            )}
          </>
        )}

        <div className="row" style={{ marginTop: 18 }}>
          {phase === "idle" && <><button className="btn go" onClick={record}>Say it in 30s</button>
            <button className="btn" onClick={write}>Write it</button></>}
          {phase === "live" && <button className="btn leaf" onClick={judge}>Done</button>}
          {phase !== "live" && <button className="btn" onClick={() => setFlipped((v) => !v)}>{flipped ? "Back to the word" : "Flip the card"}</button>}
          {phase !== "live" && <button className="btn" onClick={next}>Next word</button>}
        </div>
      </div>

      {phase === "judging" && <div className="card"><span className="spin" />Checking how you used it…</div>}

      {phase === "result" && result && (
        <div className={"card " + (result.correct ? "moss" : "coral")}>
          <div className="eye">{result.correct ? "It's yours" : result.used ? "Close" : "Not yet"}</div>
          {said && <p className="ex" style={{ margin: "8px 0" }}>You said: “{said}”</p>}
          <div className={"note " + (result.correct ? "" : "badl")}>{result.verdict}</div>
          {result.usage && (
            <div className="tally" style={{ marginTop: 12 }}>
              <span className="tchip">said it {result.usage.used ? "✓" : "✗"}</span>
              <span className="tchip">real sentence {result.usage.natural ? "✓" : "✗"}</span>
              <span className="tchip">grammatical {result.grammar && result.grammar.length === 0 ? "✓" : "✗"}</span>
              {typeof result.intended === "boolean" && <span className="tchip">right meaning {result.intended ? "✓" : "✗"}</span>}
              {typeof result.natural === "boolean" && <span className="tchip">sounds natural {result.natural ? "✓" : "✗"}</span>}
            </div>
          )}
          {result.usage && result.usage.mention && (
            <p className="ex" style={{ marginTop: 10 }}>
              Mentioning a word and using it are different skills. A panel only ever sees the second one.
            </p>
          )}
          {result.better && <div className="fixrow" style={{ marginTop: 14 }}>
            <span className="badge v">Sharper</span><div className="now">{result.better}</div></div>}
          {result.grammar && result.grammar.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="eye" style={{ marginBottom: 10 }}>The Grammarian also caught</div>
              <Corrections items={result.grammar} />
            </div>
          )}
          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn go" onClick={next}>Next word</button>
            <button className="btn" onClick={mode === "type" ? write : record}>Try again</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="eye">Your bank · {bank.length} of {deck.length}</div>
        <div className="bank">
          {bank.length === 0
            ? <div className="emptystate"><Mascot mood="curious" size={78} />
                <span className="ex">Empty so far. Use a word correctly out loud and it lands here.</span></div>
            : bank.map((w) => <span key={w} className="seed">{w}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ================================= CLUB ================================== */

function Club({ days, setDays, active, setActive, stats, agenda, go, wotd, lib, profile, replay }) {
  const plan = PLANS.find((p) => p.id === active) || PLANS[1];
  const earned = Math.min(days.length, plan.id) * plan.back;
  const net = Math.max(0, plan.fee - earned);
  const stage = stageFor(stats.reps);
  const doneCount = [agenda.vocab, agenda.topic, agenda.gd].filter(Boolean).length;

  return (
    <div>
      <h1 className="h1">Today's <em>meeting</em></h1>
      <p className="sub">
        A club meeting is three items. Do all three and the day is planted — most people manage the
        first two in under five minutes.
      </p>

      <div className="card moss">
        <div className="tag">{doneCount} of 3</div>
        <div className="agenda">
          <button className="aitem" data-done={agenda.vocab ? "1" : "0"} onClick={() => go("vocab")}>
            <div className="abox">{agenda.vocab ? "✓" : "1"}</div>
            <div><b>Word of the day — {wotd.w}</b><span>Use it in a sentence. 30 seconds.</span></div>
          </button>
          <button className="aitem" data-done={agenda.topic ? "1" : "0"} onClick={() => go("topics")}>
            <div className="abox">{agenda.topic ? "✓" : "2"}</div>
            <div><b>Table Topic</b><span>One topic, on the clock, evaluated by the roles.</span></div>
          </button>
          <button className="aitem" data-done={agenda.gd ? "1" : "0"} onClick={() => go("gd")}>
            <div className="abox">{agenda.gd ? "✓" : "3"}</div>
            <div><b>Group discussion</b><span>Five minutes with the panel. The hard one.</span></div>
          </button>
          <button className="aitem" onClick={() => go("debate")}>
            <div className="abox"><Icon name="chat" size={15} /></div>
            <div><b>Debate a motion</b><span>Pick a side, prep, then defend it on the clock.</span></div>
          </button>
          <button className="aitem" onClick={() => go("interview")}>
            <div className="abox"><Icon name="chat" size={15} /></div>
            <div><b>Mock interview</b><span>Adaptive interviewer, scored on twenty dimensions.</span></div>
          </button>
        </div>
        {doneCount === 3 && (
          <div className="note" style={{ marginTop: 14 }}>
            <b>Meeting complete.</b> That's the full agenda — the part almost nobody does three days
            running. Come back tomorrow for a new word.
          </div>
        )}
      </div>

      <div className="card sun">
        <div className="plantwrap">
          <Mascot mood={stats.reps >= 18 ? "cool" : stats.reps >= 6 ? "wave" : stats.reps >= 1 ? "curious" : "confused"}
            size={104} className="masc-bob" />
          <div>
            <div className="eye">your standing</div>
            <div className="stagelbl">{stage.name}</div>
            <p className="ex" style={{ margin: "2px 0 0" }}>{stage.note}</p>
          </div>
        </div>
        <div className="dials" style={{ marginTop: 14 }}>
          <div className="dial"><b>{stats.reps}</b><span>Speeches</span></div>
          <div className="dial"><b>{stats.xp}</b><span>Points</span></div>
          <div className="dial"><b>{Math.round(stats.seconds / 60)}m</b><span>On the mic</span></div>
        </div>
      </div>

      {profile && (profile.blocks || []).length > 0 && (
        <div className="card sky">
          <div className="eye">What you asked us to watch</div>
          <div className="bank" style={{ marginTop: 8 }}>
            {profile.blocks.map((b) => {
              const meta = BLOCKS.find((x) => x.id === b);
              return meta ? <span className="seed" key={b}>{meta.label}</span> : null;
            })}
          </div>
          {profile.baseline && (
            <>
              <div className="stat" style={{ marginTop: 12 }}>
                <span>Your day-one baseline</span>
                <b className={profile.baseline.overall > 60 ? "ok" : "warn"}>{profile.baseline.overall}/100</b>
              </div>
              <div className="stat">
                <span>Crutch words then</span><b>{profile.baseline.fillers}</b>
              </div>
              <p className="ex" style={{ marginTop: 10 }}>
                Fifteen seconds, before you'd practised anything. Every rep is measured against it.
              </p>
            </>
          )}
          <button className="btn sm" style={{ marginTop: 12 }} onClick={replay}>Replay the intro</button>
        </div>
      )}

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="eye">Your library</div>
            <p style={{ fontSize: 15, margin: "4px 0 0" }}>
              {lib.topics.length} custom topic{lib.topics.length === 1 ? "" : "s"} · {lib.words.length} custom word{lib.words.length === 1 ? "" : "s"}
            </p>
          </div>
          <button className="btn sm" onClick={() => go("library")}>Manage</button>
        </div>
        {lib.topics.length === 0 && lib.words.length === 0 && (
          <p className="ex" style={{ marginTop: 10 }}>
            Bring your college's own GD topics and vocabulary in — they run through the same
            role-players and scoring as everything built in.
          </p>
        )}
      </div>

      <h2 className="h1" style={{ fontSize: 28, marginTop: 28 }}>Put money on showing up</h2>
      <p className="sub">
        Practice is skippable, which is why most people stop on day three. Stake a deposit — every day
        you finish sends part of it back.
      </p>

      <div className="row" style={{ alignItems: "stretch", marginBottom: 16 }}>
        {PLANS.map((p) => (
          <div key={p.id} className="plan" data-on={active === p.id ? "1" : "0"}>
            <div className="eye">{p.tag}</div>
            <h4>{p.id}-day {p.name}</h4>
            <p className="ex" style={{ margin: "0 0 12px" }}>{p.blurb}</p>
            <div style={{ fontFamily: "var(--mon)", fontSize: 13 }}>Stake ₹{p.fee}</div>
            <div style={{ fontFamily: "var(--mon)", fontSize: 13 }} className="ok">₹{p.back}/day back</div>
            <button className={"btn sm " + (active === p.id ? "" : "go")} style={{ marginTop: 12 }}
              onClick={() => { setActive(p.id); setDays([]); }}>
              {active === p.id ? "Running" : `Stake ₹${p.fee}`}
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="eye">Day {Math.min(days.length + 1, plan.id)} of {plan.id}</div>
        <div className="plot">
          {Array.from({ length: plan.id }, (_, k) => k + 1).map((d) => {
            const done = days.includes(d);
            return (
              <button key={d} className="cell" data-s={done ? "done" : d === days.length + 1 ? "today" : "open"}
                onClick={() => setDays((v) => (v.includes(d) ? v.filter((x) => x !== d) : [...v, d]))}
                aria-label={`Day ${d}${done ? ", done" : ""}`}>
                <Plant reps={done ? 4 : 0} size={30} /><span>{d}</span>
              </button>
            );
          })}
        </div>
        <div className="stat"><span>Days done</span><b className="ok">{days.length} / {plan.id}</b></div>
        <div className="stat"><span>Earned back</span><b className="ok">₹{earned}</b></div>
        <div className="stat"><span>Net if you stop today</span><b className={net === 0 ? "ok" : "warn"}>₹{net}</b></div>
      </div>
    </div>
  );
}

/* -------------------------------- KEY BAR -------------------------------- */

/* ==========================================================================
   ONBOARDING — one continuous scene, not eight pages.
   The whole sequence happens at night and blooms into daylight on the last
   beat, which is also the moment the app itself appears.
   ========================================================================== */

const ONB_CSS = `
.onb{position:fixed;inset:0;z-index:200;overflow:hidden;background:#07061a;color:#f2f7ea;font-family:var(--bod);perspective:1200px;transition:background 1.1s ease}
.onb[data-dawn="1"]{background:var(--paper);color:var(--ink)}
.onb-sky{position:absolute;inset:-10%;pointer-events:none;z-index:0;transition:opacity .9s ease, transform 1.1s cubic-bezier(.2,.8,.2,1)}
.onb-glow{position:absolute;border-radius:50%;filter:blur(60px);opacity:.55;transition:all 1.2s cubic-bezier(.2,.8,.2,1)}
.g1{width:52vw;height:52vw;background:#7a5cf0;left:-12%;top:6%}
.g2{width:44vw;height:44vw;background:#5b3fd0;right:-14%;top:34%}
.g3{width:38vw;height:38vw;background:#a03fa0;left:26%;bottom:-12%;opacity:.35}
.onb[data-dawn="1"] .onb-glow{opacity:.22;filter:blur(70px)}
/* depth field — cheap parallax, transform-only */
.onb-field{position:absolute;inset:0;pointer-events:none;z-index:0;transform-style:preserve-3d;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.mote{position:absolute;border-radius:50%;background:#c3aaff;opacity:.16;animation:float 9s ease-in-out infinite alternate}
@keyframes float{to{transform:translate3d(0,-22px,0)}}
.onb-stage{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;max-width:640px;margin:0 auto;padding:14px 22px calc(20px + env(safe-area-inset-bottom))}
.onb-top{display:flex;align-items:center;gap:12px;padding:6px 0 2px;flex:0 0 auto}
.onb-back{border:none;background:none;color:inherit;font-size:20px;cursor:pointer;padding:6px 8px 6px 0;opacity:.75}
.onb-back:disabled{opacity:0;pointer-events:none}
.pips{display:flex;gap:5px;flex:1}
.pip{height:3px;flex:1;border-radius:99px;background:rgba(242,247,234,.18);transition:background .4s}
.onb[data-dawn="1"] .pip{background:rgba(22,50,31,.15)}
.pip[data-on="1"]{background:#c3aaff}
.pip[data-on="2"]{background:#f7f3e0}
.onb[data-dawn="1"] .pip[data-on="1"]{background:var(--moss)}
.onb-skip{border:none;background:none;color:inherit;opacity:.55;font-size:12.5px;cursor:pointer;font-family:var(--mon);letter-spacing:.08em}
.onb-body{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;overflow-y:auto;padding:8px 0;scrollbar-width:none;gap:2px}
.onb-body::-webkit-scrollbar{display:none}
.onb-foot{flex:0 0 auto;padding-top:14px}
.onb-h{font-family:var(--dis);font-size:clamp(30px,8.4vw,44px);line-height:1.02;letter-spacing:-.035em;margin:0 0 14px;font-weight:700;text-wrap:balance}
.onb-h em{font-style:normal;color:#c3aaff}
.onb[data-dawn="1"] .onb-h em{color:var(--moss)}
.onb-p{font-size:16px;line-height:1.6;opacity:.72;max-width:34ch;margin:0 0 8px;text-wrap:pretty}
.onb-kicker{font-family:var(--mon);font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.5;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.wfade{display:inline-block;opacity:0;transform:translateY(10px);animation:wf .55s forwards}
@keyframes wf{to{opacity:1;transform:none}}
.onb-btn{width:100%;border:none;border-radius:999px;padding:16px 24px;font-size:16px;font-weight:700;background:#c3aaff;color:#07061a;cursor:pointer;font-family:var(--bod);transition:.14s;box-shadow:0 6px 0 #5a3fc0,0 12px 26px rgba(195,170,255,.22);position:relative;overflow:hidden}
.onb-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 0 #5a3fc0,0 16px 30px rgba(195,170,255,.26)}
.onb-btn:active:not(:disabled){transform:translateY(4px);box-shadow:0 2px 0 #5a3fc0}
.onb-btn:disabled{opacity:.3;cursor:not-allowed;box-shadow:none}
.onb-btn.ghost{background:transparent;color:inherit;border:2px solid rgba(242,247,234,.28);box-shadow:none;font-weight:600}
.onb[data-dawn="1"] .onb-btn{background:var(--ink);color:var(--paper);box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 0 1px rgba(157,128,255,.35)}
.onb-hint{font-family:var(--mon);font-size:11px;opacity:.45;text-align:center;margin-top:10px}
/* fear cards */
.fears{display:flex;gap:10px;margin:6px 0 18px}
.fear{flex:1;border:1.5px solid rgba(242,247,234,.16);border-radius:18px;padding:18px 10px;text-align:center;background:rgba(242,247,234,.03);animation:rise .6s cubic-bezier(.2,1.2,.35,1) both}
.fear svg{opacity:.55;margin-bottom:8px}
.fear b{display:block;font-size:13.5px;font-weight:600}
@keyframes rise{from{opacity:0;transform:translateY(26px) scale(.94)}}
/* selectable pods — the floating multi-select */
.pods{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:6px 0 4px;transform-style:preserve-3d}
.pod{border:1.5px solid rgba(242,247,234,.2);background:rgba(242,247,234,.04);color:inherit;border-radius:999px;padding:13px 18px;font-size:14.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:var(--bod);transition:transform .32s cubic-bezier(.2,1.5,.4,1), background .25s, border-color .25s, box-shadow .3s;animation:podin .5s cubic-bezier(.2,1.2,.35,1) both;position:relative}
@keyframes podin{from{opacity:0;transform:translate3d(0,18px,-60px)}}
.pod:hover{border-color:rgba(242,247,234,.4)}
.pod[data-on="1"]{background:#c3aaff;color:#07061a;border-color:#c3aaff;font-weight:700;transform:translateZ(30px) scale(1.06) rotate(-1.2deg);box-shadow:0 10px 26px rgba(195,170,255,.28)}
.pod.sq{border-radius:16px}
.pod.cap{border-radius:999px;padding:11px 22px}
.pod i{font-style:normal;font-size:15px;opacity:.8}
.pod[data-on="1"] i{opacity:1}
.count{font-family:var(--mon);font-size:11px;opacity:.5;text-align:center;margin-top:14px}
/* the timer bloom */
.ring-wrap{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:14px 0 6px}
.ring2{position:relative;display:grid;place-items:center;color:var(--ink)}
.ring2 svg{position:absolute;inset:0;transform:rotate(-90deg);animation:ringin 1.1s cubic-bezier(.2,.8,.2,1) both}
@keyframes ringin{from{opacity:0;transform:rotate(-90deg) scale(.86)}}
.ring2-core{position:relative;z-index:1;display:grid;place-items:center;animation:corein .7s .18s cubic-bezier(.2,1.3,.35,1) both}
@keyframes corein{from{opacity:0;transform:scale(.6)}}
.ring2-num{font-family:var(--mon);font-size:40px;font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
/* the label sits below the instrument, never across its stroke */
.ring2-cap{font-family:var(--mon);font-size:10px;letter-spacing:.22em;text-transform:uppercase;opacity:.45;margin:16px 0 0;text-align:center}
.micmark{display:grid;place-items:center;color:var(--ink)}
.micmark.live{animation:breathe 2.6s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:scale(1);opacity:.92}50%{transform:scale(1.06);opacity:1}}
/* live waveform */
.wave{display:flex;gap:3px;align-items:center;justify-content:center;height:56px;margin:14px 0 6px;filter:drop-shadow(0 0 8px rgba(195,170,255,.25))}
.wbar{width:5px;border-radius:99px;background:#c3aaff;min-height:5px;transition:height .07s linear,background .3s}
.wbar.dim{background:rgba(242,247,234,.18)}
/* transcript preview */
.otxt{font-size:16px;line-height:1.8;max-height:150px;overflow-y:auto;opacity:.9;border-left:2px solid rgba(195,170,255,.4);padding-left:14px;margin:8px 0}
.otxt .fil{background:rgba(255,107,74,.24);border:none;border-radius:4px;padding:0 3px;color:inherit}
.otxt .hed{background:rgba(255,201,60,.2);border:none;border-radius:4px;padding:0 3px;color:inherit;font-style:italic}
/* baseline result */
.bmet{display:flex;gap:9px;flex-wrap:wrap;margin:4px 0 12px}
.bm{flex:1 1 78px;border:1.5px solid rgba(242,247,234,.16);border-radius:16px;padding:13px 6px;text-align:center;background:rgba(242,247,234,.03);animation:rise .5s cubic-bezier(.2,1.2,.35,1) both}
.bm b{display:block;font-family:var(--dis);font-weight:700;font-size:27px;line-height:1;font-variant-numeric:tabular-nums}
.bm span{font-family:var(--mon);font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;opacity:.55}
.focusrow{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.ftag{font-family:var(--mon);font-size:11px;border:1.5px solid rgba(195,170,255,.5);color:#c3aaff;border-radius:999px;padding:5px 11px}
.onb[data-dawn="1"] .ftag{border-color:var(--moss);color:var(--moss)}
/* the final bloom */
.bloom{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
.bloom span{position:absolute;border-radius:50%;border:2px solid rgba(195,170,255,.5);animation:bloomout 1.5s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes bloomout{from{width:20px;height:20px;opacity:.9}to{width:200vmax;height:200vmax;opacity:0}}
.orbit{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:16px 0 4px}
.orbit span{font-family:var(--dis);font-size:19px;opacity:0;animation:drawin .7s cubic-bezier(.2,.9,.3,1) forwards}
@keyframes drawin{from{opacity:0;transform:translateY(14px) scale(1.12)}to{opacity:.85;transform:none}}
.pod:active{transform:scale(.96)}
.pod[data-on="1"]:active{transform:translateZ(30px) scale(1)}
.pod::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:0 0 0 0 rgba(195,170,255,.5);transition:box-shadow .5s}
.pod[data-on="1"]::after{box-shadow:0 0 0 8px rgba(195,170,255,0)}
.onb-btn:focus-visible,.onb-back:focus-visible,.onb-skip:focus-visible,.pod:focus-visible{outline:3px solid #c3aaff;outline-offset:3px}
.onb-btn>span{display:inline-flex;align-items:center;gap:8px}
.onb-kicker::after{content:"";height:1px;flex:1;background:currentColor;opacity:.18}
@media (prefers-reduced-motion:reduce){
  .onb *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}`;

const GOALS = [
  { id: "interview", label: "Nail interviews", icon: "◆" },
  { id: "gd", label: "Win group discussions", icon: "◇" },
  { id: "confident", label: "Sound confident", icon: "▲" },
  { id: "meetings", label: "Lead meetings", icon: "■" },
  { id: "pitch", label: "Pitch ideas", icon: "◈" },
  { id: "stories", label: "Tell better stories", icon: "❖" },
  { id: "network", label: "Talk to strangers", icon: "○" },
  { id: "articulate", label: "Sound articulate", icon: "◐" },
];

const BLOCKS = [
  { id: "filler", label: "Filler words", shape: "cap", watches: "Ah-Counter" },
  { id: "ramble", label: "Rambling", shape: "sq", watches: "Conciseness" },
  { id: "fast", label: "Speaking too fast", shape: "cap", watches: "Timer" },
  { id: "slow", label: "Trailing off", shape: "", watches: "Timer" },
  { id: "nerves", label: "Nerves", shape: "sq", watches: "Evaluator" },
  { id: "blank", label: "Going blank", shape: "cap", watches: "Structure" },
  { id: "grammar", label: "Grammar slips", shape: "", watches: "Grammarian" },
  { id: "vocab", label: "Same few words", shape: "sq", watches: "Range" },
  { id: "long", label: "Long sentences", shape: "cap", watches: "Conciseness" },
  { id: "repeat", label: "Repeating myself", shape: "", watches: "Conciseness" },
  { id: "structure", label: "No clear point", shape: "cap", watches: "Structure" },
];

const INTRO_PROMPTS = [
  "What did you do yesterday, and would you do it again?",
  "Something you're good at that nobody asks you about.",
  "The last thing that genuinely annoyed you.",
  "Describe your week to someone who's never met you.",
  "One thing you'd change about your college.",
];

/* --------------------------- onboarding profile -------------------------- */

const PROFILE_KEY = "yap_profile_v1";
const memProfile = { data: null };

function loadProfile() {
  if (memProfile.data) return memProfile.data;
  let saved = null;
  try { saved = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || "null"); } catch (e) { saved = null; }
  memProfile.data = saved || { done: false, goals: [], blocks: [], baseline: null };
  return memProfile.data;
}
function saveProfile(p) {
  memProfile.data = p;
  try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) { /* memory only */ }
  return p;
}

/* Words fade in one at a time without needing a library. */
function Words({ text, delay = 0, cls }) {
  return (
    <span className={cls}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="wfade" style={{ animationDelay: `${delay + i * 0.055}s` }}>
          {w}{i < text.split(" ").length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

function Motes({ n = 14, depth }) {
  const bits = useMemo(() => Array.from({ length: n }, (_, i) => ({
    id: i, x: (i * 37) % 100, y: (i * 61) % 100,
    s: 3 + ((i * 13) % 9), d: (i % 5) * 1.4, z: -((i % 4) * 120),
  })), [n]);
  return (
    <div className="onb-field" style={{ transform: `translateZ(${depth}px)` }} aria-hidden="true">
      {bits.map((b) => (
        <span key={b.id} className="mote" style={{
          left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s,
          animationDelay: `${b.d}s`, transform: `translateZ(${b.z}px)`,
        }} />
      ))}
    </div>
  );
}

/* The shared element: a ring that is the microphone on screen 1, the clock on
   screen 5, and the record button on screen 6. */
function Ring({ pct = 0, label, children, live, size = 196 }) {
  const R = 82, C = 2 * Math.PI * R;
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  return (
    <div className="ring-wrap">
      <div className="ring2" style={{ width: size, height: size }}>
        <svg viewBox="0 0 196 196" width={size} height={size} aria-hidden="true">
          {/* minute ticks — the object reads as an instrument, not a progress bar */}
          <g opacity=".3">
            {ticks.map((i) => {
              const a = (i / 60) * Math.PI * 2;
              const inner = i % 5 === 0 ? 68 : 72;
              return <line key={i}
                x1={98 + Math.cos(a) * inner} y1={98 + Math.sin(a) * inner}
                x2={98 + Math.cos(a) * 75} y2={98 + Math.sin(a) * 75}
                stroke="currentColor" strokeWidth={i % 5 === 0 ? 1.6 : 0.9} strokeLinecap="round" />;
            })}
          </g>
          <circle cx="98" cy="98" r={R} fill="none" stroke="currentColor" strokeWidth="2.5" opacity=".12" />
          <circle cx="98" cy="98" r={R} fill="none"
            stroke={live ? "#ff9c7d" : "#c3aaff"} strokeWidth="3.2" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - Math.max(0, Math.min(1, pct)))}
            style={{ transition: "stroke-dashoffset .35s cubic-bezier(.3,.9,.3,1)", filter: "drop-shadow(0 0 7px rgba(195,170,255,.45))" }} />
        </svg>
        <div className="ring2-core">{children}</div>
      </div>
      {label && <p className="ring2-cap">{label}</p>}
    </div>
  );
}


function BaselineDial({ label, value, delay }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), delay * 1000 + 180); return () => clearTimeout(t); }, [delay]);
  const n = useCountUp(value, 950, go);
  return (
    <div className="bm" style={{ animationDelay: `${delay}s` }}>
      <b style={{ color: value > 65 ? "#c3aaff" : value > 40 ? "#ffd84d" : "#ff8a6a" }}>{n}</b>
      <span>{label}</span>
    </div>
  );
}

function OnboardingFlow({ onDone, mic }) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [prompt] = useState(() => pick(INTRO_PROMPTS));
  const [recState, setRecState] = useState("idle"); // idle | live | done | typed
  const [typed, setTyped] = useState("");
  const [baseline, setBaseline] = useState(null);
  const [dawn, setDawn] = useState(false);
  const LAST = 7;

  const toggle = (setter) => (id) =>
    setter((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  const finishRep = useCallback(async (secs) => {
    mic.stop(); watch.stop();
    if (recState !== "typed") await mic.settled();
    const text = (recState === "typed" ? typed : mic.bestText().text).trim();
    const r = analyse(text, Math.max(1, secs || watch.value() || 15), recState === "typed" ? "type" : "mic");
    setBaseline(r);
    setRecState("done");
    setStep(6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic, recState, typed]);

  const watch = useStopwatch(15, finishRep);

  const startRep = async () => {
    const ok = await mic.start();
    setRecState(ok ? "live" : "typed");
    watch.start();
  };
  const startTyped = () => { setRecState("typed"); watch.start(); };

  const next = () => setStep((s) => Math.min(LAST, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const complete = () => {
    setDawn(true);
    setTimeout(() => {
      onDone(saveProfile({
        done: true, goals, blocks,
        baseline: baseline ? {
          overall: baseline.overall, fluency: baseline.fluency, clarity: baseline.clarity100,
          structure: baseline.structure, accuracy: baseline.accuracy, range: baseline.range,
          fillers: baseline.fillerCount, wpm: baseline.wpm, at: Date.now(),
        } : null,
      }));
    }, 1150);
  };

  const skip = () => onDone(saveProfile({ done: true, goals, blocks, baseline: null }));

  /* map the blocks a user picked onto the role-players that watch for them */
  const watchers = [...new Set(blocks.map((b) => (BLOCKS.find((x) => x.id === b) || {}).watches).filter(Boolean))];

  const SCREENS = [
    /* 0 — the problem */
    () => (
      <>
        <div className="onb-kicker">YAP</div>
        <h1 className="onb-h"><Words text="Nobody decides what you meant." /><br />
          <em><Words text="They decide how you sounded." delay={0.5} /></em></h1>
        <p className="onb-p" style={{ animation: "wf .6s 1.1s both" }}>
          The idea was fine. It arrived wrapped in three “ums”, one sentence that never ended, and a
          closing line that trailed away. That's the part you can change.
        </p>
        <Ring pct={0.72} label="one minute a day">
          <Mascot mood="logo" size={92} className="masc-bob" />
        </Ring>
      </>
    ),
    /* 1 — the fear */
    () => (
      <>
        <h1 className="onb-h"><Words text="Your brain has the answer." /><br />
          <em><Words text="Your mouth negotiates." delay={0.45} /></em></h1>
        <p className="onb-p">Public speaking outranks these as a stated fear. Nobody is taught the way out of it — they're just told to relax.</p>
        <div className="fears">
          {[["Heights", "M4 20 L12 6 L20 20 Z"], ["Spiders", "M12 8 a4 4 0 1 0 .1 0 M4 6 L9 11 M20 6 L15 11 M4 18 L9 14 M20 18 L15 14"], ["Death", "M12 3 a7 7 0 0 0 -4 13 v3 h8 v-3 a7 7 0 0 0 -4 -13"]].map(([n, d], i) => (
            <div className="fear" key={n} style={{ animationDelay: `${0.25 + i * 0.12}s` }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={d} /></svg>
              <b>{n}</b>
            </div>
          ))}
        </div>
        <div className="mascrow" style={{ marginTop: 8 }}>
          <Mascot mood="worried" size={76} className="masc-peek" />
          <p className="onb-p" style={{ margin: 0, opacity: .9 }}>Nerves aren't a personality trait. They're an untrained reflex, and reflexes respond to reps.</p>
        </div>
      </>
    ),
    /* 2 — goals */
    () => (
      <>
        <h1 className="onb-h"><Words text="What do you want your voice to" /> <em>do</em>?</h1>
        <p className="onb-p">Pick everything you're working toward. This sets the topics you'll get.</p>
        <div className="pods">
          {GOALS.map((g, i) => (
            <button key={g.id} className="pod" data-on={goals.includes(g.id) ? "1" : "0"}
              style={{ animationDelay: `${i * 0.045}s` }}
              aria-pressed={goals.includes(g.id)} onClick={() => toggle(setGoals)(g.id)}>
              <i>{g.icon}</i>{g.label}
            </button>
          ))}
        </div>
        <p className="count">{goals.length ? `${goals.length} selected` : "pick at least one"}</p>
      </>
    ),
    /* 3 — blocks */
    () => (
      <>
        <h1 className="onb-h"><Words text="What gets in the way?" /></h1>
        <p className="onb-p">Be honest — this decides what the club watches for first.</p>
        <div className="pods">
          {BLOCKS.map((b, i) => (
            <button key={b.id} className={"pod " + b.shape} data-on={blocks.includes(b.id) ? "1" : "0"}
              style={{ animationDelay: `${i * 0.035}s` }}
              aria-pressed={blocks.includes(b.id)} onClick={() => toggle(setBlocks)(b.id)}>
              {b.label}
            </button>
          ))}
        </div>
        {watchers.length > 0 && (
          <p className="count">{watchers.join(" · ")} will be watching for these</p>
        )}
      </>
    ),
    /* 4 — the practice */
    () => (
      <>
        <h1 className="onb-h"><Words text="You don't need an hour." /><br />
          <em><Words text="You need sixty seconds." delay={0.5} /></em></h1>
        <Ring pct={1} label="one rep, once a day"><b className="ring2-num">01:00</b></Ring>
        <p className="onb-p" style={{ textAlign: "center", margin: "10px auto 0" }}>
          One topic. One minute. No script, no retakes. Four role-players score it the way a real
          speaking club would.
        </p>
      </>
    ),
    /* 5 — the live rep */
    () => (
      <>
        <div className="onb-kicker">your first rep · 15 seconds</div>
        <h1 className="onb-h" style={{ fontSize: "clamp(24px,6.4vw,32px)" }}>{prompt}</h1>
        {recState === "idle" && (
          <>
            <p className="onb-p">Short one to start. Speak until the ring closes — there's nothing to prepare and nobody is listening but the engine.</p>
            <Ring pct={0} label="fifteen seconds">
              <Mascot mood="curious" size={92} className="masc-bob" />
            </Ring>
          </>
        )}
        {recState === "live" && (
          <>
            <Ring pct={watch.t / 15} live label="speak until the ring closes">
              <b className="ring2-num">{15 - watch.t}</b>
            </Ring>
            <div className="wave">
              {mic.level.map((v, i) => (
                <div key={i} className={"wbar" + (mic.speaking ? "" : " dim")} style={{ height: `${Math.max(5, v * 56)}px` }} />
              ))}
            </div>
            <div className="otxt">
              {mic.finalText || <span style={{ opacity: .45 }}>listening…</span>}
              <span style={{ opacity: .5 }}>{mic.interim}</span>
            </div>
          </>
        )}
        {recState === "typed" && (
          <>
            <Ring pct={watch.t / 15} live label="write while the ring closes">
              <b className="ring2-num">{Math.max(0, 15 - watch.t)}</b>
            </Ring>
            <textarea className="typebox" rows={4} value={typed} onChange={(e) => setTyped(e.target.value)}
              style={{ background: "rgba(242,247,234,.05)", color: "inherit", borderColor: "rgba(242,247,234,.2)" }}
              placeholder="Write it the way you'd say it out loud — fillers and all." />
          </>
        )}
      </>
    ),
    /* 6 — the baseline */
    () => {
      const b = baseline;
      if (!b) return <><h1 className="onb-h">Let's start from here.</h1>
        <p className="onb-p">No baseline recorded — that's fine, your first proper rep will set one.</p></>;
      const dials = [
        ["Flow", b.fluency], ["Clarity", b.clarity100], ["Structure", b.structure],
        ["Grammar", b.accuracy], ["Range", b.range],
      ];
      return (
        <>
          <div className="onb-kicker">your baseline · measured, not guessed</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
            <Mascot mood={b.wc < 8 ? "shocked" : moodForScore(b.overall)} size={86} className="masc-pop" />
          </div>
          <h1 className="onb-h" style={{ fontSize: "clamp(26px,7vw,36px)" }}>
            {b.wc < 8 ? "Barely anything came through." : <><Words text="This is where you start." /></>}
          </h1>
          <div className="bmet">
            {dials.map(([k, v], i) => (
              <BaselineDial key={k} label={k} value={v} delay={0.15 + i * 0.09} />
            ))}
          </div>
          {b.text && (
            <div className="otxt">{renderMarked(b.text, b.fillers)}</div>
          )}
          <p className="onb-p" style={{ marginTop: 6 }}>
            {b.fillerCount > 0
              ? `${b.fillerCount} crutch word${b.fillerCount === 1 ? "" : "s"} in ${b.wc} words, at ${b.wpm} per minute. `
              : `No crutch words in ${b.wc} words. `}
            Every rep from here is measured against this.
          </p>
          {watchers.length > 0 && (
            <>
              <p className="count" style={{ textAlign: "left", marginTop: 12 }}>watching for you</p>
              <div className="focusrow">{watchers.map((w) => <span className="ftag" key={w}>{w}</span>)}</div>
            </>
          )}
        </>
      );
    },
    /* 7 — the promise */
    () => (
      <>
        {dawn && <div className="bloom"><span /></div>}
        <h1 className="onb-h" style={{ textAlign: "center" }}>
          <Words text="Your next conversation" /><br /><em><Words text="can sound different." delay={0.4} /></em>
        </h1>
        <Ring pct={1} label="the club is open">
          <Mascot mood="cool" size={92} className="masc-pop" />
        </Ring>
        <div className="orbit">
          {["Clear.", "Concise.", "Grounded.", "Yours."].map((w, i) => (
            <span key={w} style={{ animationDelay: `${0.5 + i * 0.16}s` }}>{w}</span>
          ))}
        </div>
        <p className="onb-p" style={{ textAlign: "center", margin: "14px auto 0" }}>
          The club is open. Word of the day, one table topic, and a group discussion when you're ready
          for it.
        </p>
      </>
    ),
  ];

  const canAdvance =
    (step === 2 && goals.length === 0) ? false :
    (step === 5 && recState !== "done") ? false : true;

  const cta = () => {
    if (step === 5) {
      if (recState === "idle") return (
        <>
          <button className="onb-btn" onClick={startRep}>
            <span><Icon name="mic" size={19} /> Start recording</span></button>
          <button className="onb-btn ghost" style={{ marginTop: 9 }} onClick={startTyped}>Write it instead</button>
          <p className="onb-hint">no account, nothing uploaded, nothing saved unless you continue</p>
        </>
      );
      return <button className="onb-btn" onClick={() => finishRep(watch.value())}
        disabled={recState === "typed" && typed.trim().length < 3}>Done — see my baseline</button>;
    }
    if (step === LAST) return <button className="onb-btn" onClick={complete}>
      <span>Open the club <Icon name="arrow" size={19} /></span></button>;
    if (step === 4) return <button className="onb-btn" onClick={next}>
      <span>Try one now <Icon name="arrow" size={19} /></span></button>;
    return <button className="onb-btn" onClick={next} disabled={!canAdvance}>
      <span>Continue <Icon name="arrow" size={19} /></span></button>;
  };

  const Screen = SCREENS[step];
  return (
    <div className="onb" data-dawn={dawn ? "1" : "0"}>
      <div className="onb-sky" style={{ transform: `translate3d(0,${step * -1.4}%,0) scale(${1 + step * 0.02})` }}>
        <div className="onb-glow g1" style={{ transform: `translate3d(${step * 6}px,${step * -10}px,0)` }} />
        <div className="onb-glow g2" style={{ transform: `translate3d(${step * -8}px,${step * 8}px,0)` }} />
        <div className="onb-glow g3" style={{ transform: `translate3d(${step * 4}px,0,0)` }} />
      </div>
      <Motes depth={-60 - step * 20} />

      <div className="onb-stage">
        <div className="onb-top">
          <button className="onb-back" onClick={back} disabled={step === 0 || step === 6} aria-label="Back">←</button>
          <div className="pips">
            {Array.from({ length: LAST + 1 }, (_, i) => (
              <span key={i} className="pip" data-on={i < step ? "1" : i === step ? "2" : "0"} />
            ))}
          </div>
          {step < LAST && <button className="onb-skip" onClick={skip}>skip</button>}
        </div>

        <div className="onb-body" key={step}>
          <Screen />
        </div>

        <div className="onb-foot">{cta()}</div>
      </div>
    </div>
  );
}



/* ==========================================================================
   PERSISTENCE
   Everything a user earns survives a reload. One namespaced helper so we
   never scatter raw localStorage calls again.
   ========================================================================== */

const DB_PREFIX = "yap:";
const memFallback = {};

function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(DB_PREFIX + key);
    if (raw == null) return memFallback[key] !== undefined ? memFallback[key] : fallback;
    return JSON.parse(raw);
  } catch (e) {
    return memFallback[key] !== undefined ? memFallback[key] : fallback;
  }
}

function writeStore(key, value) {
  memFallback[key] = value;                     // private mode / quota: keep it in memory
  try { window.localStorage.setItem(DB_PREFIX + key, JSON.stringify(value)); } catch (e) { /* memory only */ }
  return value;
}

/* State that writes itself back on every change. */
function usePersisted(key, initial) {
  const [v, setV] = useState(() => readStore(key, initial));
  const set = useCallback((next) => {
    setV((prev) => {
      const val = typeof next === "function" ? next(prev) : next;
      writeStore(key, val);
      return val;
    });
  }, [key]);
  return [v, set];
}

/* Today, in the user's own timezone — used to roll the daily agenda over. */
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

/* ==========================================================================
   ERROR BOUNDARY
   A render crash used to blank the whole app. Now it keeps the transcript
   visible, because losing someone's words is worse than losing the screen.
   ========================================================================== */

class Boundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) {
    try {
      writeStore("lastCrash", { message: String(err && err.message), stack: String(info && info.componentStack).slice(0, 1200), at: Date.now() });
    } catch (e) { /* nothing more we can do */ }
  }
  render() {
    if (!this.state.err) return this.props.children;
    const rescued = readStore("lastTranscript", "");
    return (
      <div className="grdn">
        <style>{CSS}</style>
        <div className="wrap" style={{ paddingTop: 40 }}>
          <div className="card coral">
            <h1 className="h1" style={{ marginTop: 0 }}>Something <em>broke</em>.</h1>
            <p className="sub">
              That's on us, not on you. The error has been noted locally. Your progress is saved and
              reloading will bring it back.
            </p>
            <p className="ex" style={{ fontFamily: "var(--mon)", fontSize: 12 }}>
              {String(this.state.err && this.state.err.message)}
            </p>
            {rescued && (
              <>
                <div className="eye" style={{ marginTop: 18 }}>Your last transcript, so it isn't lost</div>
                <div className="script" style={{ marginTop: 8 }}>{rescued}</div>
              </>
            )}
            <div className="row" style={{ marginTop: 18 }}>
              <button className="btn go" onClick={() => window.location.reload()}>Reload</button>
              {rescued && (
                <button className="btn" onClick={() => { try { navigator.clipboard.writeText(rescued); } catch (e) { /* no clipboard */ } }}>
                  Copy my transcript
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}


/* --------------------------------- SHELL --------------------------------- */

const TABS = [
  { id: "club", label: "Meeting" },
  { id: "topics", label: "Table Topics" },
  { id: "debate", label: "Debate" },
  { id: "vocab", label: "Vocabulary" },
  { id: "gd", label: "Group discussion" },
  { id: "interview", label: "Mock interview" },
  { id: "rooms", label: "Rooms" },
  { id: "library", label: "My library" },
];

export default function Yap() {
  return <Boundary><YapApp /></Boundary>;
}

function YapApp() {
  const [tab, setTab] = useState(() => (readRoomFromUrl() ? "rooms" : "club"));
  const [days, setDays] = usePersisted("days", []);
  const [active, setActive] = usePersisted("plan", 14);
  const [stats, setStats] = usePersisted("stats", { xp: 0, reps: 0, seconds: 0 });
  // the agenda is per-day: yesterday's ticks shouldn't count as today's meeting
  const [agendaRaw, setAgendaRaw] = usePersisted("agenda", { day: todayKey(), vocab: false, topic: false, gd: false });
  const agenda = agendaRaw.day === todayKey() ? agendaRaw : { day: todayKey(), vocab: false, topic: false, gd: false };
  const setAgenda = useCallback((fn) => setAgendaRaw((prev) => {
    const base = prev.day === todayKey() ? prev : { day: todayKey(), vocab: false, topic: false, gd: false };
    return { ...(typeof fn === "function" ? fn(base) : fn), day: todayKey() };
  }), [setAgendaRaw]);
  const [lib, setLibState] = useState(() => loadLibrary());
  const [profile, setProfile] = useState(() => loadProfile());
  const invited = useMemo(() => !!readRoomFromUrl(), []);
  const [intro, setIntro] = useState(() => !invited && !loadProfile().done);
  const setLib = useCallback((next) => { setLibState(saveLibrary(next)); }, []);
  const wotd = useMemo(() => wordOfTheDay(lib.words), [lib.words]);
  const mic = useMic();

  // stop any live stream when the tab changes, without capturing the whole hook
  const micStop = useRef(mic.stop); micStop.current = mic.stop;
  useEffect(() => { micStop.current(); }, [tab]);

  // stash the newest transcript so the error boundary can rescue it
  useEffect(() => {
    if (mic.finalText && mic.finalText.trim().length > 20) writeStore("lastTranscript", mic.finalText.trim());
  }, [mic.finalText]);

  const onFinish = useCallback(({ xp, seconds, kind }) => {
    setStats((s) => ({ xp: s.xp + xp, reps: s.reps + 1, seconds: s.seconds + seconds }));
    setAgenda((a) => ({ ...a, [kind === "topic" ? "topic" : kind === "gd" ? "gd" : "vocab"]: true }));
    setDays((v) => (v.length < active ? [...v, v.length + 1] : v));
  }, [active, setStats, setAgenda, setDays]);

  const stage = stageFor(stats.reps);

  if (intro) {
    return (
      <div className="grdn">
        <style>{CSS}</style><style>{ONB_CSS}</style>
        <OnboardingFlow mic={mic} onDone={(p) => { setProfile(p); setIntro(false); mic.stop(); }} />
      </div>
    );
  }

  return (
    <div className="grdn">
      <style>{CSS}</style><style>{ONB_CSS}</style><style>{IV_CSS}</style><style>{ROOM_CSS}</style><style>{DEBATE_CSS}</style>
      <div className="wrap">
        <header className="top">
          <div className="mark">
            <Mascot mood="logo" size={38} className="masc-bob" />
            <span className="wordmark-text">Y<i>a</i>p</span>
          </div>
          <div className="pot">
            <Mascot mood={stats.reps >= 10 ? "cool" : stats.reps >= 3 ? "wave" : "curious"} size={26} />
            <div><b>{stats.reps}</b> <small>speeches</small></div>
          </div>
        </header>

        <nav className="nav" role="tablist" aria-label="Meeting sections">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className="tab"
              data-on={tab === t.id ? "1" : "0"} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>

        <LanguageBar mic={mic} />

        <div className="panel" key={tab} role="tabpanel" aria-label={(TABS.find((t) => t.id === tab) || {}).label}>
        {tab === "club" && <Club days={days} setDays={setDays} active={active} setActive={setActive}
          stats={stats} agenda={agenda} go={setTab} wotd={wotd} lib={lib}
          profile={profile} replay={() => setIntro(true)} />}
        {tab === "debate" && <DebateMode mic={mic} onFinish={onFinish} lib={lib} profile={profile} />}
        {tab === "topics" && <TableTopics mic={mic} onFinish={onFinish} wotd={wotd} lib={lib} profile={profile} />}
        {tab === "vocab" && <Vocabulary mic={mic} onFinish={onFinish} wotd={wotd} lib={lib} />}
        {tab === "gd" && <GroupDiscussion mic={mic} onFinish={onFinish} lib={lib} />}
        {tab === "interview" && <MockInterview mic={mic} onFinish={onFinish} lib={lib} />}
        {tab === "rooms" && <Rooms mic={mic} lib={lib} onFinish={onFinish} />}
        {tab === "library" && <Library lib={lib} setLib={setLib} />}
        </div>

        <p className="ex" style={{ textAlign: "center", padding: "22px 0 0" }}>
          {stage.name} · {stats.reps} speech{stats.reps === 1 ? "" : "es"} on record
        </p>
      </div>
    </div>
  );
}