"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AuthBar } from "@/components/AuthBar";
import { useAuth } from "@/lib/supabase/useAuth";
import { useUpgrade } from "@/lib/razorpay";
import { SLOTS, TOPICS, VOCAB, ROLES, PLANS } from "@/lib/yap/content";
import {
  spokenLangCode, INDIC_RANGE, words0, esc, findFillers, checkGrammar,
  segment, hasVerb, analyse, signalFor, timerReport, fmt, ahReport,
  gramReport, evalReport,
} from "@/lib/yap/analysis";

/* ============================================================================
   YAP — speak · practice · evolve
   Run a meeting: Word of the Day → Table Topic → Debate.
   Four role-players evaluate you: Timer, Ah-Counter, Grammarian, Evaluator.
   ========================================================================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
.grdn{--mist:#EAF8FB;--foam:#D6F0F6;--ocean:#7EC8E3;--ocean-deep:#5FAECB;--sand:#F8F2E7;--sand-warm:#EEDBB8;--coral:#FF9F7F;--coral-deep:#E8674A;--ink:#1F4F5B;--ink2:#45636B;--ink3:#7A939A;--line:rgba(31,79,91,.14);--good:#7BAE8F;--warn:#C99A4B;--bad:#E8674A;--surf1:rgba(255,255,255,.55);--surf2:rgba(255,255,255,.8);--dis:"Baloo 2",system-ui,sans-serif;--bod:Manrope,system-ui,sans-serif;background:linear-gradient(180deg,var(--mist) 0%,var(--foam) 38%,var(--sand) 100%);color:var(--ink);font-family:var(--bod);min-height:100%;padding-bottom:150px;position:relative;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.grdn *{box-sizing:border-box}
.grdn button{font-family:var(--bod)}
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
/* ------------------------------- CONTENT --------------------------------- */

/* -- word sanity -------------------------------------------------------- */

/* Declared before the multilingual layer so the engine can use it; the layer
   itself sits further down with the Sarvam calls. */
/* The language the user said they speak. Read by every analysis call so the
   engine never has to guess when the user has already told us. */
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



/* ------------------------------- HELPERS --------------------------------- */

const pick = (a) => a[Math.floor(Math.random() * a.length)];

/* A short mechanical click, like a pawl catching a notch on a spin wheel.
   Synthesised rather than a sound file, so a topic-spin never waits on an
   asset to load and stays silent by default if audio is blocked. */
let spinAudioCtx = null;
function spinTick() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!spinAudioCtx) spinAudioCtx = new AC();
    const ctx = spinAudioCtx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const now = ctx.currentTime;

    const dur = 0.045;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);

    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const click = ctx.createBiquadFilter();
    click.type = "bandpass"; click.frequency.value = 2600; click.Q.value = 5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(click).connect(gain).connect(ctx.destination);
    noise.start(now); noise.stop(now + dur);
  } catch (e) { /* a click is a bonus, never a blocker */ }
}

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

/* Loose stem match, so "nuanced" and "nuances" both count for "nuance" — a
   speaker who inflected the word correctly did use it, and being told
   otherwise would read as a bug. */
function usedWord(word, text) {
  if (!word || !text) return false;
  const w = String(word).toLowerCase().replace(/[^a-z]/g, "");
  if (w.length < 3) return false;
  const stem = w.length > 5 ? w.slice(0, Math.max(4, w.length - 3)) : w.replace(/e$/, "");
  return new RegExp("\\b" + stem, "i").test(text);
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
 *  panel roles, and so on. Same JSON-in, JSON-out contract as
 *  askClaude so every existing call site keeps working unchanged. */
/* The brief's model. gpt-oss-20b is quicker but drops whole fields from the
   brief often enough to be unusable, so the brief stays on the 120b and buys
   its speed from `reasoning_effort: low` on the server instead. */
const GROQ_FAST_MODEL = "openai/gpt-oss-120b";

async function groqChat(system, user, maxTokens = 900, model) {
  // never let a stalled request hang the UI forever — the caller has an
  // offline fallback that is better than an indefinite spinner
  const res = await fetch("/api/groq/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user, max_tokens: maxTokens, model }),
    signal: AbortSignal.timeout(25000),
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

/* Distinct voices per role, so a session sounds like more than one
   narrator reading every part. */
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
    if (window.localStorage.getItem("yap:writer") === "groq") return false;
  } catch (e) { /* default below */ }
  const r = replyLangCode();
  return sarvamReady() && r && r !== "en-IN";
}

/* `fastModel` opts a call into Groq's small, low-latency free model. Use it for
   generative helpers where speed matters more than nuance (the debate research
   brief); the evaluators stay on the bigger default model.

   Both backends keep their key server-side, in our own /api routes — there is
   no browser-held key and no user-configured proxy. Sarvam goes first for
   non-English replies because it is native to Indian languages; Groq is the
   default and the fallback. */
/* `fastModel` also implies "speed matters": it skips Sarvam entirely. Sarvam is
   the better writer for Indian languages, but sarvam-105b is a reasoning model
   that thinks for thousands of hidden tokens before writing a word, which is
   the wrong trade for anything a student is waiting on. */
async function askClaude(system, user, maxTokens = 900, spoken, fastModel) {
  const sys = system + languageDirective(spoken || spokenLangCode());
  if (!fastModel && preferSarvamWriter()) {
    try {
      return await sarvamChat(sys, user, maxTokens);
    } catch (e) { /* fall through to Groq rather than losing the feature */ }
  }
  return groqChat(sys, user, maxTokens, fastModel);
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
  { id: "en-IN", label: "English" },
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
  const [lang, setLang] = usePersistedRef("micLang", "en-IN");
  const langRef = useRef(lang); langRef.current = lang;

  const rec = useRef(null), stream = useRef(null), ctx = useRef(null), raf = useRef(null);
  const recorder = useRef(null), chunks = useRef([]);
  const session = useRef(0);
  const fin = useRef(""), want = useRef(false), voiced = useRef(0);
  const restarts = useRef(0), lastRestart = useRef(0);
  const totalRestarts = useRef(0), restartTimer = useRef(null);
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
    // kill any queued restart so a stopped session can't re-open the mic
    if (restartTimer.current) { clearTimeout(restartTimer.current); restartTimer.current = null; }
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
    voiced.current = 0; restarts.current = 0; totalRestarts.current = 0; confidences.current = [];
    if (restartTimer.current) { clearTimeout(restartTimer.current); restartTimer.current = null; }
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
          const isEnglish = /^en-/.test(langRef.current);
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
    r.continuous = true; r.interimResults = true; r.lang = lang; r.maxAlternatives = 3;

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
      }
      /* "no-speech", "aborted" and "network" are normal; they must not surface as errors */
    };

    /* Web Speech ends the session constantly — on every pause, and on a timer
       even mid-sentence. Each restart makes the browser re-acquire the mic,
       which on some platforms flashes the recording indicator and audibly
       interrupts. So: restart, but never in a way the user can feel.
         - the healthy-stretch reset is generous, so a long session doesn't
           accumulate its way into the cap
         - the total budget is bounded per session, not per stretch
         - the tape (MediaRecorder) is untouched by any of this: it keeps
           running, so nothing is ever lost when live captions give up */
    r.onend = () => {
      if (!want.current || hardStop.current) return;
      const now = Date.now();
      // only a genuinely long clean stretch clears the counter
      if (now - lastRestart.current > 60000) restarts.current = 0;
      totalRestarts.current += 1;
      if (restarts.current >= 8 || totalRestarts.current >= 40) {
        setNotice("Live captions have stopped, but your recording is still running and will be transcribed in full at the end.");
        return;
      }
      // a floor of ~400ms keeps consecutive re-acquisitions from stacking up
      const delay = Math.min(3000, 400 * Math.pow(1.7, restarts.current));
      restarts.current += 1; lastRestart.current = now;
      if (restartTimer.current) clearTimeout(restartTimer.current);
      restartTimer.current = setTimeout(() => {
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

const turtleImages = {
  encouraging: "data:image/png;base64,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",
  excited: "data:image/png;base64,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",
  focused: "data:image/png;base64,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",
  happy: "data:image/png;base64,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",
  logo: "data:image/png;base64,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",
  thinking: "data:image/png;base64,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",
};

const YAP_HEAD = {
  encouraging: "data:image/png;base64,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",
  excited: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAMAAABmmnOVAAAB/lBMVEVrWaUeGmhkXKduW9ElH2ZrWZ1ZVGYeGyOko6icl6UkHmGkja2OaN/a1N6klN5rWKhdH2qvqM2iTWimoLHQzdMqI1/InLMrKaiurfCbZqGOdJyRZ9ljNqBzV8ZaMV+oau7/AP8MCidbMsnDs9JHOZNINJxjXOKFNVN1FOr/ev9nYHfBu8cODDVLN5NVSHTcpPRoDzCHc7BPPHVzXc6opc3Oy846L4taGTNTGzdPMF5TS3eHcJMUbGwA//+GZ8zFvMn//wD//388NIw5MYgAVaoA/wBqahx9gpy/P7+0amq9wvc/fwBPHjh/vz9Vqqqq/6r/AADArbvBu7v//7/c2twAAADr5uz29PZoWMdUR691Z9PPx9SHeOVEN5aUhuytpfbi2uUsJXWkmPQ7Moy4s/iUhq/DucullrTLxfPb1eU1LITY0duzqMXCuPhLPKT///+7s8aQZu6bkvGvpLtdUbmIeayDddmjl8l+fn5lVbeWic/syNd9cdoAAP9/f/+MWvEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC7hz3/AAAAgHRSTlPwEBP331wcFA5en/no0+2eDaL8m6hi/gwEDvOiEaTwBgFU/OKc4Qf9AwJan49m2gUZoVNlZRfUU52Wl1oIAWNkAQJ2nwMBBV8EA/4IwwQDAwE1jARhAP39/f39/f39/f39+/39/f39/f39/Pz9/fwC/Pr9/f37/fwC+/z+/QEC+Mi/XL8AABSMSURBVHjaxZuHf9pYtsclOpjmwR7HJU5sJ9lMeqbXnZntb18vVx0QiCJ6CdXr8q/vOVdXBRA2zmbz7sdxMNjoyzm/U24RR24YlyRymHz7759dkn/u4G568V7gMJ1Mx0ns/wHiai9gPegFDpOD5GG0d/nRIa4eEBKhjz4jYQ0gyGcfHaJHHhzx8B3GExIeIMRHt0SE8IfJZISgR67I54PrwWGUfGyIB+S3A/j4gYczNMoTeAwQ/EeGeEIhtDDZwxCNZgCIJ9mPDHHViybBB0m+R8WZGVzfHeJyNovFYrPZ+wvziAQAYvAWHAOiCF9fg0Ce3gXg3uuerfHXsztDBKwPHICYAFNECKpzLziQ7gAxC9xj+o5F6f9fBWZ3gbjcJ8RKUg+i90EWmehnP8IP8DAMFtlsxBAhvg0jndrZeb4TR3P07mQJPmqlhyuSRVkEyF8gXX1xnQxsGB37MRKNb6eLlU6nY5oNXRfU1DZwxB5uCPHwp6fhZDJMqOX3yMvB9fV98hD++igQ2dQVaIRisTwclovFYqVYqVQ6DUHYiZHer5tBZEkgSX1AjfGAvx+8vg6Th3cIiQdk/225XCgMLQhkABDTFMSdCOltBBEAiGuQYzJLHmQxQYAWvgBvkMurjUj+eI+EC4BAGcplBlEBCKBI7d9MYUP0/riHagSKz8nDCKSsvUyY/LRxur58DQwFjUKULQhKAdoAcYiNOJltIkz4vOEgKAGDgbnh8i6+CGsaMhRsQ7gQgCEKcfIvG0XHa8KHk4hxeHT1Cwhy704MSUVhFC5Ex2KAIQr/TfY3S1bwdQjKSN5NkbTvGCgMwmsIF8IUU5FebKO0vQeZOkDD4uouDPfIgyRATBYgKIMLYQo769PWUu2ArMRnd90GZza7vQxdkUhSo4a4CUIX/4981du0itqp5+qeU4d6saveTc44RAYGseCNBVOkYus6Zp8e80eoYwGrimQDkYhV1a7uXa01RGAgSZKvJLwQprjT620MAVZ4Qkg08sOX2+lzGNvb8WcRbL3936EXDQ5GDkR5CYJyWN91PUx+3Rgi1iOBMAAU2eh02mdYiHzlDYVfk9ASkwVDeCDowNwp5DZ3Byjxt0l4Ryvs6afDt0SM1yv2hAYsqVAI7SaIilXNYv71eAUi+4D8cAgAGsuANAXiP8AIkJUasA8pQpJWvbEIUbGyp/DcX5rcinVJRtMmk4kDQT8dfe+OmYsuvcvsYfRQYRCFZQgHo8KGnops4o4s9NcXEG4XHgjPWzfSUJW9iSPGDOGRxApExRmmHvctp9xSropwQQmD/sIL4b53p/IlZkiPNw4ZhLYEUfSBqAj/czvE5WeEs2KeJmEfiHKnE4+4pWifhYYNUfZA2LJg16c/6tsBv1zhhXjIk4wSZBDKsj/stzdBnzOn8DJDWBBD57fKrIo6ZrCgTDPgV5a4hdwXTnLc3AOhFRa0ySjSAdaWwxQlaTFIFw4ENJkFSOOTSaGMLa+DgBR/FXxF4YGYXfHAIHMMYoHCDRGkOItTXcyu/jUjORDMYkNNCcqy3JVlNE+52HEZwBSNnF+QeuYdT8ihxMHfz30pPLYumib9QEckgs6TgnZwAIQmzSfVab/Wb7erYFTAcBkQYvtmiCPyORpClke2KiZrKTqVP5NeBPopyoAQVmwUFGWqCiIbgloFjImrVGi+U9Fe9gaI11nLEGjHWykqlTDYIhtUJFuX+LKmTHW4tuiO1lgOKkMvBPFpeR2IpyTAGNAf/hSeWK0Uv9zLZmwImi+HwYnpBbBGW5ZdikoHurzIeoi/gG0ZhGsKRqH5UBSLOQ6CQHLzpVIQxFUIsT+SlbJrij/7iMKd/OwfOhAjh+KCUWg+LsFAYBSKxSD4MIiiOZcKLkTuBgjoj5IQWt38kkOs/L2SMeg70nxgQRTKaxlEsTZyKG6GAKXPwRD5fHfJISxSYUyYbSZO11AuaBcKNURZO1/LgLoAh1hzQ3PbW3pWLHFfQoZ8Xl6hUILwgcFK3S6+3u3K0kWBeQQaD1ROuTDR1zOIIidPLPvdCHFJsjbEikOQQs5z3HjrXbv/bmvMcc1mFwyMWciiKAwn6k0MYkuWCptARACCflKPQ1icKoCwVWvpIH68lNBqjzmDYtA6gaJsC8KNFNXuBYPI3QQRzUiWub0OoRSSzL1rCYKuC/YAkD6Xf0zlBmLVpCp9cS2CYJniNk3QboZZYolCGm2pgt5wEdiHVsdGM4ixI8lV9uoNFNVgocgg1kYHreJyfgHCyhbSvN3SGw19EYJeT61yBup0KjSEZYhlIHWuUS3/NbcphIdiJLdVFRD8IOBStXq931h60gcBnuFY2gyTwHpNQNLuOhBdh0KeqgDRWIHwXGblya0t7qC9zNHG+BhOixy/2tY4muA5yQPRZRBytQYQLYRorMFYfkbIhF4dH7/iGqv+GGKxT8ejvXWW+NN9DwRziCRx7/oUwschPhT0xx0S5fcjJy+4RQhdUYbD4fQiOBS2b0pWVogahg0xV+bVNlqCUQiCL8bCT4Kgbu+kWq2d+M6SPyYSQKShmJmN+FLL7UDwdrIyHApF4d4xCNXXFNaFl39Yo820hMuLQWmInU2P96sdT0GZNG0bBqPoyopUfdenEGqrtY5iGYqmMr+M0aYQcwWaTnNpg9GG+A+sol0vRH4uzesuhK2LJS0KwtqoWYhQAUqpBrqcX+CC81Lnb0PskSMLwqWQRuNlCFyqznE18X0gagBRnMgaQojCvnexw7OsHOSswGAU4A2AaDsQQNEQdmL8ycnJjniLT/wSN8TosKzIWqVT7IiNhZxlQ1w+JRlWO2wIaV4FCK8phB2C60iR2yBWMPAZU9KGQ46zIBbrmKfbfmkXMAphMIh2zZVmK0Ii8Vw6JegbQbCCaxGLDeliWB7NC9CGmEIl7Q0Qzl2ZWIAwjJHEVevoDwsCKIQUiaXw+vqtCEIqlVoUMEKUh7KMxdRsFNNRzzqHA8FfRTMeCtClckAh+g5Fo5YDI4A09NvCdCce+/773KLXGtCJFjiAKA9Ns1yLEB8I8oQ8WoSQxggB8WFTqKqOjcVtCQOX9AnZ3T05yXkTGUKc52XcFDEr5ZR34cmF4C95u5hTd0hzhPCagqpT12+hEFOQBHr/9adfIryXQjRxXtCUce7QKJdb/paAGbHXH4Y04ijEginsnHUDhUgT0c8//zwjUeJ6RKwhRCmPUxi9XAFL+ELsk5dOS2EYzZE8tyDaHgg3da6jEHf2entfpkCcLfBKRLApxL5SKIxK+YkGdXSI5cMXIkD4x041N5pQRatbS/6gGDQ+9HXqFJ//wm+zQpbzQkDtKMglWQkGi3oBmu7/9V8uOoIodRoKgOCqzBReioZ59vw5BOoaU4h6mMTtK4s7KVcUE6mg5QFCCXZMrbOwKeaF+EOPf+xAQLLiqDItVTjxsR2HqX00ntOFlj9GPOpe2ZMqdE4pJA0KYZpaOuuXtpkpEqVE0+6tQJhb9UVTtPTnbOM5GleFhm+fk9rxZVMlraCUSiOYQ5jFQXhh9rG4BxbOh16chAxG8figXl+kaDwnvdd0fyFCnqn6mm7LF6ICklASoS508B0T52H+ltgnYYiOUugk0TSoKGDy50BQCn2b9P6ThONxugESb23Q5zi/0FaGhXlV5bogTNDM/polxAeR+xiijALCo0sThQMBGNAR8dvwtjoucpOU3riFAin/Zv3GRClrnCkKo+65CW0JH4n4QYAz5rTVLYWiiWYTYzRvi4KZIkd62S0BM0VL7z+LqfpS/lz2hP43OuhDyBIwmTPFMaeapl47a6RiJOKzhBg+7WKIdoGihB6Rm1aQMop+7QdCcjpNmy3ofVU7ebKcAXUrEIs3PBAWAzVFESBkgIA5G0CoOCnZyfpaQjrt5nEppJTYbUKQgCiqNgVC9N+SsJU1rfai4clYIpZO3JPJrRiCmmKiFLRHHECAIeFzwIviTsTu/DnPFuu2bsLcg1K8CEEhleVjK1M4FM/dZq9FJyNCKrd9lsIRp5tkvVh8FSJFA1QLRg/aLRavmGO+cuoo58bGD8lBR5g8phShRAgcIh+z+FjOmy02hOcBkg3EYASsfboeiYur7mgIaUkL3o9u1Vp21lD1XGRVmE/IF8HT07KYfIyLU83EbqmJQXqertftlFWr9b2FDGdEbuve+2pGliEsU6QaYOELTdn9vupA6Jh8UyuWAEkE5dPTiiA10Rahk12wBUhzOq1vbVni7C9W0xa8zVezGB6pgpFlB/cWIFJoBzDEFOoGFK9xW7VF1FJp0Z8tQhyRI657enpqNpQ8qiKTOig1ZYM7ZxBoik/PPj3zuMSxRPbNmzfwnR5qqjvZXLdjp6EqmiY180HlXGUUIjpECC9DXN4jmeTpabANRTffNThVEA9ChmyM09OtqlXT65/i8LRZrQZCZK3jGVG0w4zQkuIO6EjVxrmkKV1DDkpa26YAU+g5vxDNNDqnQdUEimZzXKuJZ6Fm13hVPYc4pRRblOLszO0t9NSP2Ju8+eabb779t2+/QW8IiwSYUdpz5WLUlHEVruA4BLpmshqiM7KrilOuqjYEcSvE9VWhBbLIlzgKAaG6BWPBFjCwp41+d3x8/BsYx99FoimBXd1CAAZVnUsXSh4ZtIlW6GCCha+zuNtbcd7ToDnoiet1FZLymHuHPguV8s3SgUWxdYAU9SWIVOQNAHxCx2+O33wpMANYBIigngODDDMIa5l8aOILDfWZZ0rMeTdac6oOU/i6qtb678BuYjxRKuVDkLHoGB8cWBTebk/Y+dZm+OSTb58JOhYWC6BlSWcKfYwMM1vcm9PAFkP6dJzc8+0xe2SrDb4Q8BowD8b+JBqCCClxFkT1gFHUap7WV6gf2xDHr1I6Bg1mdfZqTW3LkiQb8ohaYoKL9Oe1Wju3cOSW825Rh6vvIOzwDfoIIYhvX4BD8jbFmFG0+14MvfYJo6jr6tKAy4EWZMi97kK5JJ1Xny2eHPJaYj+WOajT+R5CoIrP5QRQGLZDquMxMDjthdPz1VCugL+M0K+9k4PgC4xOl0GWviO9NRtxEF6pVK1O105b4A7smyaaYoRKRsmhoLFqV3bGAf+sOKgt2KDWb/frsqyMwBmyh0GSH/G9NXtgEcJv6bS0YHT1cXFEr2kFTckDBYrT4fD2OdaAy8HXAgFujAID+EI2uq4zAEF+tHjwwAsR6x1xdSgwuoptgtpGi0zxPIlivEg0Q8cHVa8xKIbHHgsDnm232+/aYw4ZcLnFhqAM0St+7b4oVLAxULToAm4DPk2rjZNXTZHy0HSGQpzrEjYpsjms4QAgQRuSPJenDCgItmdhMaweafEIM8qHuWrbWh+CjK/WJhf0WIsidXeh6aQU4zFD2XIa8dUxnbbr07HFIDfZnoVEV+uRYe+2QxyBTLXO1mZa5/aOZFLqJqABD5W48dihcDmWCabTdLrKlWS8pow7ZvaQUQ8+DIsQOBkIw7vTzqHtnGCYKJIcegFBEno157wYTB71+pQOi2B6fl7lQlCv6PK4yzBay7BkicvADJQBF6n36yOmp4nlkRC0naVE4tWiNVAe06VxziUSsoTnF+TgyHHG3GLY6IjTbJ88O+C46gH3Nd3vsHaJ0RZfn0Algd4TMapuxOKZtDQOvH55muZehXCuZ2+XUFVadui+JE/4zQ57zX4l/PccVyoZuPUyYrvVuB33+yikzxJY4zvA4MYcCPXcMwqF8/NkJoQI8Mvs/MNIdhl+RwL8xifOIG2FmnA1bLdtCropGDoJQUEzmqHE7uefZziOQ90WzqeUYMJlMgnIKJCfPFuqriTzuzzP3+F2mz3Cg+UZhXOwRJK78DHp05Rj9yQSeJaB8Rb+JXYTiQQYQZakhV1dxZbkYx7PDd3lxiOeRKHjpxRd52QJfB6YIFKMEk5VQR/uCIUed63tQ8l7GMaCAFd8zcOc4q53PwUIpWDGGM2ZwI2SO5qGd78s6GQD71GDCytTd39PSOA9bsFClyBFyfBgQP7zQDQRg23Zec9cOAiWKeC1XUIi73UfGDhwN+QqA64yAt/m8dpNlAVd9bUJ3MNAirYwMLaBIcC/581ooGVHn3n7YrJhXd9D4BXCRFseAPE78jT7/nfE7aExmosY+aa9Q7bkA++hE/plWyKzLkVteFseD8pwBGpx5J1H3mNh1iELeuglnabHXhxNBAMPbr07hLv5Zfj7aMIJBlxNai44QsHbg+gnDlpGSJuCWXYYACIMs9x/EILwD12BoiOMUtNztEEZaJ1GxVVAoWDicSIXIshtcr8Qd+tvoDF2SzaGwTIYjVpFGeBFXYpCGTeeGo47LrQw6X0ICOtsfcLOUKyyUUuAD+j5rrIDYYqWJSyISVAJfCgIN1rpMJztfCU4oGcD9DS9asEyhFBkDBeKxm10X+FGEBQjYZWNUtMOWNTEdZnu+1U06zaXBUNcAMT9je6l2xACohWiJGRLw4EYUFGIAt7tU0gXBfaYahIKh/bFjTXjrhB4zCNUckzRtbOEVqB7oCbNDrYhmB0+PATkz1DTrZ9MFMmBVqEOwaNOad01BDupFiGzDwrBk12jtOCPET2krFFtCtBldhxDBO3jcvxGdy9tDgHpwigtm0JKapqlTTNdZoqgbYQFEfzwEDzzhxMfMs2Zg47lkDPLEC6DErwf+Yl8YAiSMGwIRjGiAWI5hJ7vENK2HihEJtr7wBCX5KVHFFbatMK07JxR6GjawFNYw3hj3weF4Mles+kxRdeq5lBANNM+x8Q0CW0/flMCG0Xo3dwR/dpw2ksvBUsWUESuB85cA2yU2SxC7wjxyCh5TOFQDAZFytAYBF0EhNjwjvS7QPyBvMyXVilAGMEBZmydzTOCoxEerZeCYZ+zl/8oxIzsNj0QxsLRTahf9uSbdub4Q5jMPjgEdJxG0510WBhs4iEFg7gOIHvmAMr9TW/Nv1OyIoHHdng03dbfnX2sQFxd/hMgjh67MWo4FG7/3XU8hBCZzQL0rhBZC8KxA/2/6ZxRs09osSwWvuE+1YXxd8VVbmx+BHe1AAAAAElFTkSuQmCC",
  focused: "data:image/png;base64,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",
  happy: "data:image/png;base64,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",
  thinking: "data:image/png;base64,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",
};

/* Moods, chosen so the mascot reacts to what actually happened rather than
   being decoration. Every appearance below is tied to a real state. */
/* YAP mascot is now a turtle! Mapping moods to turtle emotion images. */
const MOOD_MAP = {
  happy: "happy", 
  confident: "confident", 
  thinking: "thinking",
  surprised: "surprised", 
  excited: "excited", 
  focused: "focused",
  encouraging: "encouraging", 
  worried: "worried", 
  proud: "proud", 
  tired: "tired",
  logo: "ready_to_speak_default",
  // legacy names still used across the app
  wave: "happy", 
  cool: "confident", 
  curious: "thinking", 
  confused: "worried",
  gloomy: "tired", 
  panic: "worried", 
  shocked: "surprised",
  annoyed: "focused", 
  teach: "encouraging", 
  inspect: "focused", 
  smug: "proud",
};

function Mascot({ mood = "happy", size = 72, className, style, alt, head }) {
  const m = MOOD_MAP[mood] || "happy";
  // Map mood names to actual turtle emotion file numbers
  const moodToFile = {
    happy: "01_happy",
    confident: "02_confident",
    thinking: "03_thinking",
    surprised: "04_surprised",
    excited: "05_excited",
    focused: "06_focused",
    encouraging: "07_encouraging",
    worried: "08_worried",
    proud: "09_proud",
    tired: "10_tired",
    ready_to_speak_default: "11_ready_to_speak_default"
  };
  
  const fileName = moodToFile[m] || "01_happy";
  const src = `/images/turtle_emotions/${fileName}.png`;
  
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

const RECORDING_SCREEN_CSS = `
/* ---- timing lights ---- */
/* A single pill in two segments: the clock, and — once the speaker passes the
   green mark — an attached light. Before green there is no light at all; a
   colour from second zero would train people to ignore it. */
.rec-timer{display:inline-flex;align-items:stretch;margin-top:12px;border-radius:999px;
  background:rgba(255,255,255,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  box-shadow:0 4px 14px rgba(31,79,91,.10),inset 0 0 0 1px rgba(255,255,255,.6);
  overflow:hidden;transition:box-shadow .4s}
.rec-timer.on{box-shadow:0 6px 20px rgba(var(--lg),.30),inset 0 0 0 1px rgba(255,255,255,.55)}

.rec-clock{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;
  font-family:var(--bod);font-size:13px;color:var(--ocean-deep);
  transition:background .45s,color .45s}
.rec-clock b{font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:.01em}
.rec-clock i{font-style:normal;font-weight:600;opacity:.65}
/* the clock itself tints only faintly — the light segment carries the signal */
.rec-timer.on .rec-clock{background:rgba(var(--lg),.16);color:var(--lc)}

.rec-light{display:inline-flex;align-items:center;gap:7px;padding:8px 15px 8px 12px;
  background:var(--lc);color:#fff;
  font-family:var(--bod);font-weight:800;font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;
  white-space:nowrap;animation:recLightIn .4s cubic-bezier(.2,.9,.3,1) both}
.rec-dot{width:7px;height:7px;border-radius:50%;background:#fff;flex:none;
  box-shadow:0 0 0 3px rgba(255,255,255,.3);animation:recDot 1.6s ease-in-out infinite}
.rec-timer[data-light="red"] .rec-light{animation:recLightIn .4s cubic-bezier(.2,.9,.3,1) both,recRed 1s ease-in-out infinite .4s}

@keyframes recLightIn{from{opacity:0;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes recDot{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes recRed{0%,100%{filter:brightness(1)}50%{filter:brightness(1.22)}}
@media (prefers-reduced-motion:reduce){
  .rec-light,.rec-dot,.rec-timer[data-light="red"] .rec-light{animation:none}
}

@keyframes recBarPulse{0%,100%{opacity:.85}50%{opacity:1}}
@keyframes recDotPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.18);opacity:.7}}
@keyframes recButtonRing{0%{box-shadow:0 0 0 0 rgba(255,255,255,.55)}100%{box-shadow:0 0 0 22px rgba(255,255,255,0)}}
.rec-bar{width:5px;border-radius:99px;background:#FBF8F1;min-height:6px;transition:height .09s linear;box-shadow:0 0 6px rgba(255,255,255,.5)}
.rec-bar.idle{animation:recBarPulse 1.8s ease-in-out infinite}
.rec-dot{animation:recDotPulse 1.3s ease-in-out infinite}
.rec-stopbtn{animation:recButtonRing 2.2s ease-out infinite}
@media (prefers-reduced-motion: reduce){.rec-bar,.rec-dot,.rec-stopbtn{animation:none}}
`;

const ANALYZING_SCREEN_CSS = `
@keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes tickIn{0%{opacity:0;transform:scale(0)}100%{opacity:1;transform:scale(1)}}
.ana-spinner{animation:spinSlow 3s linear infinite}
.ana-check{animation:tickIn .6s cubic-bezier(.2,.9,.3,1) forwards}
.ana-circle{width:20px;height:20px;border:2.5px solid #0A9EC4;border-radius:50%;border-right-color:transparent;animation:spinSlow 1s linear infinite}
@media (prefers-reduced-motion: reduce){.ana-spinner,.ana-circle{animation:none}}
`;

/* Full-screen "on air" recording view — background photo is the whole UI,
   controls float on top. Shared by Table Topics and Debate; Vocabulary's
   inline flip-card recorder is a different, smaller surface. */
function RecordingScreen({ title, elapsed, totalLabel, mic, onStop, onBack, stopLabel = "Finish speech", slot }) {
  const level = mic?.level || [];
  const speaking = !!mic?.speaking;

  /* Toastmasters timing lights. The thresholds already live on the slot; this
     just surfaces them while the speaker is actually talking, which is the
     only moment they are useful. Before green there is no light at all —
     a colour from second zero would train people to ignore it. */
  const lightFor = (t) => {
    if (!slot) return null;
    if (t >= slot.red) return { key: "red", label: "Wrap up now", c: "#E8674A", glow: "232,103,74" };
    if (t >= slot.amber) return { key: "amber", label: "Start closing", c: "#C99A4B", glow: "201,154,75" };
    if (t >= slot.green) return { key: "green", label: "In the zone", c: "#4E9E6A", glow: "78,158,106" };
    return null;
  };
  const light = lightFor(elapsed);
  // Signal to YapApp that we're in recording mode so it can swap the background
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__yapRecording = true;
      return () => { window.__yapRecording = false; };
    }
  }, []);
  return (
    <div className="relative -mx-6 -mt-1 overflow-hidden rounded-card sm:-mx-6" style={{ minHeight: "calc(100svh - 120px)" }}>
      <style>{RECORDING_SCREEN_CSS}</style>

      <div className="relative flex h-full flex-col px-6 pb-8 pt-6" style={{ minHeight: "calc(100svh - 120px)" }}>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/35 text-deep-ocean backdrop-blur-sm transition active:scale-90"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        )}

        <div className="mt-2 text-center">
          <h1 className="m-0 font-[var(--dis)] text-[26px] italic font-semibold text-deep-ocean">{title}</h1>
          {/* one pill: the clock, then the timing light as an attached segment,
              so the two never collide the way two inline siblings did */}
          <div
            className={"rec-timer" + (light ? " on" : "")}
            style={light ? { "--lc": light.c, "--lg": light.glow } : undefined}
            data-light={light ? light.key : "none"}
          >
            <span className="rec-clock">
              <ClockIcon className="h-3.5 w-3.5" />
              <b>{fmt(elapsed)}</b>
              {totalLabel ? <i>of {totalLabel}</i> : null}
            </span>
            {light && (
              <span className="rec-light">
                <span className="rec-dot" />
                {light.label}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <div className="flex h-14 items-end justify-center gap-[3px]" aria-hidden="true">
            {(level.length ? level : new Array(22).fill(0)).map((v, i) => (
              <div
                key={i}
                className={`rec-bar ${speaking ? "" : "idle"}`}
                style={{ height: `${Math.max(10, Math.min(100, v * 100))}%`, animationDelay: speaking ? undefined : `${i * 0.05}s` }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 pb-1">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-[17px] font-bold text-white drop-shadow-[0_2px_6px_rgba(8,60,90,.35)]">
              <span className="rec-dot h-2 w-2 rounded-full bg-coral" />
              Recording…
            </div>
            <p className="m-0 mt-1 text-[13px] text-white/90 drop-shadow-[0_1px_4px_rgba(8,60,90,.3)]">Speak clearly and naturally</p>
          </div>

          <button
            onClick={onStop}
            aria-label={stopLabel}
            className="rec-stopbtn grid h-20 w-20 place-items-center rounded-full bg-white shadow-[0_14px_30px_rgba(8,60,90,.3)] transition active:scale-90"
          >
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-deep-ocean">
              <span className="h-3.5 w-3.5 rounded-[3px] bg-white" />
            </span>
          </button>
          <div className="text-[13px] font-bold text-deep-ocean">Tap to stop</div>
        </div>
      </div>
    </div>
  );
}

/* Loading screen shown while speech is being analyzed after stop is clicked.
   Shows animated checkmarks ticking one by one as each analysis step completes. */
function AnalyzingScreen() {
  const [steps, setSteps] = useState([
    { label: "Transcribing", done: false, id: 0 },
    { label: "Analyzing delivery", done: false, id: 1 },
    { label: "Analyzing content", done: false, id: 2 },
    { label: "Finalizing results", done: false, id: 3 },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__yapRecording = true;
      return () => { window.__yapRecording = false; };
    }
  }, []);

  useEffect(() => {
    // Tick off steps one by one with delays
    const delays = [900, 2100, 3300, 4500];
    const timers = delays.map((delay, i) =>
      setTimeout(() => setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, done: true } : s)), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative -mx-6 -mt-1 overflow-hidden rounded-card sm:-mx-6" style={{ minHeight: "calc(100svh - 120px)" }}>
      <style>{ANALYZING_SCREEN_CSS}</style>

      <div className="relative flex h-full flex-col items-center justify-center px-6 pb-8 pt-6" style={{ minHeight: "calc(100svh - 120px)" }}>
        <div className="mb-8 text-center">
          <h1 className="m-0 font-[var(--dis)] text-[24px] italic font-semibold text-deep-ocean">Analyzing your speech...</h1>
          <p className="mt-2 text-[14px] text-deep-ocean/70">This may take a few seconds.</p>
        </div>

        <div className="mb-12 flex items-center justify-center">
          <div className="ana-spinner relative h-32 w-32">
            <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(10,158,196,.15)" strokeWidth="2" />
              <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(10,158,196,.2)" strokeWidth="2" />
              <circle cx="60" cy="60" r="30" fill="none" stroke="rgba(10,158,196,.25)" strokeWidth="2" />
              <circle cx="60" cy="60" r="15" fill="#F6C76A" />
            </svg>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-2 rounded-2xl border border-white/50 bg-white/70 p-6 shadow-[0_16px_40px_rgba(10,158,196,.1)] backdrop-blur-xl">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {step.done ? (
                  <div className="ana-check h-5 w-5 text-palm-green" style={{ animationDelay: `${0.6 + i * 0.8}s` }}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="ana-circle" />
                )}
              </div>
              <span className={`text-[14px] font-semibold ${step.done ? "text-ink" : "text-ink/60"}`}>{step.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="m-0 text-[14px] leading-relaxed text-deep-ocean/80">
            <span className="block font-semibold">Good things take time.</span>
            <span className="block">Great speeches take practice.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const DECK_CSS = `
.deck{ position:relative; }
.deck-stack{ position:relative; width:100%; animation: deckRise .7s cubic-bezier(.22,1,.36,1) both; }
.deck-card{ width:100%; will-change:transform; touch-action: pan-y; }
.deck-card:not(.deck-card-top){ position:absolute; top:0; left:0; right:0; bottom:0; overflow:hidden; border-radius:32px; }
.deck-card:not(.deck-card-top) > .card{ height:100%; margin-bottom:0; overflow:hidden; }
.deck-card-top{ position:relative; cursor:grab; }
.deck-scrim{ position:absolute; inset:0; border-radius:32px; background:rgba(248,242,231,.72); backdrop-filter:blur(1px); pointer-events:none; }
.deck-card-top:active{ cursor:grabbing; }
.deck-nav{ display:flex; justify-content:center; align-items:center; gap:14px; margin:14px 0 4px; position:relative; z-index:2; }
.deck-arrow{ width:44px; height:44px; border-radius:50%; border:1px solid var(--line); background:#FFFDF8; color:var(--ink);
  display:grid; place-items:center; cursor:pointer; box-shadow:0 6px 16px rgba(31,79,91,.12); transition:transform .18s, opacity .18s; }
.deck-arrow:hover:not(:disabled){ transform:translateY(-2px); }
.deck-arrow:active:not(:disabled){ transform:scale(.92); }
.deck-arrow:disabled{ opacity:.32; cursor:default; }
.deck-arrow:focus-visible{ outline:3px solid var(--ocean); outline-offset:2px; }
.deck-count{ font-weight:800; font-size:13px; color:var(--ink3); font-variant-numeric:tabular-nums; min-width:52px; text-align:center; }
.deck-dots{ display:flex; justify-content:center; align-items:center; gap:8px; margin:4px 0 20px; position:relative; z-index:1; }
.deck-dot{ width:18px; height:18px; object-fit:contain; cursor:pointer; transition:transform .2s; border:none; background:none; padding:0; }
.deck-dot:hover{ transform:scale(1.15); }
.deck-dot[data-on="1"]{ transform:scale(1.2); }
.deck-dot[data-state="current"] img{ filter:drop-shadow(0 0 7px rgba(10,158,196,.85)) saturate(1.4); }
.deck-dot[data-state="done"] img{ filter:drop-shadow(0 0 3px rgba(246,199,106,.65)); }
.card.pcard{ background:#FFFDF8; border:1px solid rgba(255,255,255,.5); border-radius:32px;
  box-shadow:0 24px 50px rgba(31,79,91,.16), inset 0 1px 0 rgba(255,255,255,.7); backdrop-filter:none; -webkit-backdrop-filter:none;
  overflow:hidden; padding-bottom:34px; }
/* ocean light spilling over the top edge of the postcard */
.pcard::before{ content:""; position:absolute; top:0; left:0; right:0; height:76px; pointer-events:none;
  background:linear-gradient(180deg, rgba(126,200,227,.26), rgba(126,200,227,.06) 60%, rgba(126,200,227,0)); }
/* a wavy shoreline along the bottom edge of every postcard */
.pcard::after{ content:""; position:absolute; bottom:0; left:0; right:0; height:26px; pointer-events:none;
  background-repeat:repeat-x; background-position:bottom center; background-size:200px 26px;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 26' preserveAspectRatio='none'><path d='M0,13 C25,3 50,20 75,13 C100,6 125,20 150,13 C175,6 200,16 200,13 L200,26 L0,26 Z' fill='rgba(126,200,227,0.30)'/><path d='M0,18 C28,10 52,23 78,17 C104,11 128,24 154,17 C180,10 200,20 200,18 L200,26 L0,26 Z' fill='rgba(111,215,240,0.42)'/></svg>"); }
.deck-intro-caption{ position:absolute; left:50%; top:8px; transform:translateX(-50%); display:flex; align-items:center; gap:8px;
  background:rgba(255,253,248,.92); border:1px solid rgba(255,255,255,.6); border-radius:999px; padding:6px 14px 6px 6px;
  box-shadow:0 10px 24px rgba(31,79,91,.14); z-index:20; font-weight:700; font-size:13px; color:var(--ink);
  animation: introCaptionIn .5s .15s cubic-bezier(.2,1,.35,1) both, introCaptionOut .4s 1.4s ease-in forwards; pointer-events:none; }
@keyframes introCaptionIn{ from{ opacity:0; transform:translate(-50%,-8px) scale(.9); } to{ opacity:1; transform:translate(-50%,0) scale(1); } }
@keyframes introCaptionOut{ to{ opacity:0; transform:translate(-50%,-6px) scale(.96); } }
@keyframes deckRise{ 0%{ opacity:0; transform:translateY(52px) scale(.94); filter:blur(6px); } 100%{ opacity:1; transform:translateY(0) scale(1); filter:blur(0); } }
@keyframes shellSparklePop{ 0%{ opacity:0; transform:scale(.4) translateY(0) rotate(0deg); } 30%{ opacity:1; transform:scale(1.15) translateY(-8px) rotate(8deg); } 100%{ opacity:0; transform:scale(.75) translateY(-26px) rotate(16deg); } }
.shell-sparkle{ position:absolute; pointer-events:none; font-size:16px; z-index:15; animation:shellSparklePop .55s ease-out both; }
@media (prefers-reduced-motion: reduce){
  .deck-stack{ animation:none; }
  .deck-intro-caption{ animation:none; }
  .shell-sparkle{ animation:none; display:none; }
  .deck-dot[data-state] img{ filter:none; }
}
`;

/* Stacked, swipeable card deck. Reveals the next two cards peeking behind
   the active one; drag/swipe horizontally to advance, tap a shell to jump. */
function CardDeck({ cards, introCaption, onIndex }) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [sparkles, setSparkles] = useState([]);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const axisRef = useRef(null);
  const pointerIdRef = useRef(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    try { reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* default */ }
  }, []);

  useEffect(() => { setIndex(0); }, [cards.length]);

  const onIndexRef = useRef(onIndex); onIndexRef.current = onIndex;
  useEffect(() => { if (onIndexRef.current) onIndexRef.current(index); }, [index]);

  const popSparkle = () => {
    if (reducedRef.current) return;
    const id = Date.now() + Math.random();
    setSparkles((s) => [...s, { id, left: 46 + Math.random() * 14, top: 30 + Math.random() * 18 }]);
    setTimeout(() => setSparkles((s) => s.filter((x) => x.id !== id)), 600);
  };

  const onPointerDown = (e) => {
    if (e.target.closest && e.target.closest("button, a, input, textarea, select, audio")) return;
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    axisRef.current = null;              // undecided until the gesture commits
    // capture is deferred until we know this is a horizontal swipe, otherwise
    // it swallows the vertical scroll the user actually wanted
    pointerIdRef.current = e.pointerId;
  };
  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    /* Decide the axis once, on the first meaningful movement: a mostly-vertical
       gesture is a scroll and must be left alone, not turned into a card swipe. */
    if (axisRef.current === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;    // too small to tell yet
      axisRef.current = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y";
      if (axisRef.current === "y") { draggingRef.current = false; return; }
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* not critical */ }
    }
    if (axisRef.current !== "x") return;
    setDragX(dx);
  };
  /* Release always lands back at dragX 0 in the same tick the index moves, so
     the card can never be left parked offscreen by a dropped pointer event. */
  const endDrag = (e) => {
    if (!draggingRef.current) { setDragX(0); axisRef.current = null; return; }
    draggingRef.current = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) { /* not critical */ }
    const wasX = axisRef.current === "x";
    axisRef.current = null;
    if (!wasX) { setDragX(0); return; }        // a scroll, not a swipe
    const dx = e.clientX - startXRef.current;
    const THRESH = 70;
    if (dx <= -THRESH && index < cards.length - 1) {
      setIndex(index + 1);
      popSparkle();
    } else if (dx >= THRESH && index > 0) {
      setIndex(index - 1);
      popSparkle();
    }
    setDragX(0);
  };

  if (!cards.length) return null;

  return (
    <div className="deck">
      <style>{DECK_CSS}</style>
      {introCaption && (
        <div className="deck-intro-caption">
          <Mascot mood="happy" size={30} />
          <span>{introCaption}</span>
        </div>
      )}
      <div className="deck-stack">
        {cards.map((card, i) => {
          const offset = i - index;
          if (offset < 0 || offset > 2) return null;
          const isTop = offset === 0;
          const drag = isTop ? dragX : 0;
          const dragging = isTop && draggingRef.current;
          const translateY = offset === 1 ? 12 : offset === 2 ? 24 : 0;
          const scale = isTop ? 1 : 1 - offset * 0.04;
          return (
            <div
              key={i}
              className={"deck-card" + (isTop ? " deck-card-top" : "")}
              style={{
                transform: `translate(${drag}px, ${translateY}px) scale(${scale})`,
                zIndex: 10 - offset,
                opacity: isTop ? 1 : 1 - offset * 0.1,
                transition: dragging || reducedRef.current ? "none" : "transform .32s cubic-bezier(.22,1,.36,1), opacity .3s",
                pointerEvents: isTop ? "auto" : "none",
                // let the browser own vertical scrolling; we only claim pan-x
                touchAction: "pan-y",
              }}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? endDrag : undefined}
              onPointerCancel={isTop ? endDrag : undefined}
            >
              {card}
              {!isTop && <div className="deck-scrim" />}
              {isTop && sparkles.map((s) => (
                <span key={s.id} className="shell-sparkle" style={{ left: `${s.left}%`, top: `${s.top}%` }}>✨</span>
              ))}
            </div>
          );
        })}
      </div>
      <div className="deck-nav">
        <button
          type="button"
          className="deck-arrow"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Previous card"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span className="deck-count">{index + 1} / {cards.length}</span>
        <button
          type="button"
          className="deck-arrow"
          onClick={() => setIndex((i) => Math.min(cards.length - 1, i + 1))}
          disabled={index === cards.length - 1}
          aria-label="Next card"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div className="deck-dots" role="tablist" aria-label="Report sections">
        {cards.map((_, i) => {
          const state = i < index ? "done" : i === index ? "current" : "future";
          return (
            <button
              key={i}
              type="button"
              className="deck-dot"
              data-on={i === index ? "1" : "0"}
              data-state={state}
              role="tab"
              aria-selected={i === index}
              aria-label={`Card ${i + 1} of ${cards.length}`}
              onClick={() => setIndex(i)}
            >
              <img
                src={state === "done" ? "/images/home/shell-done.png" : state === "current" ? "/images/home/shell-today.png" : "/images/home/shell-future.png"}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Lightweight, always-on beach scene behind the report deck: waves, foam,
   drifting clouds, a distant island, birds and swaying palms — pure CSS,
   fixed behind the .wrap content (z-index:0), so it never intercepts taps. */
const BEACH_CSS = `
.beach-ambient{ position:fixed; inset:0; z-index:0; overflow:hidden; pointer-events:none; }
.ba-sun{ position:absolute; top:6%; right:9%; width:120px; height:120px; border-radius:50%;
  background:radial-gradient(circle, rgba(246,199,106,.5), rgba(246,199,106,0) 70%); animation:baGlow 6s ease-in-out infinite; }
/* Pill clouds: a rounded body with two puff blobs, drifting across at
   different depths. Pure transforms so they stay GPU-cheap. */
.ba-cloud{ position:absolute; background:rgba(255,255,255,.62); border-radius:999px; filter:blur(.4px);
  box-shadow:0 6px 18px rgba(31,79,91,.06); }
.ba-cloud::before, .ba-cloud::after{ content:""; position:absolute; background:inherit; border-radius:50%; }
.ba-cloud::before{ width:58%; height:170%; left:12%; top:-78%; }
.ba-cloud::after{ width:42%; height:130%; right:14%; top:-46%; }
.ba-cloud1{ top:8%;  left:-20%; width:132px; height:30px; opacity:.9;  animation:baFloat 58s linear infinite, baBobble 7s ease-in-out infinite; }
.ba-cloud2{ top:16%; left:-40%; width:92px;  height:22px; opacity:.65; animation:baFloat 84s linear infinite 6s, baBobble 9s ease-in-out infinite; }
.ba-cloud3{ top:23%; left:-30%; width:64px;  height:17px; opacity:.45; animation:baFloat 108s linear infinite 18s, baBobble 11s ease-in-out infinite; }
.ba-island{ position:absolute; bottom:17%; left:72%; width:90px; height:18px; border-radius:50%; background:rgba(90,174,90,.24); }
.ba-bird{ position:absolute; color:rgba(31,79,91,.32); font-size:11px; animation:baBird 16s linear infinite; }
.ba-bird1{ top:19%; left:18%; animation-delay:0s; }
.ba-bird2{ top:25%; left:33%; animation-delay:5s; }
@keyframes baGlow{ 0%,100%{ opacity:.7; } 50%{ opacity:1; } }
@keyframes baFloat{ 0%{ transform:translateX(0); } 100%{ transform:translateX(180vw); } }
@keyframes baBobble{ 0%,100%{ margin-top:0; } 50%{ margin-top:6px; } }
@keyframes baBird{ 0%{ transform:translate(0,0); } 100%{ transform:translate(40vw,-10px); } }
@media (prefers-reduced-motion: reduce){
  .ba-sun,.ba-cloud,.ba-bird{ animation:none; }
  .ba-cloud1{ left:8%; } .ba-cloud2{ left:52%; } .ba-cloud3{ left:30%; }
}
`;

function BeachAmbient() {
  return (
    <div className="beach-ambient" aria-hidden="true">
      <style>{BEACH_CSS}</style>
      <div className="ba-sun" />
      <div className="ba-cloud ba-cloud1" />
      <div className="ba-cloud ba-cloud2" />
      <div className="ba-cloud ba-cloud3" />
      <div className="ba-island" />
      <span className="ba-bird ba-bird1">〜</span>
      <span className="ba-bird ba-bird2">〜</span>
    </div>
  );
}

/* The score reveal: one big number in a filling ring, the six measured
   sub-scores as pills, and a gate into the card deck. Every value comes from
   the same `r` object the deck cards read — nothing here is recomputed. */
const REVEAL_CSS = `
/* The reveal is two stacked cards: a gradient hero carrying the one number,
   and a plain white list carrying the six measures. Keeping them separate
   stops the sub-scores competing with the headline figure. */
.rv{ position:relative; z-index:1; margin-bottom:24px;
  animation:cardin .5s cubic-bezier(.2,.9,.3,1) both; }

/* ---- hero ---- */
.rv-hero{ position:relative; overflow:hidden; border-radius:28px; padding:26px 24px 30px; text-align:center;
  background:linear-gradient(168deg,#4E9BB8 0%,#5FAECB 42%,#8FCFE0 100%);
  box-shadow:0 20px 46px rgba(31,79,91,.20);
  animation:rvRise .7s cubic-bezier(.22,1,.36,1) both; }
.rv-eye{ font-family:var(--bod); font-weight:800; font-size:11.5px; letter-spacing:.2em; text-transform:uppercase;
  color:rgba(255,255,255,.82); }
.rv-big{ display:flex; align-items:baseline; justify-content:center; gap:6px; margin-top:10px; }
.rv-big b{ font-family:var(--dis); font-weight:800; font-size:clamp(62px,17vw,86px); line-height:.95;
  letter-spacing:-.04em; color:#fff; font-variant-numeric:tabular-nums;
  text-shadow:0 6px 22px rgba(16,64,80,.30); }
.rv-big i{ font-style:normal; font-family:var(--bod); font-weight:700; font-size:19px; color:rgba(255,255,255,.85); }
.rv-meter{ height:9px; border-radius:999px; background:rgba(255,255,255,.28); overflow:hidden; margin:18px 4px 0; }
.rv-meter span{ display:block; height:100%; border-radius:999px;
  transition:width 1.4s cubic-bezier(.2,.8,.3,1) .25s; box-shadow:0 0 12px rgba(255,255,255,.45); }
.rv-verdict{ margin-top:20px; font-family:var(--dis); font-weight:700; font-size:20px; color:#fff;
  animation:rvFade .5s .9s ease both; }
.rv-vline{ margin:8px auto 0; max-width:30ch; font-size:14.5px; line-height:1.6; color:rgba(255,255,255,.88);
  animation:rvFade .5s 1.05s ease both; }
/* a soft shoreline so the card sits in the scene rather than on top of it */
.rv-shore{ position:absolute; left:0; right:0; bottom:0; height:34px;
  background:linear-gradient(180deg,rgba(255,255,255,0),rgba(248,242,231,.85)); }

/* ---- measures ---- */
.rv-list{ margin-top:14px; padding:6px 18px; border-radius:24px; background:#fff;
  border:1px solid var(--line); box-shadow:0 14px 34px rgba(31,79,91,.10); }
.rv-row{ display:flex; align-items:center; gap:13px; padding:15px 0;
  animation:rvFade .45s cubic-bezier(.2,.9,.3,1) both; }
.rv-row + .rv-row{ border-top:1px solid var(--line); }
.rv-ico{ flex:none; width:34px; height:34px; border-radius:50%; display:grid; place-items:center;
  border:1.5px solid currentColor; background:rgba(255,255,255,.6); }
.rv-ico svg{ width:17px; height:17px; }
.rv-rowbody{ flex:1; min-width:0; }
.rv-rowtop{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:7px; }
.rv-name{ font-family:var(--bod); font-weight:800; font-size:15px; color:var(--ink); }
.rv-val b{ font-family:var(--dis); font-weight:800; font-size:17px; color:var(--ink);
  font-variant-numeric:tabular-nums; }
.rv-val i{ font-style:normal; font-size:11.5px; font-weight:700; color:var(--ink3); margin-left:2px; }
.rv-bar{ height:7px; border-radius:999px; background:rgba(31,79,91,.10); overflow:hidden; }
.rv-bar span{ display:block; height:100%; border-radius:999px;
  transition:width 1.1s cubic-bezier(.2,.8,.3,1); }

.rv-line{ font-size:14px; line-height:1.6; color:var(--ink2); text-align:center; margin:16px auto 0;
  animation:rvFade .5s 1.25s ease both; }
.rv-cta{ margin-top:20px; text-align:center; animation:rvFade .5s 1.5s ease both; }
.rv-cta .btn{ font-size:16px; padding:15px 30px; }
.rv-hint{ font-size:12.5px; color:var(--ink3); margin-top:12px; }
@keyframes rvRise{ from{ opacity:0; transform:translateY(24px) scale(.94); } }
@keyframes rvFade{ from{ opacity:0; transform:translateY(8px); } }
@media (prefers-reduced-motion: reduce){
  .rv,.rv-hero,.rv-row,.rv-verdict,.rv-vline,.rv-line,.rv-cta{ animation:none; }
  .rv-meter span,.rv-bar span{ transition:none; }
}
`;

/* Verdict wording is chosen from the measured overall score only — it labels
   the number, it does not invent any new assessment. */
const bandForScore = (n) =>
  n >= 82 ? { label: "Excellent", tone: "#7BAE8F" }
  : n >= 65 ? { label: "Strong", tone: "#5AAE5A" }
  : n >= 48 ? { label: "Getting there", tone: "#C99A4B" }
  : n >= 30 ? { label: "Needs work", tone: "#E89A4A" }
  : { label: "Early days", tone: "#E8674A" };

/* The headline and the sentence under it. Deliberately plain-spoken: a low
   score has to read as a starting point, never as a verdict. */
const verdictForScore = (n) =>
  n >= 82 ? { head: "Sharp. Really sharp.",
              line: "That held together start to finish. Keep the bar exactly here." }
  : n >= 65 ? { head: "Strong. Nearly there.",
                line: "The shape is right. Tighten one thing and this moves up a band." }
  : n >= 48 ? { head: "Rough. Good.",
                line: "Rough is where everyone starts. Good news: only one way up. Go again." }
  : n >= 30 ? { head: "Loose, but honest.",
                line: "The ideas are in there. They need an order a listener can follow." }
  : { head: "Early days.",
      line: "Everyone sounds like this at first. The next one is already easier." };

function ScoreReveal({ r, onOpen, deckCount }) {
  const [go, setGo] = useState(false);
  const n = useCountUp(r.overall, 1400, go);
  useEffect(() => { const t = setTimeout(() => setGo(true), 220); return () => clearTimeout(t); }, []);

  const band = bandForScore(r.overall);
  const verdict = verdictForScore(r.overall);
  const parts = [
    ["Structure", r.structure], ["Flow", r.fluency], ["Pace", r.pace],
    ["Range", r.range], ["Grammar", r.accuracy], ["Clarity", r.clarity100],
  ];

  return (
    <div className="rv">
      <style>{REVEAL_CSS}</style>

      {/* hero: the one number, on its own ground */}
      <div className="rv-hero">
        <div className="rv-eye">Deep score</div>
        <div className="rv-big">
          <b>{n}</b><i>/100</i>
        </div>
        <div className="rv-meter">
          <span style={{ width: go ? `${Math.max(2, r.overall)}%` : "0%", background: band.tone }} />
        </div>
        <div className="rv-verdict">{verdict.head}</div>
        <p className="rv-vline">{verdict.line}</p>
        <div className="rv-shore" aria-hidden="true" />
      </div>

      {/* the six measures, as a readable list rather than scattered pills */}
      <div className="rv-list">
        {parts.map(([label, v], i) => {
          const t = bandForScore(v).tone;
          return (
            <div className="rv-row" key={label} style={{ animationDelay: `${0.5 + i * 0.07}s` }}>
              <span className="rv-ico" style={{ color: t, borderColor: t }}>
                <ScoreGlyph name={label} />
              </span>
              <div className="rv-rowbody">
                <div className="rv-rowtop">
                  <span className="rv-name">{label}</span>
                  <span className="rv-val"><b>{v}</b><i>/100</i></span>
                </div>
                <div className="rv-bar">
                  <span style={{ width: go ? `${Math.max(2, v)}%` : "0%", background: t,
                    transitionDelay: `${0.55 + i * 0.07}s` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="rv-line">{r.wpm} words a minute · {r.fillerCount} filler{r.fillerCount === 1 ? "" : "s"} · {r.variety}% word variety</p>

      <div className="rv-cta">
        <button className="btn go" onClick={onOpen}>See the full breakdown →</button>
        <div className="rv-hint">{deckCount} cards from the Timer, Ah-Counter, Grammarian and Evaluator</div>
      </div>
    </div>
  );
}

/* One glyph per measure. Line art rather than emoji, so the list stays quiet. */
function ScoreGlyph({ name }) {
  const p = {
    Structure: <><rect x="4" y="4" width="16" height="5" rx="1.5" /><rect x="4" y="12" width="16" height="8" rx="1.5" /></>,
    Flow: <path d="M3 15c3-6 6 6 9 0s6-6 9 0" />,
    Pace: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" /></>,
    Range: <><path d="M4 18V9M9 18V5M14 18v-7M19 18v-4" /></>,
    Grammar: <><path d="M5 19l5.5-14h3L19 19" /><path d="M8 14h8" /></>,
    Clarity: <><circle cx="12" cy="10" r="4.5" /><path d="M10 18.5h4M10.5 21h3" /></>,
  }[name] || <circle cx="12" cy="12" r="7" />;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p}</svg>
  );
}

/* Word of the day, checked against what was actually said. On a miss it shows
   the word's own example sentence — the point is to make the word usable next
   time, not to mark the speaker down for missing it. */
function WotdCard({ wotd, used }) {
  return (
    <div className={"card pcard " + (used ? "moss" : "sun")} key="wotd">
      <style>{WOTD_CSS}</style>
      <CornerDecor emoji={used ? "🏆" : "📖"} />
      <SpeechBubbleHeader
        label="Word of the day"
        sub={used ? "You used it" : "Not used this time"}
      />
      <div className="wotd-word">
        <b>{wotd.w}</b>
        <span>{wotd.p}</span>
      </div>
      <p className="wotd-def">{wotd.d}</p>

      {used ? (
        <p className="wotd-note ok">
          You worked <b>{wotd.w.toLowerCase()}</b> into your answer — that is exactly how a word
          moves from something you recognise to something you own.
        </p>
      ) : (
        <>
          <div className="eye" style={{ marginTop: 14 }}>How you could have used it</div>
          <p className="wotd-eg">&ldquo;{wotd.e}&rdquo;</p>
          <p className="wotd-note">
            No score is affected by this. Try dropping it into your next answer while it is fresh.
          </p>
        </>
      )}
    </div>
  );
}

const WOTD_CSS = `
.wotd-word{display:flex;align-items:baseline;gap:9px;margin-top:4px}
.wotd-word b{font-family:var(--dis);font-weight:800;font-size:26px;letter-spacing:-.01em;color:var(--ink)}
.wotd-word span{font-family:var(--bod);font-weight:700;font-size:11px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--ink3)}
.wotd-def{font-size:15px;line-height:1.6;color:var(--ink2);margin:6px 0 0}
.wotd-eg{font-family:var(--dis);font-weight:600;font-size:17px;line-height:1.55;color:var(--ink);
  margin:8px 0 0;padding-left:14px;border-left:3px solid var(--ocean)}
.wotd-note{font-size:13.5px;line-height:1.6;color:var(--ink3);margin:12px 0 0}
.wotd-note.ok{color:var(--ink2)}
.wotd-note b{color:var(--ink);font-weight:700}
`;

/* ==========================================================================
   REPORT VISUALS
   A shared kit so every card in the deck is built from the same parts: a
   headline stat strip, a "fix this one thing" banner, and small charts that
   put the measured numbers on screen instead of describing them in prose.
   ========================================================================== */

const RPT_CSS = `
/* the single most useful line on any card: what to change next time */
.fixit{display:flex;gap:12px;align-items:flex-start;margin-top:16px;padding:14px 15px;border-radius:18px;
  background:linear-gradient(140deg,rgba(242,193,78,.20),rgba(242,193,78,.07));
  border:1px solid rgba(242,193,78,.55)}
.fixit-ico{flex:none;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;
  background:#F2C14E;color:#5B4212;font-weight:900;font-size:14px}
.fixit b{display:block;font-family:var(--bod);font-weight:800;font-size:10.5px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink3);margin-bottom:4px}
.fixit p{margin:0;font-size:14.5px;line-height:1.6;color:var(--ink)}

/* headline numbers, read before any sentence is */
.statstrip{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:2px;margin:2px 0 14px;
  border-radius:16px;overflow:hidden;background:rgba(31,79,91,.07)}
.statstrip > div{background:rgba(255,255,255,.72);padding:12px 8px;text-align:center}
.statstrip b{display:block;font-family:var(--dis);font-weight:800;font-size:23px;line-height:1;
  color:var(--ink);font-variant-numeric:tabular-nums}
.statstrip b.ok{color:#4E9E6A} .statstrip b.warn{color:#C99A4B} .statstrip b.bad{color:#E8674A}
.statstrip span{display:block;margin-top:5px;font-size:9.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--ink3)}

/* where the speech actually sat against green / amber / red */
.tl{position:relative;height:38px;margin:6px 0 4px}
.tl-track{position:absolute;inset:14px 0 auto;height:10px;border-radius:999px;overflow:hidden;display:flex}
.tl-track i{height:100%}
.tl-you{position:absolute;top:6px;width:3px;height:26px;border-radius:2px;background:var(--ink);
  box-shadow:0 0 0 3px rgba(255,255,255,.9)}
.tl-you::after{content:attr(data-at);position:absolute;top:-16px;left:50%;transform:translateX(-50%);
  font-family:var(--bod);font-weight:800;font-size:10.5px;color:var(--ink);white-space:nowrap}
.tl-keys{display:flex;justify-content:space-between;margin-top:2px;font-size:9.5px;font-weight:700;
  letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}

/* a word tally that shows relative weight, not just counts */
.wbars{margin-top:10px}
.wbar{display:flex;align-items:center;gap:10px;margin-bottom:7px}
.wbar span:first-child{flex:0 0 96px;font-size:13px;font-weight:700;color:var(--ink);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wbar-t{flex:1;height:8px;border-radius:999px;background:rgba(31,79,91,.09);overflow:hidden}
.wbar-t i{display:block;height:100%;border-radius:999px;background:var(--wb,#E8674A)}
.wbar b{flex:none;font-size:12.5px;font-variant-numeric:tabular-nums;color:var(--ink2);min-width:22px;text-align:right}
`;

/* The one change worth making next time. Every card can end with this, so the
   speaker always leaves with an instruction rather than a description. */
function FixIt({ children, label = "Fix this next" }) {
  if (!children) return null;
  return (
    <div className="fixit">
      <span className="fixit-ico">→</span>
      <div><b>{label}</b><p>{children}</p></div>
    </div>
  );
}

function StatStrip({ items }) {
  return (
    <div className="statstrip">
      {items.map(([value, label, tone]) => (
        <div key={label}>
          <b className={tone || ""}>{value}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* Green / amber / red as an actual bar, with a marker where the speech ended.
   A speaker can see "I stopped just before green" in one glance. */
function TimeLine({ seconds, slot }) {
  const max = Math.max(slot.red * 1.15, seconds * 1.05);
  const pct = (v) => `${Math.min(100, (v / max) * 100)}%`;
  return (
    <div>
      <div className="tl">
        <div className="tl-track">
          <i style={{ width: pct(slot.green), background: "rgba(31,79,91,.14)" }} />
          <i style={{ width: `calc(${pct(slot.amber)} - ${pct(slot.green)})`, background: "#7BAE8F" }} />
          <i style={{ width: `calc(${pct(slot.red)} - ${pct(slot.amber)})`, background: "#E3C15F" }} />
          <i style={{ flex: 1, background: "#E8674A" }} />
        </div>
        <span className="tl-you" style={{ left: pct(seconds) }} data-at={fmt(seconds)} />
      </div>
      <div className="tl-keys">
        <span>start</span><span>green {fmt(slot.green)}</span>
        <span>amber {fmt(slot.amber)}</span><span>red {fmt(slot.red)}</span>
      </div>
    </div>
  );
}

/* Relative weight beats a bare count: five "basically"s next to one "like"
   tells you which habit to actually go after. */
function WordBars({ items, tone = "#E8674A", max: capped = 5 }) {
  if (!items || !items.length) return null;
  const top = items.slice(0, capped);
  const peak = Math.max(...top.map((x) => x[1] || x.n || 0), 1);
  return (
    <div className="wbars">
      {top.map((x) => {
        const word = x[0] !== undefined ? x[0] : x.word;
        const n = x[1] !== undefined ? x[1] : x.n;
        return (
          <div className="wbar" key={word}>
            <span>{word}</span>
            <span className="wbar-t"><i style={{ width: `${(n / peak) * 100}%`, "--wb": tone }} /></span>
            <b>×{n}</b>
          </div>
        );
      })}
    </div>
  );
}

/* Small postcard-corner decorations for report cards. Presentation only —
   none of these read or alter the analysis data. */
const DECOR_CSS = `
.decor-corner{ position:absolute; top:14px; right:16px; font-size:20px; pointer-events:none; animation:decorBob 3.4s ease-in-out infinite; z-index:1; }
@keyframes decorBob{ 0%,100%{ transform:translateY(0) rotate(-3deg); } 50%{ transform:translateY(-4px) rotate(3deg); } }
.lighthouse{ position:absolute; top:12px; right:16px; width:60px; height:44px; pointer-events:none; z-index:1; }
.lighthouse .lh-tower{ position:absolute; bottom:0; right:0; width:12px; height:32px; background:linear-gradient(180deg,#fff,#EEDBB8); border-radius:3px 3px 0 0; border:1px solid rgba(31,79,91,.15); }
.lighthouse .lh-cap{ position:absolute; top:0; right:0; width:12px; height:7px; background:#E8674A; border-radius:2px 2px 6px 6px; }
.lighthouse .lh-beam{ position:absolute; top:5px; right:11px; width:52px; height:3px; background:linear-gradient(90deg,rgba(246,199,106,.85),transparent); transform-origin:right center; animation:beamSweep 3.2s ease-in-out infinite; }
@keyframes beamSweep{ 0%,100%{ transform:rotate(18deg); } 50%{ transform:rotate(-18deg); } }
.pearl-wrap{ position:relative; display:flex; align-items:center; gap:10px; margin-bottom:14px; }
.pearl-wrap img{ width:40px; height:40px; object-fit:contain; animation:pearlOpen .6s cubic-bezier(.2,1.2,.35,1) both; }
@keyframes pearlOpen{ 0%{ opacity:0; transform:scale(.5) rotate(-14deg); } 100%{ opacity:1; transform:scale(1) rotate(0deg); } }
.speech-row{ display:flex; align-items:flex-start; gap:10px; margin-bottom:12px; }
.speech-bubble{ position:relative; background:var(--sand); border:1px solid var(--line); border-radius:16px; padding:10px 14px; font-weight:700; font-size:13px; color:var(--ink2); }
.speech-bubble::before{ content:""; position:absolute; left:-6px; top:14px; width:12px; height:12px; background:var(--sand); border-left:1px solid var(--line); border-bottom:1px solid var(--line); transform:rotate(45deg); }
.run-turtle-row{ display:flex; align-items:center; gap:8px; }
.run-turtle{ animation:runBounce 1s ease-in-out infinite; }
@keyframes runBounce{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-3px); } }
.rhythm-wave{ flex:1; height:18px; }
.rhythm-wave path{ animation:rhythmDash 1.4s linear infinite; }
@keyframes rhythmDash{ 0%{ stroke-dashoffset:0; } 100%{ stroke-dashoffset:-24; } }
.thumbs-badge{ display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:800; color:var(--good); margin-left:8px; }
.celebrate-check{ width:56px; height:56px; border-radius:50%; background:var(--good); display:grid; place-items:center; margin:4px auto 12px;
  animation:mascpop .5s .1s cubic-bezier(.2,1,.35,1) both; box-shadow:0 12px 26px rgba(123,174,143,.4); }
.celebrate-splash{ position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); width:120px; height:14px;
  background:radial-gradient(ellipse, rgba(126,200,227,.4), transparent 70%); animation:splashPulse 1.6s ease-in-out infinite; pointer-events:none; }
@keyframes splashPulse{ 0%,100%{ opacity:.5; transform:translateX(-50%) scaleX(1); } 50%{ opacity:.9; transform:translateX(-50%) scaleX(1.15); } }
.celebrate-coconut{ position:absolute; top:-10px; right:24px; font-size:22px; animation:coconutDrop 1.8s ease-in infinite; pointer-events:none; }
@keyframes coconutDrop{ 0%{ transform:translateY(-14px); opacity:0; } 15%{ opacity:1; } 60%{ transform:translateY(6px); } 70%{ transform:translateY(0); } 100%{ opacity:1; transform:translateY(0); } }
.overall-celebrate{ display:flex; justify-content:center; margin-top:6px; animation:mascpop .6s 1.2s cubic-bezier(.2,1,.35,1) both; opacity:0; animation-fill-mode:forwards; }

/* ---- the closing summary card ---- */
.sum{ text-align:center; position:relative; }
.sum-sun{ position:absolute; top:-70px; left:50%; transform:translateX(-50%); width:210px; height:210px; border-radius:50%;
  background:radial-gradient(circle, rgba(246,199,106,.34), rgba(246,199,106,0) 68%); pointer-events:none; animation:sumSun 5s ease-in-out infinite; }
@keyframes sumSun{ 0%,100%{ opacity:.65; transform:translateX(-50%) scale(1); } 50%{ opacity:1; transform:translateX(-50%) scale(1.06); } }
.sum-score{ font-family:var(--dis); font-weight:800; font-size:60px; line-height:1; letter-spacing:-.03em; color:var(--ink);
  font-variant-numeric:tabular-nums; animation:thump .6s .25s cubic-bezier(.2,1,.4,1) both; }
.sum-outof{ font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--ink3); margin-top:4px; }
.sum-title{ font-family:var(--dis); font-weight:700; font-size:23px; color:var(--ink); margin:14px 0 4px; }
.sum-sub{ font-size:14.5px; line-height:1.6; color:var(--ink2); max-width:34ch; margin:0 auto; }
.sum-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:18px 0 4px; }
.sum-stat{ background:var(--sand); border:1px solid var(--line); border-radius:18px; padding:11px 6px; }
.sum-stat b{ display:block; font-family:var(--dis); font-weight:800; font-size:21px; color:var(--ink); font-variant-numeric:tabular-nums; }
.sum-stat span{ font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--ink3); }
.sum-shells{ display:flex; justify-content:center; gap:10px; margin-top:14px; font-size:17px; }
.sum-shells span{ animation:decorBob 3s ease-in-out infinite; }
.sum-shells span:nth-child(2){ animation-delay:.4s; } .sum-shells span:nth-child(3){ animation-delay:.8s; }
.sum-actions{ display:grid; gap:9px; margin-top:20px; }
.sum-actions .row2{ display:grid; grid-template-columns:1fr 1fr; gap:9px; }
.sum-actions .btn{ width:100%; }
.sum-toast{ margin-top:12px; font-size:13px; font-weight:700; color:var(--good); animation:rvFade .3s ease both; }
@media (prefers-reduced-motion: reduce){
  .decor-corner,.lighthouse .lh-beam,.pearl-wrap img,.run-turtle,.rhythm-wave path,.celebrate-check,.celebrate-splash,.celebrate-coconut,.overall-celebrate,
  .sum-sun,.sum-score,.sum-shells span{ animation:none; opacity:1; }
}
`;
function SailDecor() {
  return (<><style>{DECOR_CSS}</style><span className="decor-corner" role="img" aria-label="">⛵</span></>);
}

/* One emoji pinned to the card's top-right, gently bobbing. Decorative only. */
function CornerDecor({ emoji }) {
  return (<><style>{DECOR_CSS}</style><span className="decor-corner" role="img" aria-label="">{emoji}</span></>);
}

function LighthouseDecor() {
  return (
    <>
      <style>{DECOR_CSS}</style>
      <div className="lighthouse" aria-hidden="true">
        <div className="lh-beam" />
        <div className="lh-cap" />
        <div className="lh-tower" />
      </div>
    </>
  );
}

function PearlOpenHeader({ label }) {
  return (
    <>
      <style>{DECOR_CSS}</style>
      <div className="pearl-wrap">
        <ShellPearlArt />
        <div className="eye" style={{ margin: 0 }}>{label}</div>
      </div>
    </>
  );
}

function SpeechBubbleHeader({ label, sub }) {
  return (
    <>
      <style>{DECOR_CSS}</style>
      <div className="speech-row">
        <Mascot mood="encouraging" size={40} />
        <div className="speech-bubble">{label}{sub ? <div style={{ fontWeight: 500, marginTop: 4, color: "var(--ink3)" }}>{sub}</div> : null}</div>
      </div>
    </>
  );
}

function RunTurtleBadge() {
  return (
    <>
      <style>{DECOR_CSS}</style>
      <div className="run-turtle-row">
        <span className="run-turtle"><Mascot mood="excited" size={30} /></span>
        <svg className="rhythm-wave" viewBox="0 0 120 18" preserveAspectRatio="none">
          <path d="M0,9 Q10,0 20,9 T40,9 T60,9 T80,9 T100,9 T120,9" fill="none" stroke="var(--ocean)" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>
    </>
  );
}

function ThumbsBadge({ ok }) {
  if (!ok) return null;
  return (<><style>{DECOR_CSS}</style><span className="thumbs-badge">👍 low fillers</span></>);
}

/* The closing card. Recaps the same measured numbers shown elsewhere and
   offers the four ways out: save, share, new topic, home. */
function SummaryCard({ r, topic, onNewTopic, onHome }) {
  const [toast, setToast] = useState("");
  const band = bandForScore(r.overall);
  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };

  const summaryText =
    `I scored ${r.overall}/100 on Yap${topic ? ` — "${topic}"` : ""}.\n` +
    `Structure ${r.structure} · Flow ${r.fluency} · Pace ${r.pace} · ` +
    `Range ${r.range} · Grammar ${r.accuracy} · Clarity ${r.clarity100}\n` +
    `${r.wpm} wpm · ${r.fillerCount} filler${r.fillerCount === 1 ? "" : "s"} · ${r.variety}% word variety`;

  const save = () => {
    const saved = readStore("savedResults", []);
    saved.unshift({
      at: Date.now(), topic: topic || "", overall: r.overall, wpm: r.wpm,
      fillerCount: r.fillerCount, variety: r.variety, seconds: r.seconds,
      structure: r.structure, fluency: r.fluency, pace: r.pace,
      range: r.range, accuracy: r.accuracy, clarity100: r.clarity100,
    });
    writeStore("savedResults", saved.slice(0, 50));
    say("Saved to this device ✓");
  };

  /* Draws the score card to a canvas so there is an actual image to share.
     Everything is drawn by hand rather than rasterising the DOM: no external
     library, and no tainted-canvas problem from the background image. */
  const drawScoreCard = () => {
    const W = 1080, H = 1350, s = 2;              // s: supersample, then scale down
    const c = document.createElement("canvas");
    c.width = W * s; c.height = H * s;
    const x = c.getContext("2d");
    if (!x) return null;
    x.scale(s, s);

    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#EAF8FB"); g.addColorStop(0.45, "#D6F0F6"); g.addColorStop(1, "#F8F2E7");
    x.fillStyle = g; x.fillRect(0, 0, W, H);

    const centre = (t, y, font, fill) => {
      x.font = font; x.fillStyle = fill; x.textAlign = "center";
      x.fillText(t, W / 2, y);
    };

    centre("YAP", 130, "800 46px Manrope, system-ui, sans-serif", "#7A939A");
    centre("SPEAK · THINK · GROW", 172, "700 20px Manrope, system-ui, sans-serif", "#7A939A");

    // score dial
    const cx = W / 2, cy = 430, rad = 150;
    x.lineWidth = 26; x.lineCap = "round";
    x.beginPath(); x.arc(cx, cy, rad, Math.PI * 0.75, Math.PI * 2.25); x.strokeStyle = "rgba(31,79,91,.12)"; x.stroke();
    const frac = Math.max(0, Math.min(1, (r.overall || 0) / 100));
    x.beginPath(); x.arc(cx, cy, rad, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * frac);
    x.strokeStyle = "#7EC8E3"; x.stroke();
    centre(String(r.overall), cy + 34, "800 128px Manrope, system-ui, sans-serif", "#1F4F5B");
    centre("OUT OF 100", cy + 78, "700 20px Manrope, system-ui, sans-serif", "#7A939A");

    // topic, wrapped
    let y = 700;
    if (topic) {
      x.font = "600 34px Manrope, system-ui, sans-serif"; x.fillStyle = "#45636B"; x.textAlign = "center";
      const words = String(topic).split(/\s+/);
      let line = "";
      const lines = [];
      for (const w of words) {
        const t = line ? line + " " + w : w;
        if (x.measureText(t).width > W - 200 && line) { lines.push(line); line = w; } else line = t;
      }
      if (line) lines.push(line);
      for (const l of lines.slice(0, 3)) { x.fillText("\u201C" + l + "\u201D", W / 2, y); y += 46; }
      y += 24;
    }

    // metric grid
    const metrics = [
      ["Structure", r.structure], ["Flow", r.fluency], ["Pace", r.pace],
      ["Range", r.range], ["Grammar", r.accuracy], ["Clarity", r.clarity100],
    ];
    const cols = 3, cw = (W - 160) / cols, ch = 130;
    metrics.forEach((m, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const bx = 80 + col * cw, by = y + row * (ch + 16);
      x.fillStyle = "rgba(255,255,255,.72)";
      const rr = 26;
      x.beginPath();
      x.moveTo(bx + rr, by); x.arcTo(bx + cw - 12, by, bx + cw - 12, by + ch, rr);
      x.arcTo(bx + cw - 12, by + ch, bx, by + ch, rr); x.arcTo(bx, by + ch, bx, by, rr);
      x.arcTo(bx, by, bx + cw - 12, by, rr); x.closePath(); x.fill();
      x.textAlign = "center";
      x.font = "800 44px Manrope, system-ui, sans-serif"; x.fillStyle = "#1F4F5B";
      x.fillText(String(m[1] ?? "-"), bx + (cw - 12) / 2, by + 66);
      x.font = "700 19px Manrope, system-ui, sans-serif"; x.fillStyle = "#7A939A";
      x.fillText(String(m[0]).toUpperCase(), bx + (cw - 12) / 2, by + 100);
    });
    y += 2 * (ch + 16) + 40;

    centre(`${r.wpm} wpm  ·  ${r.fillerCount} filler${r.fillerCount === 1 ? "" : "s"}  ·  ${r.variety}% word variety`,
      y + 10, "600 28px Manrope, system-ui, sans-serif", "#45636B");
    centre(band && band.label ? band.label : "", y + 70, "800 34px Manrope, system-ui, sans-serif", "#5FAECB");

    return c;
  };

  const canvasToBlob = (c) => new Promise((resolve) => {
    try { c.toBlob((b) => resolve(b), "image/png"); } catch (e) { resolve(null); }
  });

  const share = async () => {
    let file = null;
    try {
      const c = drawScoreCard();
      const blob = c ? await canvasToBlob(c) : null;
      if (blob) file = new File([blob], "yap-score.png", { type: "image/png" });
    } catch (e) { /* fall back to text-only below */ }

    try {
      // canShare({files}) is the only reliable test: some browsers expose
      // navigator.share but reject any payload carrying a file
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "My Yap score", text: summaryText, files: [file] });
        return;
      }
      if (navigator.share) { await navigator.share({ title: "My Yap score", text: summaryText }); return; }
      // no share sheet: hand them the image as a download, plus the text
      if (file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url; a.download = "yap-score.png";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        try { await navigator.clipboard.writeText(summaryText); } catch (e) { /* image is the point */ }
        say("Image saved — text copied too ✓");
        return;
      }
      await navigator.clipboard.writeText(summaryText);
      say("Copied — paste it anywhere ✓");
    } catch (e) {
      if (e && e.name === "AbortError") return; // user dismissed the sheet
      say("Couldn't share — try copying instead");
    }
  };

  return (
    <div className="card pcard sum">
      <style>{DECOR_CSS}</style>
      <div className="sum-sun" />
      <span className="celebrate-coconut" role="img" aria-label="">🥥</span>

      <div style={{ position: "relative" }}>
        <div className="celebrate-check">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 12.5l5 5L20 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="celebrate-splash" />
      </div>

      <div className="sum-score">{r.overall}</div>
      <div className="sum-outof">out of 100 · {band.label}</div>

      <div className="sum-title">That's a wrap</div>
      <p className="sum-sub">
        {r.seconds ? `${fmt(r.seconds)} on the clock` : "Speech complete"}
        {topic ? ` · “${topic}”` : ""}
      </p>

      <div className="sum-grid">
        <div className="sum-stat"><b>{r.wpm}</b><span>wpm</span></div>
        <div className="sum-stat"><b>{r.fillerCount}</b><span>fillers</span></div>
        <div className="sum-stat"><b>{r.variety}%</b><span>variety</span></div>
      </div>

      <div className="sum-shells"><span>🐚</span><span>⭐</span><span>🐚</span></div>

      <div className="sum-actions">
        <button className="btn go" onClick={onNewTopic}>Try a new topic</button>
        <div className="row2">
          <button className="btn gold" onClick={save}>Save result</button>
          <button className="btn leaf" onClick={share}>Share</button>
        </div>
        <button className="btn" onClick={onHome}>Back home</button>
      </div>

      {toast && <div className="sum-toast" role="status">{toast}</div>}
    </div>
  );
}

function OverallCelebrate() {
  return (
    <>
      <style>{DECOR_CSS}</style>
      <div className="overall-celebrate"><Mascot mood="excited" size={44} /></div>
    </>
  );
}

function Plant({ reps, size = 74 }) {
  const i = STAGES.indexOf(stageFor(reps));
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" role="img" aria-label={stageFor(reps).name}>
      <rect x="6" y="50" width="48" height="7" rx="3" fill="#C99A4B" />
      {i === 0 && <ellipse cx="30" cy="47" rx="6" ry="4.5" fill="#EEDBB8" stroke="#F8F2E7" strokeWidth="2" />}
      {i >= 1 && <path d="M30 50 L30 34" stroke="#7BAE8F" strokeWidth="3.5" strokeLinecap="round" />}
      {i >= 1 && <path d="M30 40 q-10 -3 -12 -11 q11 0 12 11z" fill="#9FCBA8" stroke="#F8F2E7" strokeWidth="1.6" />}
      {i >= 2 && <path d="M30 36 q10 -3 12 -12 q-11 1 -12 12z" fill="#9FCBA8" stroke="#F8F2E7" strokeWidth="1.6" />}
      {i >= 3 && <path d="M30 34 L30 22" stroke="#7BAE8F" strokeWidth="3.5" strokeLinecap="round" />}
      {i >= 3 && <path d="M30 26 q-12 -4 -14 -13 q13 1 14 13z" fill="#7BAE8F" stroke="#F8F2E7" strokeWidth="1.6" />}
      {i >= 4 && <><circle cx="30" cy="17" r="7" fill="#EEDBB8" stroke="#F8F2E7" strokeWidth="2" /><circle cx="30" cy="17" r="2.6" fill="#FF9F7F" /></>}
      {i >= 5 && <><circle cx="16" cy="24" r="5" fill="#FF9F7F" stroke="#F8F2E7" strokeWidth="2" />
        <circle cx="44" cy="24" r="5" fill="#7EC8E3" stroke="#F8F2E7" strokeWidth="2" /></>}
    </svg>
  );
}

function Petals({ go }) {
  const bits = useMemo(() => {
    if (!go) return [];
    const cols = ["#FF9F7F", "#EEDBB8", "#9FCBA8", "#7EC8E3", "#D6F0F6"];
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
      {out && out !== "__fail__" && <div className="note" style={{ borderColor: "var(--ocean)" }}>{out}</div>}
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

const COMMON_LANGS = ["en-IN", "hi-IN", "ta-IN"];

function LanguageBar({ mic }) {
  const [reply] = usePersisted("replyLang", "en-IN");
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const spoken = mic.lang;
  const spokenLabel = (MIC_LANGS.find((l) => l.id === spoken) || {}).label || spoken;
  const common = MIC_LANGS.filter((l) => COMMON_LANGS.includes(l.id));
  const more = MIC_LANGS.filter((l) => !COMMON_LANGS.includes(l.id));
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
            {common.map((l) => (
              <button key={l.id} className="chip" data-on={spoken === l.id ? "1" : "0"}
                onClick={() => mic.setLang(l.id)}>{l.label}</button>
            ))}
            {!showMore && (
              <button className="ghostlink" onClick={() => setShowMore(true)}>More languages →</button>
            )}
          </div>
          {showMore && (
            <div className="row" style={{ marginTop: 8 }}>
              {more.map((l) => (
                <button key={l.id} className="chip" data-on={spoken === l.id ? "1" : "0"}
                  onClick={() => mic.setLang(l.id)}>{l.label}</button>
              ))}
            </div>
          )}
          <div className="tip" style={{ marginTop: 12 }}>
            Speak however you actually speak — mixing Hindi and English in one sentence is normal and
            YAP scores it as one answer, not as a mistake. Your words are analysed in the language
            you said them; only the coaching is translated.
          </div>
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
   (Table Topics, Debate): a count for "ah"/"um"/"uh" by
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

function ClarityCard({ r }) {
  const c = r.concise;
  if (r.wc < 12) return null;
  return (
    <div className="card sky pcard">
      <LighthouseDecor />
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

      {c.repeatedIdeas.length > 0 && (
        <>
          <div className="eye" style={{ margin: "16px 0 8px" }}>Ideas that came round again</div>
          <div className="tally">
            {c.repeatedIdeas.slice(0, 5).map((x) => <span className="tchip" key={x.phrase}>{x.phrase} <b>×{x.n}</b></span>)}
          </div>
          <p className="ex">Back-to-back repetition is emphasis and isn't counted. These came back later, which usually means circling rather than emphasising.</p>
        </>
      )}

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
    verb: "supporting", colour: "var(--ocean-deep)", accent: "#3E9BD1", glow: "62,155,209" },
  { id: "against", label: "AGAINST", blurb: "Oppose the motion. Attack its weakest joint.",
    verb: "opposing", colour: "var(--coral-deep)", accent: "#E8674A", glow: "232,103,74" },
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
/* Full-screen celebration when points land. Mounts on an xp award, plays once,
   and unmounts itself — the caller only has to hand it a number. */
function PointsBurst({ amount, onDone }) {
  const doneRef = useRef(onDone); doneRef.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => doneRef.current && doneRef.current(), 2100);
    return () => clearTimeout(t);
  }, [amount]);

  // fixed ring of stars, so every burst reads the same rather than randomly
  const stars = [
    { x: -128, y: -54, s: 1.0, d: 0 },    { x: 122, y: -70, s: .78, d: .06 },
    { x: -92, y: 66, s: .66, d: .12 },    { x: 104, y: 58, s: .92, d: .04 },
    { x: -160, y: 14, s: .58, d: .16 },   { x: 156, y: 2, s: .70, d: .1 },
    { x: -44, y: -104, s: .74, d: .14 },  { x: 52, y: 100, s: .62, d: .18 },
  ];

  return (
    <div className="pburst" role="status" aria-live="polite">
      <style>{PBURST_CSS}</style>
      <div className="pburst-glow" />
      <div className="pburst-core">
        {stars.map((st, i) => (
          <span key={i} className="pburst-star"
            style={{ "--px": `${st.x}px`, "--py": `${st.y}px`, "--ps": st.s, animationDelay: `${st.d}s` }}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 1.6l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 16.8 5.9 20.2l1.4-6.8L2.2 8.7l6.9-.8L12 1.6Z" />
            </svg>
          </span>
        ))}
        <div className="pburst-num">
          <b>+{amount}</b>
          <span>points</span>
        </div>
      </div>
    </div>
  );
}

const PBURST_CSS = `
.pburst{position:fixed;inset:0;z-index:900;display:grid;place-items:center;pointer-events:none;
  animation:pbFade .3s ease both}
.pburst-glow{position:absolute;width:min(78vw,420px);aspect-ratio:1;border-radius:50%;
  background:radial-gradient(circle,rgba(255,255,255,.92),rgba(238,219,184,.55) 42%,transparent 70%);
  animation:pbGlow 2.1s cubic-bezier(.2,.9,.3,1) both}
.pburst-core{position:relative;display:grid;place-items:center;animation:pbPop .7s cubic-bezier(.2,1.5,.4,1) both}
.pburst-num{position:relative;z-index:2;text-align:center;animation:pbLift 2.1s cubic-bezier(.2,.9,.3,1) both}
.pburst-num b{display:block;font-family:var(--dis),system-ui,sans-serif;font-weight:800;
  font-size:clamp(64px,19vw,116px);line-height:.9;letter-spacing:-.03em;color:#1F4F5B;
  text-shadow:0 6px 0 rgba(255,255,255,.9),0 10px 26px rgba(31,79,91,.28)}
.pburst-num span{display:block;margin-top:6px;font-family:var(--bod),system-ui,sans-serif;font-weight:800;
  font-size:clamp(13px,3.4vw,17px);letter-spacing:.24em;text-transform:uppercase;color:#45636B;
  text-shadow:0 2px 6px rgba(255,255,255,.9)}
.pburst-star{position:absolute;color:#F2B33D;filter:drop-shadow(0 4px 10px rgba(201,154,75,.5));
  animation:pbStar 1.5s cubic-bezier(.2,.9,.3,1) both}
.pburst-star svg{width:38px;height:38px;display:block}
@keyframes pbFade{from{opacity:0}to{opacity:1}}
@keyframes pbPop{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes pbGlow{0%{transform:scale(.4);opacity:0}25%{opacity:1}100%{transform:scale(1.25);opacity:0}}
@keyframes pbLift{0%,72%{transform:translateY(0);opacity:1}100%{transform:translateY(-26px);opacity:0}}
@keyframes pbStar{
  0%{transform:translate(0,0) scale(0) rotate(-60deg);opacity:0}
  35%{opacity:1}
  70%{transform:translate(var(--px),var(--py)) scale(var(--ps)) rotate(10deg);opacity:1}
  100%{transform:translate(calc(var(--px) * 1.18),calc(var(--py) * 1.18 + 16px)) scale(calc(var(--ps) * .82)) rotate(24deg);opacity:0}}
@media (prefers-reduced-motion:reduce){
  .pburst-glow,.pburst-star{animation-duration:.01s;animation-iteration-count:1}
  .pburst-core,.pburst-num{animation:pbFade .2s ease both}
}
`;

function ThumbIcon({ down }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
      style={down ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M9 21h8.3a2 2 0 0 0 2-1.7l1.3-8a2 2 0 0 0-2-2.3H14V4.6A2.6 2.6 0 0 0 11.4 2c-.5 0-.9.3-1 .8L9 9v12Zm-5 0h2a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1Z" />
    </svg>
  );
}

function WaveRule() {
  return (
    <svg viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" aria-hidden="true">
      <path d="M1 8c3-5 6-5 9 0s6 5 9 0" />
    </svg>
  );
}

function BirdsMark() {
  return (
    <svg viewBox="0 0 60 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" className="sc-birds" aria-hidden="true">
      <path d="M4 9c3-4 6-4 9 0" /><path d="M22 5c2.5-3.5 5-3.5 7.5 0" />
      <path d="M38 13c3-4 6-4 9 0" />
    </svg>
  );
}

/* The card's shape, drawn as SVG so it can have rounded corners AND a gradient
   stroke that follows the slope — clip-path gives neither. Both the top and
   bottom edges slant, mirrored between the two sides, and the path is built
   from a viewBox that stretches to the card via preserveAspectRatio="none".
   Stroke width is corrected for that non-uniform scale via vector-effect. */
function StanceFrame({ id, accent, flip, on }) {
  const W = 200, H = 150, R = 16;          // R: corner radius, in viewBox units
  const slant = 17;                        // horizontal inset of the short edge
  /* One vertical edge is full height; the opposite one is pulled in at both
     top and bottom, so the card tapers sideways. AGAINST is short down its
     LEFT edge, FOR mirrors it. Corners run clockwise from top-left. */
  const pts = flip
    // short RIGHT edge (FOR)
    ? [[0, 0], [W - slant, slant], [W - slant, H - slant], [0, H]]
    // short LEFT edge (AGAINST)
    : [[slant, slant], [W, 0], [W, H], [slant, H - slant]];

  // round every corner by trimming R along each adjoining edge
  const d = pts.map((p, i) => {
    const prev = pts[(i + pts.length - 1) % pts.length];
    const next = pts[(i + 1) % pts.length];
    const trim = (from, to) => {
      const dx = to[0] - from[0], dy = to[1] - from[1];
      const len = Math.hypot(dx, dy) || 1;
      const t = Math.min(R, len / 2) / len;
      return [from[0] + dx * t, from[1] + dy * t];
    };
    const a = trim(p, prev), b = trim(p, next);
    return { a, b };
  }).map((c, i) => (i === 0
    ? `M ${c.a[0]} ${c.a[1]} Q ${pts[0][0]} ${pts[0][1]} ${c.b[0]} ${c.b[1]}`
    : `L ${c.a[0]} ${c.a[1]} Q ${pts[i][0]} ${pts[i][1]} ${c.b[0]} ${c.b[1]}`)).join(" ") + " Z";

  return (
    <svg className="sc-frame" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        {/* the face: white, warming to the accent at the far corner */}
        <linearGradient id={`f${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".5" stopColor="#fdfeff" />
          <stop offset="1" stopColor={accent} stopOpacity={on ? ".2" : ".1"} />
        </linearGradient>
        {/* the border: a sheen that travels the whole outline, so the edge
            reads as reflective rather than a flat rule */}
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset=".22" stopColor={accent} stopOpacity={on ? "1" : ".55"} />
          <stop offset=".5" stopColor="#ffffff" stopOpacity=".9" />
          <stop offset=".78" stopColor={accent} stopOpacity={on ? "1" : ".55"} />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".95" />
        </linearGradient>
        {/* a soft inner highlight along the top edge */}
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".85" />
          <stop offset=".35" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#f${id})`} />
      <path d={d} fill={`url(#g${id})`} />
      <path d={d} fill="none" stroke={`url(#s${id})`}
        strokeWidth={on ? 2.5 : 1.6} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

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

function Chevron() {
  return (
    <svg className="bchev" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* The model returns each counter as one string holding both the objection and
   its answer. Split on the first sentence boundary so the rebuttal can be shown
   under its own heading; if there is only one sentence, it stays whole. */
function splitCounter(text) {
  const t = String(text || "").trim();
  const m = t.match(/^(.+?[.?!])\s+(.+)$/s);
  return m ? [m[1], m[2]] : [t];
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

/* ------------------------------ DEBATE UI --------------------------------- */

const DEBATE_CSS = `
/* ---- choose your side ---- */
.side-head{display:flex;align-items:center;gap:12px;justify-content:center;margin:2px 0 16px}
.side-head span{font-family:var(--bod);font-weight:800;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink2);white-space:nowrap}
.side-head i{height:2px;flex:1;max-width:70px;border-radius:2px;background:linear-gradient(90deg,transparent,rgba(126,200,227,.85))}
.side-head i:last-child{background:linear-gradient(90deg,rgba(126,200,227,.85),transparent)}

/* The tapered edges already open a wedge between the cards, so the grid gap is
   pulled in tight — with a positive gap the two read as far apart. */
.stance{display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:stretch;margin:0 -2px}
.stance > :first-child{margin-right:-30px}
@media (max-width:430px){
  .stance{grid-template-columns:1fr;gap:8px;margin:0}
  .stance > :first-child{margin-right:0}
}

/* The shape, border and fill are all drawn by <StanceFrame> (SVG), because a
   clip-path can carry neither a rounded corner nor a stroke. The button is a
   transparent box; the SVG stretches behind the content. Both the top and the
   bottom edge slant, mirrored between the two sides. */
.stancecard{position:relative;display:block;width:100%;text-align:left;
  border:none;background:none;padding:20px 20px 22px;min-height:180px;
  cursor:pointer;transition:transform .28s cubic-bezier(.2,.9,.3,1),filter .28s;
  filter:drop-shadow(0 12px 26px rgba(var(--sc-glow),.20))}
.sc-frame{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.stancecard:hover{transform:translateY(-3px);filter:drop-shadow(0 18px 36px rgba(var(--sc-glow),.30))}
.stancecard[data-on="1"]{filter:drop-shadow(0 0 20px rgba(var(--sc-glow),.42)) drop-shadow(0 16px 34px rgba(var(--sc-glow),.30))}
.stancecard:focus-visible{outline:none}
.stancecard:focus-visible .sc-frame{outline:3px solid var(--sc-accent);outline-offset:4px;border-radius:18px}
@media (prefers-reduced-motion:reduce){.stancecard{transition:none}}

.sc-badge{position:absolute;top:16px;left:18px;z-index:4;width:34px;height:34px;border-radius:50%;
  display:grid;place-items:center;color:#fff;
  background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.55),transparent 58%),var(--sc-accent);
  box-shadow:0 4px 10px rgba(var(--sc-glow),.5),inset 0 -2px 4px rgba(0,0,0,.18)}
.sc-badge svg{width:17px;height:17px}

.sc-copy{display:block;position:relative;z-index:2;padding-top:30px}
/* The tapered vertical edge eats into the card, so the copy is pushed clear of
   it: FOR tapers on the right, AGAINST on the left. The straight edge keeps a
   normal 20px, the tapered one needs room for the widest part of the wedge. */
/* FOR's straight edge is on the right, so its content aligns there — against
   the solid edge rather than floating over the tapered one */
.stancecard[data-side="for"]{padding-right:30px;text-align:right}
.stancecard[data-side="against"]{padding-left:40px}
.stancecard[data-side="against"] .sc-badge{left:auto;right:18px}
@media (max-width:430px){
  .stancecard[data-side="for"]{padding-right:34px}
  .stancecard[data-side="against"]{padding-left:34px}
}
.sc-label{display:block;font-family:var(--dis);font-weight:800;font-size:clamp(23px,5.8vw,31px);
  line-height:1;letter-spacing:-.01em;color:var(--sc-accent);margin-bottom:11px}
/* the little wave-on-a-rule divider */
.sc-rule{display:flex;align-items:center;gap:5px;margin-bottom:13px}
.sc-rule i{height:1.5px;flex:1;background:rgba(var(--sc-glow),.42);border-radius:2px}
.sc-rule svg{width:16px;height:8px;flex:none;color:var(--sc-accent);opacity:.75}
.sc-blurb{display:block;font-size:12.5px;line-height:1.68;color:var(--ink2)}

/* the board sits bottom-right, bleeding off the card edge */
/* faint birds, as in the reference */
/* birds sit opposite the badge: FOR's badge is left, AGAINST's is right */
.sc-birds{position:absolute;top:16px;right:16px;width:44px;color:var(--sc-accent);opacity:.26;z-index:2}
.stancecard[data-side="against"] .sc-birds{right:auto;left:16px}
.prepgrid{display:flex;gap:8px;flex-wrap:wrap}
.preptile{flex:1 1 90px;border:1px solid var(--line);background:var(--surf1);border-radius:16px;
  padding:12px 8px;cursor:pointer;text-align:center;font-family:var(--bod);color:var(--ink);transition:.2s cubic-bezier(.2,.9,.3,1)}
.preptile[data-on="1"]{background:var(--ocean);color:#fff;border-color:var(--ocean)}
.preptile b{display:block;font-family:var(--bod);font-weight:800;font-size:15px}
.preptile span{font-size:10px;opacity:.75;line-height:1.35;display:block;margin-top:3px}
.prepbig{font-family:var(--bod);font-weight:800;font-size:clamp(46px,14vw,80px);text-align:center;
  letter-spacing:-.02em;line-height:1;font-variant-numeric:tabular-nums;color:var(--ink)}
.prepbig.low{color:var(--bad)}
  resize:vertical;margin-top:8px}
.brief li{font-size:14.5px;line-height:1.6;margin-bottom:7px;color:var(--ink2)}

/* ---- research brief ---- */
/* one solid white sheet: the brief is read at a glance under time pressure,
   so it needs a flat opaque ground, not the translucent glass used elsewhere */
.bsheet{background:#fff;border:1px solid var(--line);border-radius:26px;padding:24px 22px;margin-bottom:20px;box-shadow:0 18px 44px rgba(31,79,91,.12);animation:cardin .5s cubic-bezier(.2,.9,.3,1) both}
.bsheet .bsec:last-child{margin-bottom:0}
@media (max-width:560px){.bsheet{padding:20px 16px;border-radius:22px}}

.bsec{margin-bottom:14px;border-bottom:1px solid var(--line);padding-bottom:14px}
.bsheet .bsec:last-child{border-bottom:none;padding-bottom:0}

/* the whole header is the toggle, so the hit target is the full row */
.bhead{display:flex;align-items:center;gap:10px;width:100%;background:none;border:none;padding:4px 0;margin:0;cursor:pointer;text-align:left;font:inherit;color:inherit}
.bhead:focus-visible{outline:3px solid var(--ocean);outline-offset:3px;border-radius:8px}
.bhead .btit{font-family:var(--bod);font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink2)}
.bhead:hover .btit{color:var(--ink)}
.bhead .bcount{font-size:11px;font-weight:700;color:var(--ink3);font-variant-numeric:tabular-nums;background:var(--foam);border-radius:999px;padding:2px 8px}
.bhead .bchev{margin-left:auto;flex:none;width:15px;height:15px;color:var(--ink3);transition:transform .3s cubic-bezier(.2,.9,.3,1)}
.bhead[aria-expanded="false"] .bchev{transform:rotate(-90deg)}

/* grid-rows animates cleanly to auto height, unlike max-height guesswork */
.bbody{display:grid;grid-template-rows:1fr;transition:grid-template-rows .32s cubic-bezier(.2,.9,.3,1),opacity .25s;opacity:1;margin-top:11px}
.bbody[data-open="0"]{grid-template-rows:0fr;opacity:0;margin-top:0}
.bbody > div{overflow:hidden;min-height:0}
@media (prefers-reduced-motion:reduce){.bbody{transition:none}}

/* the thesis — the one thing they must internalise, so it leads and is biggest */
.bthesis{background:rgba(126,200,227,.12);border:1px solid rgba(126,200,227,.4);border-radius:20px;padding:18px 20px;margin-bottom:18px}
.bthesis .btit{font-family:var(--bod);font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);display:block;margin-bottom:8px}
.bthesis p{font-size:17px;line-height:1.55;margin:0;font-weight:600;color:var(--ink)}

/* numbered argument cards — countable at a glance while speaking */
.bpoint{display:flex;gap:12px;align-items:flex-start;padding:9px 0;margin:0}
.bpoint + .bpoint{border-top:1px solid var(--line)}
.bpoint .bn{flex:none;width:21px;height:21px;border-radius:50%;background:var(--foam);color:var(--ink2);font-size:11px;font-weight:800;display:grid;place-items:center;margin-top:2px}
.bpoint p{margin:0;font-size:15px;line-height:1.55;color:var(--ink)}

/* objection → answer, visually separated so the rebuttal is findable */
.bcounter{padding:10px 0;margin:0}
.bcounter + .bcounter{border-top:1px solid var(--line)}
.bcounter .bq{font-size:14.5px;line-height:1.5;font-weight:700;color:var(--coral-deep);margin:0}
.bcounter .ba{margin:7px 0 0;font-size:14.5px;line-height:1.55;color:var(--ink2)}
.bcounter .ba b{font-weight:800;font-size:10px;letter-spacing:.1em;text-transform:uppercase;display:block;margin-bottom:3px;color:var(--ink3)}

.bfact{padding:10px 0;margin:0;font-size:14.5px;line-height:1.55;color:var(--ink2)}
.bfact + .bfact{border-top:1px solid var(--line)}
.bwarn{font-size:12.5px;line-height:1.5;color:var(--ink3);margin:12px 0 0;font-style:italic}

.bcase{padding:10px 0;margin:0;font-size:14.5px;line-height:1.55;color:var(--ink2)}
.bcase + .bcase{border-top:1px solid var(--line)}
.brief ul{margin:6px 0 0;padding-left:18px}
.pill{display:inline-block;font-family:var(--bod);font-weight:700;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;
  border:1px solid var(--line);border-radius:999px;padding:4px 11px;margin-bottom:8px;color:var(--ink2)}
`;


function DebateMode({ mic, onFinish, lib, profile }) {
  const [stage, setStage] = useState("stance");
  const [topic, setTopic] = useState(() => pick(TOPICS["Placement & GD"]));
  const [spinning, setSpinning] = useState(false);
  const [stance, setStance] = useState(null);
  const [brief, setBrief] = useState(null);
  const [briefState, setBriefState] = useState("idle");
  const [briefLeft, setBriefLeft] = useState(0);   // seconds remaining on the reveal timer
  const [briefOpen, setBriefOpen] = useState({ points: false, counters: false, facts: false, examples: false });
  const toggleSec = (k) => setBriefOpen((o) => ({ ...o, [k]: !o[k] }));
  const briefTimers = useRef([]);
  const [prepChoice, setPrepChoice] = useState(60);
  const [customPrep, setCustomPrep] = useState(90);
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
    setStage("analyzing");
    setPetals(true); setTimeout(() => setPetals(false), 3200);
    onFinish({ xp: 45 + Math.round(r.debateScore / 2), seconds: secs, kind: "topic" });

    if (r.unintelligible || r.wc < 15) { setAiState("skip"); return; }
    setAiState("loading");
    askClaude(DEBATE_EVAL_SYS,
      `Motion: "${topic}"\nThey argued: ${stanceById(stance).label}\nPrep time: ${prepSeconds}s\n` +
      `Measured: stance consistency ${r.consistency.score}, evidence ${r.evidence}, ` +
      `counterargument ${r.counter}, argument ${r.argument}, words ${r.wc}.\n` +
      `Transcript:\n"""${text}"""`, 900)
      .then((j) => { setAi(j); setAiState("done"); })
      .catch(() => setAiState("offline"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic, stance, slot, topic, prepSeconds, onFinish]);

  const watch = useStopwatch(slot.red + 30, finish);

  useEffect(() => {
    if (stage === "analyzing") {
      const timer = setTimeout(() => {
        setStage("report");
      }, 5200);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  /* The brief streams: tokens are shown as they arrive so the wait has
     something to watch, while the finished, formatted brief is still held
     until a 10s floor has passed. Whichever finishes last — stream or
     timer — triggers the reveal. */
  /* The brief is fetched immediately, but held back until a 20s floor has
     passed: the wait is deliberate prep time, not latency. Whichever finishes
     last — the request or the timer — triggers the reveal. */
  const BRIEF_REVEAL_MS = 20000;
  const getBrief = () => {
    setBriefState("loading");
    setBriefLeft(Math.ceil(BRIEF_REVEAL_MS / 1000));

    let pending = null;                       // result waiting on the timer
    let elapsed = false;                      // timer done, waiting on result

    const reveal = ({ data, local }) => {
      setBrief(data);
      setBriefState(local ? "local" : "done");
      setBriefLeft(0);
    };

    const tick = setInterval(() => setBriefLeft((n) => (n > 1 ? n - 1 : 0)), 1000);
    const floor = setTimeout(() => {
      elapsed = true;
      clearInterval(tick);
      setBriefLeft(0);
      if (pending) reveal(pending);
    }, BRIEF_REVEAL_MS);
    briefTimers.current = [tick, floor];

    const settle = (payload) => {
      if (elapsed) reveal(payload);           // timer already done — show now
      else pending = payload;                 // hold until the floor passes
    };

    askClaude(BRIEF_SYS, `Motion: "${topic}"\nThey are arguing: ${stanceById(stance).label} (${stanceById(stance).verb} the motion).`, 800, undefined, GROQ_FAST_MODEL)
      .then((j) => settle({ data: { ...j, stance }, local: false }))
      .catch(() => settle({ data: localBrief(topic, stance), local: true }));
  };

  // never leave an interval running behind an unmounted or reset flow
  useEffect(() => () => briefTimers.current.forEach((t) => { clearInterval(t); clearTimeout(t); }), []);

  const startSpeaking = async () => {
    setTyped("");
    const ok = await mic.start();
    if (!ok) {
      alert("Microphone access is required. Please allow microphone access in your browser settings.");
      return;
    }
    setMode("mic");
    setStage("live"); watch.start();
  };

  const reset = () => {
    briefTimers.current.forEach((t) => { clearInterval(t); clearTimeout(t); });
    briefTimers.current = [];
    setStage("stance"); setStance(null); setBrief(null); setBriefState("idle"); setBriefLeft(0);
    setRep(null); setAi(null); setAiState("idle");
    prep.reset(); watch.reset();
  };


  const spinMotion = (pool) => {
    if (spinning) return;
    setSpinning(true);
    let i = 0;
    const id = setInterval(() => {
      setTopic(pick(pool)); spinTick();
      if (++i > 10) { clearInterval(id); setSpinning(false); }
    }, 62);
  };

  /* ============================ 1 · STANCE ============================ */
  if (stage === "stance") {
    const pool = [...TOPICS["Placement & GD"], ...TOPICS["Society & policy"],
      ...TOPICS["Tech & AI"], ...TOPICS["Hot takes"], ...(lib.topics || []).map((t) => t.text)];
    return (
      <div>
        <h1 className="h1">Pick a side.<br /><em>Then defend it.</em></h1>
        <p className="sub">
          A debate isn't a Table Topic with a stronger opinion. You commit to a position before you
          know what you'll say, and you're scored on whether the case survives your own speech.
        </p>
        <Notice mic={mic} />
        <LanguageBar mic={mic} />

        <div className="card sky">
          <div className="eye">The motion</div>
          <div className={"topic" + (spinning ? " fade" : "")} style={{ minHeight: "auto", marginTop: 6 }}>{topic}</div>
          <div className="row" style={{ marginTop: 12, alignItems: "center" }}>
            <button className="btn sm" onClick={() => spinMotion(pool)} disabled={spinning}>
              {spinning ? "Spinning…" : "Spin for a motion"}
            </button>
            {(lib.topics || []).length > 0 && (
              <button className="ghostlink" onClick={() => spinMotion(lib.topics.map((t) => t.text))} disabled={spinning}>From my library</button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="side-head"><i /><span>Choose your side</span><i /></div>
          <div className="stance">
            {STANCES.map((st) => (
              <button
                key={st.id}
                type="button"
                className="stancecard"
                data-on={stance === st.id ? "1" : "0"}
                data-side={st.id}
                style={{ "--sc-accent": st.accent, "--sc-glow": st.glow }}
                aria-pressed={stance === st.id}
                onClick={() => setStance(st.id)}
              >
                <StanceFrame id={st.id} accent={st.accent} flip={st.id === "for"}
                  on={stance === st.id} />
                <span className="sc-badge"><ThumbIcon down={st.id === "against"} /></span>
                <BirdsMark />
                <span className="sc-copy">
                  <span className="sc-label">{st.label}</span>
                  <span className="sc-rule"><i /><WaveRule /><i /></span>
                  <span className="sc-blurb">{st.blurb}</span>
                </span>
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
                {briefState === "loading"
                  ? <><span className="spin" />Researching{briefLeft > 0 ? ` · ${briefLeft}s` : "…"}</>
                  : "Get a research brief"}
              </button>
              <button className="btn" onClick={() => setStage("prep")}>Skip — go in cold</button>
            </div>

          </div>
        )}

        {brief && (
          <>
            <div className="bsheet">
            <div className="bthesis">
              <span className="btit">What this is really about</span>
              <p>{brief.summary}</p>
            </div>

            {(brief.points || []).length > 0 && (
              <div className="bsec">
                <button type="button" className="bhead" aria-expanded={briefOpen.points}
                  onClick={() => toggleSec("points")}>
                  <span className="btit">Your arguments</span>
                  <span className="bcount">{brief.points.length}</span>
                  <Chevron />
                </button>
                <div className="bbody" data-open={briefOpen.points ? "1" : "0"}>
                  <div>
                    {brief.points.map((x, i) => (
                      <div className="bpoint" key={i}>
                        <span className="bn">{i + 1}</span>
                        <p>{x}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(brief.counters || []).length > 0 && (
              <div className="bsec">
                <button type="button" className="bhead" aria-expanded={briefOpen.counters}
                  onClick={() => toggleSec("counters")}>
                  <span className="btit">What they&apos;ll come back with</span>
                  <span className="bcount">{brief.counters.length}</span>
                  <Chevron />
                </button>
                <div className="bbody" data-open={briefOpen.counters ? "1" : "0"}>
                  <div>
                    {brief.counters.map((x, i) => {
                      const [objection, ...rest] = splitCounter(x);
                      return (
                        <div className="bcounter" key={i}>
                          <p className="bq">{objection}</p>
                          {rest.length > 0 && (
                            <p className="ba"><b>Your answer</b>{rest.join(" ")}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {(brief.facts || []).length > 0 && (
              <div className="bsec">
                <button type="button" className="bhead" aria-expanded={briefOpen.facts}
                  onClick={() => toggleSec("facts")}>
                  <span className="btit">Worth citing</span>
                  <span className="bcount">{brief.facts.length}</span>
                  <Chevron />
                </button>
                <div className="bbody" data-open={briefOpen.facts ? "1" : "0"}>
                  <div>
                    {brief.facts.map((x, i) => <p className="bfact" key={i}>{x}</p>)}
                    <p className="bwarn">
                      Check anything you plan to say as fact. A confident wrong number is worse than no number.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(brief.examples || []).length > 0 && (
              <div className="bsec">
                <button type="button" className="bhead" aria-expanded={briefOpen.examples}
                  onClick={() => toggleSec("examples")}>
                  <span className="btit">Cases you could use</span>
                  <span className="bcount">{brief.examples.length}</span>
                  <Chevron />
                </button>
                <div className="bbody" data-open={briefOpen.examples ? "1" : "0"}>
                  <div>
                    {brief.examples.map((x, i) => <p className="bcase" key={i}>{x}</p>)}
                  </div>
                </div>
              </div>
            )}
            </div>

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
                    className="typebox" style={{ marginTop: 0, width: 110, fontFamily: "var(--bod)" }}
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
        {!live && (
          <div className="card" style={{ borderColor: st.colour }}>
            <span className="pill" style={{ color: st.colour, borderColor: st.colour }}>Arguing {st.label}</span>
            <div className="topic" style={{ minHeight: "auto", fontSize: 20 }}>{topic}</div>
          </div>
        )}

        {!live ? (
          <div className="card">
            <p style={{ fontSize: 15.5, lineHeight: 1.65, margin: "0 0 14px" }}>
              {slot.label} on the clock. Green at {fmt(slot.green)}, red at {fmt(slot.red)}.
            </p>
            <div className="row">
              <button className="btn go" style={{ width: "100%" }} onClick={startSpeaking}>
                <span><Icon name="mic" size={18} /> Speak now</span></button>
            </div>
          </div>
        ) : (
          <RecordingScreen
            title="Debate"
            elapsed={watch.t}
            totalLabel={slot.label}
            mic={mic}
            onStop={() => finish()}
            onBack={() => { mic.stop(); watch.stop(); watch.reset(); setStage("speak"); }}
            stopLabel="Finish"
            slot={slot}
          />
        )}
      </div>
    );
  }

  if (stage === "analyzing") {
    return <AnalyzingScreen />;
  }

  /* ============================ 5 · REPORT ============================ */
  const { r, tRep, aRep, gRep } = rep;
  const st = stanceById(stance);
  return (
    <div>
      <Petals go={petals} />
      <h1 className="h1">The <em>verdict</em></h1>

      <div className="card moss">
        <span className="pill" style={{ color: st.colour, borderColor: st.colour }}>Argued {st.label}</span>
        <div className="popring" style={{ textAlign: "center" }}>
          <div className="big" style={{ fontSize: 62, margin: "4px 0 0" }}>
            {r.debateScore}<span style={{ fontSize: 19, color: "var(--ink3)" }}>/100</span>
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

function TableTopics({ mic, onFinish, wotd, lib, profile, go, preselectedTopic, clearPreselected }) {
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
  const [topic, setTopic] = useState(preselectedTopic);
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState("pick");
  const [mode, setMode] = useState("mic");
  const [typed, setTyped] = useState("");
  const [rep, setRep] = useState(null);
  const [ai, setAi] = useState(null);
  const [aiState, setAiState] = useState("idle");
  const [petals, setPetals] = useState(false);
  // the report opens on the score reveal; the deck is behind an explicit tap
  const [deepOpen, setDeepOpen] = useState(false);

  // Clear the preselected topic after it's been used
  useEffect(() => {
    if (preselectedTopic) {
      clearPreselected();
    }
  }, [preselectedTopic, clearPreselected]);

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
    const usedW = usedWord(wotd && wotd.w, text);
    const gRep = gramReport(r, wotd, usedW);
    const eRep = evalReport(r, tRep);

    setRep({ r, tRep, aRep, gRep, eRep, usedW, slot, wotd });
    setPhase("analyzing");
    setPetals(true); setTimeout(() => setPetals(false), 3400);
    onFinish({ xp: 30 + Math.round(r.overall / 2), seconds: secs, kind: "topic" });

    if (r.unintelligible || r.wc < 15) { setAiState("skip"); return; }
    setAiState("loading");
    askClaude(EVAL_SYS, `Topic: "${topic}"\nTime slot: ${slot.label}\nSeconds spoken: ${secs}\nTranscript:\n"""${text}"""`, 1100)
      .then((j) => { setAi(j); setAiState("done"); })
      .catch(() => setAiState("offline"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic, topic, slot, onFinish, wotd]);

  const watch = useStopwatch(slot.red + 30, finish);

  useEffect(() => {
    if (phase === "analyzing") {
      const timer = setTimeout(() => {
        setPhase("report");
      }, 5200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const toggle = (c) => setCat((v) => (v.includes(c) ? (v.length > 1 ? v.filter((x) => x !== c) : v) : [...v, c]));

  const spin = () => {
    setPhase("pick"); setRep(null); setAi(null); setAiState("idle"); setTyped(""); setDeepOpen(false); watch.reset();
    setSpinning(true);
    let i = 0;
    const id = setInterval(() => {
      setTopic(pick(pool)); spinTick();
      if (++i > 10) { clearInterval(id); setSpinning(false); }
    }, 62);
  };

  const record = async () => {
    setTyped("");
    const ok = await mic.start();
    if (!ok) {
      alert("Microphone access is required. Please allow microphone access in your browser settings.");
      return;
    }
    setMode("mic");
    setPhase("live"); watch.start();
  };

  if (phase === "analyzing") {
    return <AnalyzingScreen />;
  }

  if (phase === "report" && rep) {
    const { r, tRep, aRep, gRep, eRep, usedW } = rep;
    const vocab = ai && ai.vocab ? ai.vocab.map((v) => ({ was: v.weak, now: v.better, why: v.why, kind: "vocab" })) : [];

    const cards = [];

    cards.push(
      <div className="card sun pcard" key="timer">
        <style>{RPT_CSS}</style>
        <CornerDecor emoji="⏳" />
        <RoleHead role={ROLES[0]} />
        <div className={"clock" + (r.seconds > rep.slot.red ? " over" : "")}>{fmt(r.seconds)}</div>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span className={"verdict " + tRep.vclass}>
            {tRep.verdict === "qualified" ? "qualifies" : tRep.verdict === "under" ? "under time" : "over time"}
          </span>
        </div>
        <TimeLine seconds={r.seconds} slot={rep.slot} />
        <StatStrip items={[
          [fmt(r.seconds), "Spoke", tRep.verdict === "qualified" ? "ok" : "warn"],
          [r.mode === "mic" ? `${Math.max(0, r.seconds - r.voiced)}s` : "—", "Silence",
            r.mode === "mic" && (r.seconds - r.voiced) > 8 ? "warn" : "ok"],
          [`${r.wpm}`, "Words/min", r.wpm > 170 || r.wpm < 110 ? "warn" : "ok"],
        ]} />
        <p style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 0 }}>{tRep.line}</p>
        <FixIt>
          {tRep.verdict === "under"
            ? `Aim to still be talking at ${fmt(rep.slot.green)}. Take your first idea and add one reason and one example to it — that alone is usually ${Math.max(10, rep.slot.green - r.seconds)}s more.`
            : tRep.verdict === "over"
              ? `Start closing the moment you hit ${fmt(rep.slot.amber)}. Pick your last sentence now: one line that restates your position, nothing new.`
              : `You landed in the window. Next time hold the same shape but cut one sentence you did not need — control is what gets noticed.`}
        </FixIt>
      </div>
    );

    cards.push(
      <div className="card coral pcard" key="ah">
        <style>{RPT_CSS}</style>
        <CornerDecor emoji="🐚" />
        <RoleHead role={ROLES[1]} />
        <ThumbsBadge ok={aRep.soundPer < 3 && aRep.crutchTotal <= 2} />
        <StatStrip items={[
          [aRep.soundTotal, "Ah · um · uh", aRep.soundPer < 3 ? "ok" : aRep.soundPer < 6 ? "warn" : "bad"],
          [aRep.crutchTotal, "Crutch words", aRep.crutchTotal <= 2 ? "ok" : "warn"],
          [r.stumbles.length, "Restarts", r.stumbles.length === 0 ? "ok" : "warn"],
        ]} />
        <p style={{ fontSize: 15, lineHeight: 1.65 }}>{aRep.line}</p>
        {aRep.sounds.length > 0 && (
          <>
            <div className="eye" style={{ marginTop: 14 }}>Which sounds, and how often</div>
            <WordBars items={aRep.sounds} tone="#E8674A" />
          </>
        )}
        {aRep.crutches.length > 0 && (
          <>
            <div className="eye" style={{ marginTop: 14 }}>Crutch phrases</div>
            <WordBars items={aRep.crutches} tone="#C99A4B" />
          </>
        )}
        {r.stumbles.length > 0 && (
          <p className="ex" style={{ marginTop: 12 }}>
            {r.stumbles.length} restart{r.stumbles.length === 1 ? "" : "s"} — &ldquo;{r.stumbles[0].phrase}&rdquo;.
            That is a sentence being rebuilt mid-air.
          </p>
        )}
        <FixIt>
          {aRep.soundTotal === 0 && aRep.crutchTotal <= 2
            ? "Nothing to strip out here. Keep pausing where you were pausing — silence is doing the work fillers usually do."
            : `Replace the ${aRep.sounds.length ? `"${aRep.sounds[0][0]}"` : "filler"} with a closed mouth and a two-count. A pause sounds deliberate; a filler sounds unfinished. Record the same answer once more and only count that one habit.`}
        </FixIt>
      </div>
    );

    cards.push(
      <div className="card moss pcard" key="gram">
        <style>{RPT_CSS}</style>
        <SailDecor />
        <RoleHead role={ROLES[2]} />
        <StatStrip items={[
          [gRep.errs.length, "Grammar slips", gRep.errs.length === 0 ? "ok" : gRep.errs.length <= 2 ? "warn" : "bad"],
          [`${r.variety}%`, "Word variety", r.range >= 55 ? "ok" : "warn"],
          [r.vagueCount, "Vague words", r.vagueCount <= 2 ? "ok" : "warn"],
        ]} />
        <p style={{ fontSize: 15, lineHeight: 1.65 }}>{gRep.line}</p>

        {gRep.junk.length > 0 && (
          <>
            <div className="eye" style={{ margin: "14px 0 8px" }}>Not recognised as words</div>
            <WordBars items={gRep.junk.map((j) => [j.word, j.n])} tone="#7A939A" max={6} />
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
            <WordBars items={r.vague.map((v) => [v.word, v.n])} tone="#C99A4B" max={6} />
            <p className="ex" style={{ marginTop: 8 }}>Each of these is a place a specific noun would have been stronger.</p>
          </>
        )}
        {r.repeats && r.repeats.length > 0 && (
          <>
            <div className="eye" style={{ margin: "16px 0 8px" }}>Words you leaned on</div>
            <WordBars items={r.repeats.map((v) => [v.word, v.n])} tone="#5FAECB" />
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
        <FixIt>
          {r.repeats && r.repeats.length > 0
            ? `You reached for "${r.repeats[0].word}" ${r.repeats[0].n} times. Before your next answer, decide on two alternatives for it — swapping one word is the fastest way to lift range.`
            : r.vagueCount >= 3
              ? `Pick the vaguest word you used and name the actual thing instead. "${r.vague[0].word}" → a specific noun. One substitution per answer is enough to build the habit.`
              : gRep.errs.length > 0
                ? `Say the corrected version of the first slip out loud twice now. Fixing it in your ear is what stops it recurring, not reading it.`
                : `Language held up. Push range next: use one word you would normally avoid because it feels too formal.`}
        </FixIt>
      </div>
    );

    if (profile && (profile.blocks || []).length > 0) {
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
      if (rows.length) {
        const won = rows.filter((x) => x[2]).length;
        cards.push(
          <div className="card moss pcard" key="targets">
            <SpeechBubbleHeader label="Your own targets" sub={`${won} of ${rows.length} clear this rep`} />
            {rows.map(([label, val, ok], i) => (
              <div className="stat" key={i}>
                <span>{label}</span><b className={ok ? "ok" : "bad"}>{val} {ok ? "✓" : "✗"}</b>
              </div>
            ))}
          </div>
        );
      }
    }

    // Word of the day: did they land it, and if not, how it would have fitted
    if (rep.wotd && rep.wotd.w) {
      cards.push(<WotdCard wotd={rep.wotd} used={usedW} key="wotd" />);
    }

    if (r.wc >= 12) {
      cards.push(<ClarityCard r={r} key="clarity" />);
    }

    cards.push(
      <div className="card sky pcard" key="eval">
        <style>{RPT_CSS}</style>
        <CornerDecor emoji="🧭" />
        <RoleHead role={ROLES[3]} />

        {/* strongest and weakest measure, named — the two things worth knowing
            before any of the prose below */}
        {(() => {
          const measures = [["Structure", r.structure], ["Flow", r.fluency], ["Grammar", r.accuracy],
            ["Range", r.range], ["Clarity", r.clarity100]];
          const sorted = [...measures].sort((a, b) => b[1] - a[1]);
          const best = sorted[0], worst = sorted[sorted.length - 1];
          return (
            <StatStrip items={[
              [best[1], `Best · ${best[0]}`, "ok"],
              [worst[1], `Weakest · ${worst[0]}`, worst[1] < 50 ? "bad" : "warn"],
              [`${r.sophistication}%`, "Beyond basic", r.sophistication >= 20 ? "ok" : "warn"],
            ]} />
          );
        })()}

        <div className="dials" style={{ margin: "6px 0 14px" }}>
          {[["Structure", r.structure], ["Flow", r.fluency], ["Grammar", r.accuracy],
            ["Range", r.range], ["Clarity", r.clarity100]].map(([k, v], i) => (
            <ScoreDial key={k} label={k} value={v} delay={i * 0.08} />
          ))}
        </div>
        <OverallCelebrate />

        {/* the three things structure is actually scored on, as a checklist */}
        <div className="eye" style={{ marginTop: 14 }}>What structure is scored on</div>
        <div className="statstrip" style={{ marginTop: 8 }}>
          <div><b className={r.hasStance ? "ok" : "bad"}>{r.hasStance ? "✓" : "✗"}</b><span>Took a position</span></div>
          <div><b className={r.connectives > 0 ? "ok" : "bad"}>{r.connectives}</b><span>Reasons given</span></div>
          <div><b className={r.hasClose ? "ok" : "bad"}>{r.hasClose ? "✓" : "✗"}</b><span>Closed it</span></div>
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
        <FixIt label="The one recommendation">{ai && ai.recommend ? ai.recommend : eRep.recommend}</FixIt>
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
      </div>
    );

    if (vocab.length > 0) {
      cards.push(
        <div className="card pcard" key="vocabswap">
          <PearlOpenHeader label="Words the evaluator would swap" />
          <Corrections items={vocab} />
        </div>
      );
    }

    if (r.clip && r.clip.url) {
      cards.push(<Playback clip={r.clip} label="Hear it back" key="playback" />);
    }

    cards.push(
      <div className="card pcard" key="transcript">
        <CornerDecor emoji="📜" />
        <div className="eye">The transcript{r.lang && !r.isEnglish ? ` · ${langName(r.lang.primary)}` : ""}</div>
        <div className="script" style={{ marginTop: 8 }}>
          {r.text ? renderClarity(r.text, r) : <span className="ex">Nothing came through. Check your microphone and try again.</span>}
        </div>
        <RomanToggle text={r.text} from={r.lang && r.lang.primary} />
        <div className="legend">
          <span><i style={{ background: "#FF9F7F" }} />filler</span>
          <span><i style={{ background: "#EEDBB8" }} />hedge</span>
          <span><i style={{ background: "#7A939A" }} />no work</span>
          <span><i style={{ background: "#C99A4B" }} />wordy</span>
          <span><i style={{ background: "#7EC8E3" }} />repeated idea</span>
        </div>
        <div className="stat" style={{ marginTop: 10 }}><span>Speed</span><b className={r.wpm >= 110 && r.wpm <= 170 ? "ok" : "warn"}>{r.wpm} wpm</b></div>
        <RunTurtleBadge />
        {r.mode === "mic" && <div className="stat"><span>Silence</span>
          <b className={r.seconds - r.voiced > 15 ? "bad" : "ok"}>{Math.max(0, r.seconds - r.voiced)}s</b></div>}
        <div className="stat"><span>Word variety</span><b className={r.variety > 55 ? "ok" : "warn"}>{r.variety}%</b></div>
      </div>
    );

    cards.push(
      <SummaryCard
        key="actions"
        r={r}
        topic={topic}
        onNewTopic={spin}
        onHome={() => (go ? go("club") : setPhase("pick"))}
      />
    );

    return (
      <div>
        <BeachAmbient />
        <Petals go={petals} />
        <h1 className="h1" style={{ textShadow: "0 1px 12px rgba(255,255,255,.85), 0 0 30px rgba(255,255,255,.7)" }}>
          {deepOpen ? <>The club <em>reports back</em></> : <>That's your <em>score</em></>}
        </h1>
        <p className="sub" style={{ color: "var(--ink)", fontWeight: 600, textShadow: "0 1px 10px rgba(255,255,255,.9)" }}>
          {deepOpen
            ? "Four role-players watched that. Here's each of them, in the order a real meeting runs."
            : "Six measures, averaged. Open the breakdown when you want the detail."}
        </p>

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

        {deepOpen ? (
          <>
            <CardDeck
              cards={cards}
              onIndex={(i) => {
                // confetti when the closing card is reached, once per arrival
                if (i === cards.length - 1) { setPetals(true); setTimeout(() => setPetals(false), 3000); }
              }}
            />
            <div style={{ textAlign: "center", marginTop: -6, marginBottom: 24 }}>
              <button className="ghostlink" onClick={() => setDeepOpen(false)}>← Back to the score</button>
            </div>
          </>
        ) : (
          <ScoreReveal r={r} deckCount={cards.length} onOpen={() => setDeepOpen(true)} />
        )}
      </div>
    );
  }

  return (
    <div>
      {phase !== "live" && (
        <>
          <h1 className="h1">Table Topics.<br /><em>No prep, on the clock.</em></h1>
          <p className="sub">
            Spin a topic and speak. The Timer shows green when you qualify and red at the limit — exactly
            like a real meeting.
          </p>
          <Notice mic={mic} />
        </>
      )}

      {phase === "pick" && <LanguageBar mic={mic} />}


      {phase !== "live" && (
        <div className="card">
          <div className={"topic" + (spinning ? " fade" : "")}>{topic || `${pool.length} topics loaded. Spin for one.`}</div>
          {!topic ? (
            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn go" style={{ width: "100%" }} onClick={spin} disabled={spinning}>
                {spinning ? "Spinning…" : "Spin for a topic"}
              </button>
            </div>
          ) : (
            <>
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn go" style={{ width: "100%" }} onClick={record} disabled={spinning}>
                  <span><Icon name="mic" size={18} /> Speak {slot.label}</span>
                </button>
              </div>
              <div className="row" style={{ marginTop: 10, gap: 14 }}>
                <button className="ghostlink" onClick={spin} disabled={spinning}>{spinning ? "Spinning…" : "Respin"}</button>
              </div>
            </>
          )}
        </div>
      )}

      {phase !== "live" && (
        <div className="card tight">
          <div className="eye" style={{ marginBottom: 8 }}>Speech length</div>
          <div className="seg2">
            {SLOTS.map((s) => (
              <button key={s.id} data-on={slotId === s.id ? "1" : "0"} onClick={() => setSlotId(s.id)}>{s.label}</button>
            ))}
          </div>
          <p className="ex" style={{ marginTop: 8 }}>
            {slot.name} — {slot.blurb} Green at {fmt(slot.green)}, amber {fmt(slot.amber)}, red {fmt(slot.red)}.
          </p>

          <div className="eye" style={{ marginTop: 16, marginBottom: 8 }}>Topic pool</div>
          <div className="row">
            {cats.map((c) => (
              <button key={c} className="chip" data-on={cat.includes(c) ? "1" : "0"} onClick={() => toggle(c)}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {phase === "live" && (
        <RecordingScreen
          title="Table Topics"
          elapsed={watch.t}
          totalLabel={slot.label}
          mic={mic}
          onStop={() => finish()}
          onBack={() => { mic.stop(); watch.stop(); watch.reset(); setPhase("pick"); }}
          slot={slot}
        />
      )}

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
      setResult({ used: false, correct: false, verdict: "Nothing came through. Check your microphone and try again.", better: "", grammar: [] });
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
    if (!ok) {
      setResult({ used: false, correct: false, verdict: "Microphone access denied. Please allow microphone access to continue.", better: "", grammar: [] });
      setPhase("result");
      return;
    }
    setMode("mic"); setPhase("live"); watch.start();
  };
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
        {/* its own row, above the card face: as an absolute overlay this sat on
            top of the flip surface, so the card's click handler swallowed the
            tap and "Next word" never fired */}
        {phase !== "live" && (
          <div className="wcard-top">
            <button
              type="button"
              className="ghostlink"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >Next word →</button>
          </div>
        )}
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
            <Grass level={mic.level} live={mic.speaking} />
            <div className="script" style={{ fontSize: 15.5, minHeight: 30 }}>
              {mic.finalText}<span className="interim">{mic.interim}</span>
            </div>
          </>
        )}

        <div className="row" style={{ marginTop: 18 }}>
          {phase === "idle" && <button className="btn go" style={{ flex: 1 }} onClick={record}>Say it in 30s</button>}
          {phase === "live" && <button className="btn leaf" onClick={judge}>Done</button>}
          {phase !== "live" && <button className="btn" onClick={() => setFlipped((v) => !v)}>{flipped ? "Back to the word" : "Flip the card"}</button>}
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
            <button className="btn" onClick={record}>Try again</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="eye">Your bank · {bank.length} of {deck.length}</div>
        {bank.length === 0 ? (
          <div className="emptystate"><Mascot mood="curious" size={78} />
            <span className="ex">Empty so far. Use a word correctly out loud and it lands here.</span></div>
        ) : (
          <div className="row" style={{ marginTop: 10, alignItems: "center" }}>
            <Mascot mood={bank.length >= 6 ? "excited" : "happy"} size={40} />
            <div className="bank" style={{ marginTop: 0, flex: 1 }}>
              {bank.map((w) => <span key={w} className="seed">{w}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================= CLUB ================================== */
/* Home screen: tropical-island "mission control" — hero CTA, palm-tree
   streak, three quick-practice modes, word of the day, stats, and the
   7-day Island Challenge. All illustrations below are hand-drawn SVG
   placeholders (see swap notes at the end of the design task) — drop real
   art into /public/images/home/ and swap the <Xxx Art /> internals when
   it's ready; every call site (art props, ShellArt, etc.) stays the same. */

const CLUB_CSS = `
@keyframes clubWaveDrift{0%{transform:translateX(0)}100%{transform:translateX(-25%)}}
@keyframes clubFoamPulse{0%,100%{opacity:.55}50%{opacity:.9}}
.pro-card{position:relative;overflow:hidden;border-radius:var(--r-card,26px);
  background:linear-gradient(150deg,#2E6F86 0%,#3E8FAD 46%,#5FAECB 100%);
  box-shadow:0 18px 44px rgba(16,72,92,.28)}
.pro-glow{position:absolute;top:-40%;right:-14%;width:230px;height:230px;border-radius:50%;
  background:radial-gradient(circle,rgba(255,255,255,.30),transparent 66%);pointer-events:none}
.pro-body{position:relative;z-index:1;padding:22px 20px 20px}
.pro-eye{display:inline-block;font-family:var(--bod);font-weight:800;font-size:10px;letter-spacing:.2em;
  text-transform:uppercase;color:#2E6F86;background:#F2C14E;border-radius:999px;padding:4px 11px}
.pro-head{margin-top:12px;font-family:var(--dis);font-weight:800;font-size:22px;line-height:1.18;color:#fff}
.pro-list{margin:13px 0 0;padding:0;list-style:none}
.pro-list li{position:relative;padding-left:22px;margin-bottom:7px;font-size:13.5px;line-height:1.5;
  color:rgba(255,255,255,.9)}
.pro-list li::before{content:"";position:absolute;left:3px;top:7px;width:9px;height:5px;
  border-left:2px solid #F2C14E;border-bottom:2px solid #F2C14E;transform:rotate(-45deg)}
.pro-cta{width:100%;margin-top:16px;border:none;border-radius:999px;padding:14px 20px;cursor:pointer;
  background:#fff;color:#2E6F86;font-family:var(--bod);font-weight:800;font-size:15px;
  box-shadow:0 8px 20px rgba(16,72,92,.26);transition:transform .2s,box-shadow .2s}
.pro-cta:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 26px rgba(16,72,92,.34)}
.pro-cta:active:not(:disabled){transform:scale(.98)}
.pro-cta:disabled{opacity:.65;cursor:default}
.pro-err{margin:10px 0 0;font-size:12.5px;line-height:1.5;color:#FFD9CF}
@keyframes clubPalmSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes clubBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes clubRipple{0%{box-shadow:0 0 0 0 rgba(10,158,196,.35)}100%{box-shadow:0 0 0 18px rgba(10,158,196,0)}}
.club-wave{animation:clubWaveDrift 9s linear infinite alternate}
.club-wave-front{animation-duration:6.5s}
.club-foam{animation:clubFoamPulse 3.4s ease-in-out infinite}
.club-turtle{animation:clubBob 4.5s ease-in-out infinite}
.club-palm-sway{transform-origin:bottom center;animation:clubPalmSway 3.2s ease-in-out infinite}
.club-cta:active{animation:clubRipple .5s ease-out}
.club-shell-pop:hover .club-shell-art{transform:scale(1.08) rotate(-4deg)}
.club-shell-art{transition:transform .3s cubic-bezier(.2,.9,.3,1)}
@media (prefers-reduced-motion: reduce){.club-wave,.club-foam,.club-turtle,.club-palm-sway{animation:none}}
`;

/* ---- illustration placeholders (swap for real art later; see notes) ---- */

/* turtle-hero.png is a square studio shot (opaque background, not a cutout),
   so it's framed as a badge rather than floated free over the wave. */
function HeroTurtleArt({ className }) {
  return (
    <img src="/images/home/turtle-hero.png" alt="Yap the turtle waving with a microphone" className={`object-contain drop-shadow-lg ${className || ""}`} />
  );
}

function WaveDecor() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-20 overflow-hidden" aria-hidden="true">
      <svg className="club-wave absolute bottom-0 left-0 h-16 w-[220%] text-ocean-blue/35" viewBox="0 0 800 80" preserveAspectRatio="none">
        <path d="M0,40 C100,10 200,60 300,40 C400,20 500,60 600,40 C700,20 800,50 800,40 L800,80 L0,80 Z" fill="currentColor" />
      </svg>
      <svg className="club-wave club-wave-front absolute bottom-0 left-0 h-11 w-[220%] text-lagoon/70" viewBox="0 0 800 80" preserveAspectRatio="none">
        <path d="M0,50 C100,30 200,60 300,45 C400,30 500,65 600,45 C700,25 800,55 800,45 L800,80 L0,80 Z" fill="currentColor" />
      </svg>
      <div className="club-foam absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white/95 to-white/0" />
    </div>
  );
}

function ShellPearlArt({ className }) {
  return <img src="/images/home/shell-pearl.png" alt="" className={`club-shell-art object-contain ${className || ""}`} />;
}

function ShellArt({ state, size = 26 }) {
  const src = state === "done" ? "/images/home/shell-done.png" : state === "today" ? "/images/home/shell-today.png" : "/images/home/shell-future.png";
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`object-contain ${state === "today" ? "club-turtle" : ""}`}
    />
  );
}

function CoconutArt({ className }) {
  return <img src="/images/home/coconut-coins.png" alt="" className={`object-contain ${className || ""}`} />;
}

function ChestArt({ className }) {
  return <img src="/images/home/treasure-chest.png" alt="" className={`object-contain ${className || ""}`} />;
}

function SpeakerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      <path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function MicIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0014 0" />
      <path d="M12 19v3" />
    </svg>
  );
}
function StarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.2l7.1-.6z" />
    </svg>
  );
}
function ClockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function QuickModeCard({ title, blurb, onClick, img }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex min-h-[160px] flex-col overflow-hidden rounded-[22px] border border-white/50 text-left shadow-[0_12px_28px_rgba(10,158,196,.10)] transition active:scale-[.97]"
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/25" />
      <div className="relative flex flex-1 flex-col justify-end p-4">
        {/* "Vocabulary" is a single long word: in a narrow column it cannot wrap,
            so it used to overflow and clip. Scale with the column and allow a
            break rather than truncating the label. */}
        <div
          className="font-[var(--dis)] font-bold leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,.4)]"
          style={{ fontSize: "clamp(15px, 4.6vw, 20px)", hyphens: "auto", overflowWrap: "anywhere" }}
          lang="en"
        >{title}</div>
        <div
          className="mt-1 leading-snug text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,.3)]"
          style={{ fontSize: "clamp(11.5px, 3.2vw, 14px)", paddingRight: 30 }}
        >{blurb}</div>
        <span className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition group-active:scale-90">
          <Icon name="arrow" size={14} />
        </span>
      </div>
    </button>
  );
}

function StatPill({ icon, value, label, tone }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/50 bg-white/55 py-3.5 shadow-[0_10px_24px_rgba(10,158,196,.08)] backdrop-blur-xl">
      <span className={tone}>{icon}</span>
      <div className="font-[var(--dis)] text-[18px] font-extrabold leading-none text-ink">{value}</div>
      <div className="text-[9.5px] font-semibold uppercase tracking-[.08em] text-ink/50">{label}</div>
    </div>
  );
}

function Club({ days, setDays, active, setActive, stats, agenda, go, wotd, lib, profile, replay, startWithRandomTopic }) {
  const { user, profile: authProfile } = useAuth();
  const isPro = authProfile?.plan === "paid";
  const { upgrade, paying, payError } = useUpgrade({ email: user?.email });
  const plan = PLANS.find((p) => p.id === active) || PLANS[1];
  const challenge = PLANS.find((p) => p.id === 7) || PLANS[0];
  const onChallenge = active === challenge.id;

  // Use backend streak data if available, fallback to localStorage days
  const backendStreak = authProfile?.streak || 0;
  const localStreak = days.length;
  const actualStreak = backendStreak > 0 ? backendStreak : localStreak;

  const challengeDays = onChallenge ? days : [];
  const challengeEarned = Math.min(actualStreak, 7) * challenge.back;
  const challengeRemaining = Math.max(0, challenge.fee - challengeEarned);

  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? "Good morning" : timeOfDay < 17 ? "Good afternoon" : "Good evening";
  const rawName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "";
  const firstName = (rawName.split("@")[0].split(" ")[0] || "there").trim();


  // Palm images mapped to height progression: seed → sprout → small → medium → tall
  const palmImages = [
    "/images/home/palm-seed.png",      // Day 1
    "/images/home/palm-spourt.png",    // Day 2
    "/images/home/palm-small.png",     // Day 3
    "/images/home/plam-medium.png",    // Day 4
    "/images/home/palm-tall.png",      // Day 5+
  ];
  // Rendered HEIGHTS, not box sizes. The art is bottom-aligned on a shared
  // baseline and the width follows the aspect ratio, so a tall palm actually
  // looks tall — forcing every stage into the same square made a seed and a
  // full tree draw at nearly the same height.
  const palmSizes = [22, 34, 48, 62, 76];

  // Map streak to appropriate palm stage for 7-day challenge
  const getPalmStage = (dayNum) => {
    if (dayNum > actualStreak) return 0; // future days = seed
    if (dayNum <= 1) return 0; // day 1 = seed
    if (dayNum <= 2) return 1; // day 2 = sprout
    if (dayNum <= 3) return 2; // day 3 = small
    if (dayNum <= 4) return 3; // day 4 = medium
    return 4; // day 5+ = tall
  };

  const speakWord = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(wotd.w);
    u.lang = "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [wotd.w]);

  return (
    <div className="space-y-5 pb-2">
      <style>{CLUB_CSS}</style>

      {/* HERO MISSION CARD */}
      <section className="relative overflow-hidden rounded-card border border-white/50 bg-gradient-to-b from-foam/95 to-lagoon/30 shadow-[0_20px_60px_rgba(10,158,196,.12)] backdrop-blur-xl">
        {/* Side-by-side only once there is room for it: at phone widths a fixed
            176px turtle left the copy a sliver of a column, breaking the
            headline one word per line. Below sm it stacks instead. */}
        <div className="relative z-10 flex flex-col items-center gap-3 p-6 pb-16 text-center sm:flex-row sm:items-end sm:gap-4 sm:p-7 sm:pb-20 sm:text-left">
          <div className="club-turtle shrink-0">
            <HeroTurtleArt className="h-32 w-32 drop-shadow-[0_12px_20px_rgba(10,158,196,.25)] sm:h-52 sm:w-52" />
          </div>
          <div className="w-full min-w-0 flex-1 pb-2">
            <p className="m-0 text-[14.5px] font-semibold text-ink/80">{greeting}, {firstName}! 👋</p>
            <p className="mb-0 mt-2 text-[11px] font-bold uppercase tracking-[.14em] text-deep-ocean">~ Today&apos;s Mission ~</p>
            <h1 className="mb-0 mt-1 font-[var(--dis)] font-extrabold leading-[1.05] tracking-tight text-ink"
              style={{ fontSize: "clamp(26px, 7.4vw, 34px)", textWrap: "balance" }}>
              Speak for 60 seconds
            </h1>
            <p className="mb-5 mt-2 text-[13px] text-ink/70">~ One take. One step closer. 🌊</p>
            <button
              onClick={() => {
                // Pick a random topic from Table Topics
                const defaultTopics = TOPICS["Table Topics"] || [];
                const randomTopic = defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
                startWithRandomTopic(randomTopic);
              }}
              className="club-cta inline-flex items-center gap-2 rounded-btn bg-deep-ocean px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(8,126,164,.4)] transition active:scale-[.97]"
            >
              Start Speaking
              <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
        <WaveDecor />
      </section>

      {/* QUICK MODE ROW */}
      <section className="grid grid-cols-3 gap-3">
        <QuickModeCard title="Vocabulary" blurb="Word practice, one at a time." onClick={() => go("vocab")} img="/images/home/meeting-beach.png" />
        <QuickModeCard title="Table Topics" blurb="Think fast. Speak smart." onClick={() => go("topics")} img="/images/home/dice-slpash.png" />
        <QuickModeCard title="Debate" blurb="Pick a side. Defend it well." onClick={() => go("debate")} img="/images/home/surf-vs.png" />
      </section>

      {/* WORD OF THE DAY */}
      <section className="club-shell-pop flex items-center gap-3 rounded-card border border-white/50 bg-white/55 p-4 shadow-[0_16px_40px_rgba(10,158,196,.08)] backdrop-blur-xl">
        <button onClick={speakWord} className="shrink-0" aria-label={`Play pronunciation of ${wotd.w}`}>
          <ShellPearlArt className="h-11 w-11" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-bold uppercase tracking-[.12em] text-ink/50">Word of the Day</div>
          <div className="flex items-center gap-2">
            <span className="font-[var(--dis)] text-[19px] font-extrabold text-ink">{wotd.w}</span>
            <button onClick={speakWord} aria-label="Play pronunciation" className="text-ink/40 transition hover:text-deep-ocean">
              <SpeakerIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button onClick={() => go("vocab")} className="shrink-0 text-[13px] font-bold text-deep-ocean underline decoration-2 underline-offset-2">
          Explore →
        </button>
      </section>

      {/* STATS ROW */}
      <section className="grid grid-cols-3 gap-3">
        <StatPill icon={<MicIcon className="h-5 w-5" />} value={stats.reps} label="Speeches" tone="text-ocean-blue" />
        <StatPill icon={<StarIcon className="h-5 w-5" />} value={stats.xp} label="Points" tone="text-gold" />
        <StatPill icon={<ClockIcon className="h-5 w-5" />} value={`${Math.round(stats.seconds / 60)}m`} label="Mic Time" tone="text-palm-green" />
      </section>

      {/* UPGRADE — only for signed-in free users; PRO members see nothing */}
      {user && !isPro && (
        <section className="pro-card">
          <div className="pro-glow" aria-hidden="true" />
          <div className="pro-body">
            <div className="pro-eye">Yap PRO</div>
            <div className="pro-head">Unlimited speeches,<br />every mode open.</div>
            <ul className="pro-list">
              <li>Unlimited speeches and evaluations</li>
              <li>Debate mode with research briefs</li>
              <li>Full history and progress tracking</li>
            </ul>
            <button className="pro-cta" onClick={upgrade} disabled={paying}>
              {paying ? "Opening payment…" : "Upgrade — ₹199/month"}
            </button>
            {payError && <p className="pro-err">{payError}</p>}
          </div>
        </section>
      )}

      {/* ISLAND CHALLENGE */}
      <section className="relative overflow-hidden rounded-card border border-white/50 bg-gradient-to-b from-warm-sand/70 to-foam/50 p-5 shadow-[0_16px_40px_rgba(10,158,196,.1)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="m-0 font-[var(--dis)] text-[18px] font-bold text-ink">🌴 7-Day Island Challenge</h2>
            <p className="mb-0 mt-1 text-[12.5px] text-ink/60">Day {actualStreak} of 7 · Speak daily. Earn rewards.</p>
          </div>
          {actualStreak > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-btn bg-palm-green px-3 py-1 text-[11px] font-bold text-white">● Active</span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-btn bg-ink/10 px-3 py-1 text-[11px] font-bold text-ink/60">Not started</span>
          )}
        </div>

        <div className="mt-5 flex items-end justify-center gap-2" style={{ minHeight: 96 }}>
          {Array.from({ length: 7 }, (_, i) => i + 1).map((d) => {
            const stageIdx = getPalmStage(d);
            const isDone = d <= actualStreak;
            const isToday = d === actualStreak + 1 && actualStreak < 7;
            const palmSrc = palmImages[stageIdx];
            const palmSize = palmSizes[stageIdx];

            return (
              <div key={d} className="flex flex-1 flex-col items-center justify-end gap-1">
                <img
                  src={palmSrc}
                  alt=""
                  style={{ height: palmSize, width: "auto", maxWidth: "100%" }}
                  className={`object-contain object-bottom ${isDone ? "opacity-100" : "opacity-50"}`}
                />
                <span className={`text-[9px] font-semibold ${isToday ? "text-deep-ocean font-bold" : isDone ? "text-palm-green" : "text-ink/40"}`}>Day {d}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/55 p-3">
          <div className="flex flex-1 items-center gap-2">
            <CoconutArt className="h-8 w-8 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-[10.5px] font-semibold uppercase tracking-wide text-ink/50">Earned back</div>
              <div className="font-[var(--dis)] text-[15px] font-extrabold text-palm-green">₹{challengeEarned}</div>
            </div>
          </div>
          <div className="h-8 w-px shrink-0 bg-ink/10" />
          <div className="flex flex-1 items-center gap-2">
            <ChestArt className="h-8 w-8 shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-[10.5px] font-semibold uppercase tracking-wide text-ink/50">Remaining at risk</div>
              <div className="font-[var(--dis)] text-[15px] font-extrabold text-coral">₹{challengeRemaining}</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (!onChallenge) { setActive(7); setDays([]); }
            // the challenge is a daily speaking drill, so it always opens
            // Table Topics — not wherever the meeting agenda happens to be
            go("topics");
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-btn bg-deep-ocean py-3.5 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(8,126,164,.35)] transition active:scale-[.98]"
        >
          {onChallenge ? "Continue Challenge" : "Start Challenge"}
          <Icon name="arrow" size={18} />
        </button>
      </section>
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
.onb{position:fixed;inset:0;z-index:200;overflow:hidden;background:#1B3A42;color:#F6FBF5;font-family:var(--bod);transition:background 1.3s ease}
.onb[data-dawn="1"]{background:var(--mist);color:var(--ink)}
.onb-sky{position:absolute;inset:-10%;pointer-events:none;z-index:0;transition:opacity .9s ease, transform 1.1s cubic-bezier(.2,.8,.2,1)}
.onb-glow{position:absolute;border-radius:50%;filter:blur(70px);opacity:.4;transition:all 1.2s cubic-bezier(.2,.8,.2,1)}
.g1{width:52vw;height:52vw;background:#FF9F7F;left:-12%;top:6%}
.g2{width:44vw;height:44vw;background:#7EC8E3;right:-14%;top:34%}
.g3{width:38vw;height:38vw;background:#EEDBB8;left:26%;bottom:-12%;opacity:.3}
.onb[data-dawn="1"] .onb-glow{opacity:.3;filter:blur(80px)}
.onb-field{position:absolute;inset:0;pointer-events:none;z-index:0;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.mote{position:absolute;border-radius:50%;background:#FFE3D3;opacity:.2;animation:float 9s ease-in-out infinite alternate}
@keyframes float{to{transform:translate3d(0,-20px,0)}}
.onb-stage{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;max-width:640px;margin:0 auto;padding:16px 24px calc(24px + env(safe-area-inset-bottom))}
.onb-top{display:flex;align-items:center;gap:12px;padding:6px 0 2px;flex:0 0 auto}
.onb-back{border:none;background:none;color:inherit;font-size:20px;cursor:pointer;padding:6px 8px 6px 0;opacity:.75}
.onb-back:disabled{opacity:0;pointer-events:none}
.pips{display:flex;gap:5px;flex:1}
.pip{height:3px;flex:1;border-radius:99px;background:rgba(246,251,245,.2);transition:background .4s}
.onb[data-dawn="1"] .pip{background:rgba(31,79,91,.14)}
.pip[data-on="1"]{background:#FF9F7F}
.pip[data-on="2"]{background:#F6FBF5}
.onb[data-dawn="1"] .pip[data-on="1"]{background:var(--ocean)}
.onb-skip{border:none;background:none;color:inherit;opacity:.6;font-size:12.5px;cursor:pointer;font-family:var(--bod);font-weight:600;letter-spacing:.06em}
.onb-body{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;overflow-y:auto;padding:8px 0;scrollbar-width:none;gap:2px}
.onb-body::-webkit-scrollbar{display:none}
.onb-foot{flex:0 0 auto;padding-top:16px}
.onb-h{font-family:var(--dis);font-size:clamp(28px,7.6vw,42px);line-height:1.08;letter-spacing:-.02em;margin:0 0 14px;font-weight:700;text-wrap:balance}
.onb-h em{font-style:normal;color:#FF9F7F}
.onb[data-dawn="1"] .onb-h em{color:var(--coral)}
.onb-p{font-size:16px;line-height:1.6;opacity:.78;max-width:34ch;margin:0 0 8px;text-wrap:pretty}
.onb-kicker{font-family:var(--bod);font-weight:700;font-size:10px;letter-spacing:.18em;text-transform:uppercase;opacity:.55;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.wfade{display:inline-block;opacity:0;transform:translateY(10px);animation:wf .55s forwards}
@keyframes wf{to{opacity:1;transform:none}}
.onb-btn{width:100%;border:none;border-radius:999px;padding:16px 24px;font-size:16px;font-weight:700;background:#FF9F7F;color:#1B3A42;cursor:pointer;font-family:var(--bod);transition:.2s cubic-bezier(.2,.9,.3,1);box-shadow:0 10px 26px rgba(255,159,127,.28);position:relative;overflow:hidden}
.onb-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 30px rgba(255,159,127,.32)}
.onb-btn:active:not(:disabled){transform:translateY(0)}
.onb-btn:disabled{opacity:.35;cursor:not-allowed;box-shadow:none}
.onb-btn.ghost{background:transparent;color:inherit;border:1px solid rgba(246,251,245,.3);box-shadow:none;font-weight:600}
.onb[data-dawn="1"] .onb-btn{background:var(--coral);color:#fff;box-shadow:0 12px 28px rgba(255,159,127,.3)}
.onb-hint{font-family:var(--bod);font-size:11px;opacity:.5;text-align:center;margin-top:10px}
/* fear cards */
.fears{display:flex;gap:10px;margin:6px 0 18px}
.fear{flex:1;border:1px solid rgba(246,251,245,.18);border-radius:20px;padding:18px 10px;text-align:center;background:rgba(246,251,245,.04);animation:rise .6s cubic-bezier(.2,.9,.35,1) both}
.fear svg{opacity:.6;margin-bottom:8px}
.fear b{display:block;font-size:13.5px;font-weight:600}
/* selectable pods — the floating multi-select */
.pods{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:6px 0 4px}
.pod{border:1px solid rgba(246,251,245,.22);background:rgba(246,251,245,.05);color:inherit;border-radius:999px;padding:13px 18px;font-size:14.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:var(--bod);transition:transform .3s cubic-bezier(.2,.9,.3,1), background .25s, border-color .25s, box-shadow .3s;animation:podin .5s cubic-bezier(.2,.9,.35,1) both;position:relative}
@keyframes podin{from{opacity:0;transform:translateY(14px)}}
.pod:hover{border-color:rgba(246,251,245,.4)}
.pod[data-on="1"]{background:#FF9F7F;color:#1B3A42;border-color:#FF9F7F;font-weight:700;transform:translateY(-2px);box-shadow:0 10px 22px rgba(255,159,127,.28)}
.pod.sq{border-radius:16px}
.pod.cap{border-radius:999px;padding:11px 22px}
.pod i{font-style:normal;font-size:15px;opacity:.8}
.pod[data-on="1"] i{opacity:1}
.count{font-family:var(--bod);font-size:11px;opacity:.55;text-align:center;margin-top:14px}
/* the timer bloom */
.ring-wrap{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:14px 0 6px}
.ring2{position:relative;display:grid;place-items:center;color:var(--ink)}
.ring2 svg{position:absolute;inset:0;transform:rotate(-90deg);animation:ringin 1.1s cubic-bezier(.2,.8,.2,1) both}
@keyframes ringin{from{opacity:0;transform:rotate(-90deg) scale(.9)}}
.ring2-core{position:relative;z-index:1;display:grid;place-items:center;animation:corein .7s .18s cubic-bezier(.2,.9,.35,1) both}
@keyframes corein{from{opacity:0;transform:scale(.75)}}
.ring2-num{font-family:var(--bod);font-weight:800;font-size:40px;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.ring2-cap{font-family:var(--bod);font-weight:700;font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.5;margin:16px 0 0;text-align:center}
.micmark{display:grid;place-items:center;color:var(--ink)}
.micmark.live{animation:breathe 2.8s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:scale(1);opacity:.92}50%{transform:scale(1.05);opacity:1}}
/* live waveform */
.wave{display:flex;gap:3px;align-items:center;justify-content:center;height:56px;margin:14px 0 6px}
.wbar{width:5px;border-radius:99px;background:#FF9F7F;min-height:5px;transition:height .07s linear,background .3s}
.wbar.dim{background:rgba(246,251,245,.2)}
/* transcript preview */
.otxt{font-size:16px;line-height:1.8;max-height:150px;overflow-y:auto;opacity:.92;border-left:2px solid rgba(255,159,127,.4);padding-left:14px;margin:8px 0}
.otxt .fil{background:rgba(255,159,127,.28);border:none;border-radius:4px;padding:0 3px;color:inherit}
.otxt .hed{background:rgba(238,219,184,.32);border:none;border-radius:4px;padding:0 3px;color:inherit;font-style:italic}
/* baseline result */
.bmet{display:flex;gap:9px;flex-wrap:wrap;margin:4px 0 12px}
.bm{flex:1 1 78px;border:1px solid rgba(246,251,245,.18);border-radius:18px;padding:14px 6px;text-align:center;background:rgba(246,251,245,.04);animation:rise .5s cubic-bezier(.2,.9,.35,1) both}
.bm b{display:block;font-family:var(--dis);font-weight:700;font-size:26px;line-height:1;font-variant-numeric:tabular-nums}
.bm span{font-family:var(--bod);font-weight:700;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;opacity:.6}
.focusrow{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.ftag{font-family:var(--bod);font-weight:600;font-size:11px;border:1px solid rgba(255,159,127,.55);color:#FF9F7F;border-radius:999px;padding:5px 11px}
.onb[data-dawn="1"] .ftag{border-color:var(--coral);color:var(--coral-deep)}
/* the final bloom — sunrise ripple */
.bloom{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
.bloom span{position:absolute;border-radius:50%;border:2px solid rgba(255,159,127,.5);animation:bloomout 1.6s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes bloomout{from{width:20px;height:20px;opacity:.9}to{width:200vmax;height:200vmax;opacity:0}}
.orbit{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:16px 0 4px}
.orbit span{font-family:var(--dis);font-size:19px;opacity:0;animation:drawin .7s cubic-bezier(.2,.9,.3,1) forwards}
@keyframes drawin{from{opacity:0;transform:translateY(12px)}to{opacity:.9;transform:none}}
.pod:active{transform:scale(.97)}
.pod[data-on="1"]:active{transform:translateY(-2px) scale(.99)}
.onb-btn:focus-visible,.onb-back:focus-visible,.onb-skip:focus-visible,.pod:focus-visible{outline:3px solid #FF9F7F;outline-offset:3px}
.onb-btn>span{display:inline-flex;align-items:center;gap:8px}
.onb-kicker::after{content:"";height:1px;flex:1;background:currentColor;opacity:.2}
@media (prefers-reduced-motion:reduce){
  .onb *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;

const GOALS = [
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
            stroke={live ? "#FF9F7F" : "#7EC8E3"} strokeWidth="3.2" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - Math.max(0, Math.min(1, pct)))}
            style={{ transition: "stroke-dashoffset .35s cubic-bezier(.3,.9,.3,1)", filter: "drop-shadow(0 0 6px rgba(126,200,227,.35))" }} />
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
      <b style={{ color: value > 65 ? "#7BAE8F" : value > 40 ? "#C99A4B" : "#E8674A" }}>{n}</b>
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
              style={{ background: "rgba(246,251,245,.06)", color: "inherit", borderColor: "rgba(246,251,245,.22)" }}
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
          The club is open. Word of the day, one table topic, and a debate when you're ready
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
            <p className="ex" style={{ fontFamily: "var(--bod)", fontSize: 12 }}>
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
  { id: "club", label: "Meeting", icon: "\u{1F3DD}\uFE0F", color: "#7EC8E3", glow: "126,200,227" },
  { id: "topics", label: "Table Topics", icon: "\u{1F3B2}", color: "#FF9F7F", glow: "255,159,127" },
  { id: "debate", label: "Debate", icon: "\u{1F525}", color: "#E8674A", glow: "232,103,74" },
  { id: "vocab", label: "Vocabulary", icon: "\u{1F4DA}", color: "#7BAE8F", glow: "123,174,143" },
];

export default function Yap() {
  return <Boundary><YapApp /></Boundary>;
}

function YapApp() {
  const navRef = useRef(null);
  const tabRefs = useRef({});
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const [tab, setTab] = useState("club");
  const [days, setDays] = usePersisted("days", []);
  const [active, setActive] = usePersisted("plan", 14);
  const [stats, setStats] = usePersisted("stats", { xp: 0, reps: 0, seconds: 0 });
  // the agenda is per-day: yesterday's ticks shouldn't count as today's meeting
  const [agendaRaw, setAgendaRaw] = usePersisted("agenda", { day: todayKey(), vocab: false, topic: false });
  const agenda = agendaRaw.day === todayKey() ? agendaRaw : { day: todayKey(), vocab: false, topic: false };
  const setAgenda = useCallback((fn) => setAgendaRaw((prev) => {
    const base = prev.day === todayKey() ? prev : { day: todayKey(), vocab: false, topic: false };
    return { ...(typeof fn === "function" ? fn(base) : fn), day: todayKey() };
  }), [setAgendaRaw]);
  const [lib] = useState(() => loadLibrary());
  const [profile, setProfile] = useState(() => loadProfile());
  const [intro, setIntro] = useState(() => !loadProfile().done);
  const wotd = useMemo(() => wordOfTheDay(lib.words), [lib.words]);
  const mic = useMic();
  const [preselectedTopic, setPreselectedTopic] = useState(null);

  // stop any live stream when the tab changes, without capturing the whole hook
  const micStop = useRef(mic.stop); micStop.current = mic.stop;
  useEffect(() => { micStop.current(); }, [tab]);

  // stash the newest transcript so the error boundary can rescue it
  useEffect(() => {
    if (mic.finalText && mic.finalText.trim().length > 20) writeStore("lastTranscript", mic.finalText.trim());
  }, [mic.finalText]);

  // Update slider position when tab changes
  useEffect(() => {
    const activeTabEl = tabRefs.current[tab];
    const navEl = navRef.current;
    if (activeTabEl && navEl) {
      const navRect = navEl.getBoundingClientRect();
      const tabRect = activeTabEl.getBoundingClientRect();
      setSliderStyle({
        left: tabRect.left - navRect.left,
        width: tabRect.width,
      });
    }
  }, [tab]);

  // every xp award in the app funnels through here, so this is the one place
  // the celebration has to be wired up
  const [burst, setBurst] = useState(null);
  const onFinish = useCallback(({ xp, seconds, kind }) => {
    setStats((s) => ({ xp: s.xp + xp, reps: s.reps + 1, seconds: s.seconds + seconds }));
    setAgenda((a) => ({ ...a, [kind === "topic" ? "topic" : "vocab"]: true }));
    setDays((v) => (v.length < active ? [...v, v.length + 1] : v));
    if (xp > 0) setBurst({ amount: xp, key: Date.now() });
  }, [active, setStats, setAgenda, setDays]);


  // Bottom nav hides on scroll down, reappears on scroll up
  const [navHidden, setNavHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last;
        // ignore jitter, and always show when near the top or at the very bottom
        if (Math.abs(delta) > 6) {
          const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 24;
          setNavHidden(delta > 0 && y > 80 && !atBottom);
          last = y;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Detect if we're in recording mode (RecordingScreen sets window.__yapRecording when mounted)
  const [isRecording, setIsRecording] = useState(false);
  useEffect(() => {
    const check = () => setIsRecording(!!window.__yapRecording);
    const timer = setInterval(check, 100);
    check();
    return () => clearInterval(timer);
  }, []);

  if (intro) {
    return (
      <div className="grdn">
        <style>{CSS}</style><style>{ONB_CSS}</style>
        <OnboardingFlow mic={mic} onDone={(p) => { setProfile(p); setIntro(false); mic.stop(); }} />
      </div>
    );
  }

  return (
    <div className="grdn relative" style={{ backgroundImage: `url(${isRecording ? "/images/home/voice-record-bg.png" : "/images/home/background.png"})`, backgroundSize: "cover", backgroundAttachment: "fixed", backgroundPosition: "top", minHeight: "100vh" }}>
      <style>{CSS}</style><style>{ONB_CSS}</style><style>{DEBATE_CSS}</style>
      {!isRecording && (
      <header className="top" style={{ 
        background: "rgba(255,255,255,0.65)", 
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderRadius: "0", 
        padding: "6px 0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "none",
        borderBottom: "1px solid var(--line)",
        position: "relative",
        width: "100%",
        zIndex: "100"
      }}>
        <div style={{ 
          width: "100%", 
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        }}>
          <div className="mark" style={{ margin: 0, marginRight: "auto" }}>
            <img src="/images/yap_logo.png" alt="Yap" className="yap-logo" style={{ height: '46px' }} />
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            padding: "2px 14px 2px 10px"
          }}>
            <Mascot mood={stats.reps >= 10 ? "cool" : stats.reps >= 3 ? "wave" : "curious"} size={26} />
            <div><b>{stats.reps}</b> <small>speeches</small></div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <AuthBar />
          </div>
        </div>
      </header>
      )}
      <div className="wrap relative z-10" style={{ paddingTop: "24px" }}>


        <div className="panel" key={tab} role="tabpanel" aria-label={(TABS.find((t) => t.id === tab) || {}).label}>
        {tab === "club" && <Club days={days} setDays={setDays} active={active} setActive={setActive}
          stats={stats} agenda={agenda} go={setTab} wotd={wotd} lib={lib}
          profile={profile} replay={() => setIntro(true)} 
          startWithRandomTopic={(topic) => { setPreselectedTopic(topic); setTab("topics"); }} />}
        {tab === "debate" && <DebateMode mic={mic} onFinish={onFinish} lib={lib} profile={profile} />}
        {tab === "topics" && <TableTopics mic={mic} onFinish={onFinish} wotd={wotd} lib={lib} profile={profile} go={setTab} preselectedTopic={preselectedTopic} clearPreselected={() => setPreselectedTopic(null)} />}
        {tab === "vocab" && <Vocabulary mic={mic} onFinish={onFinish} wotd={wotd} lib={lib} />}
        </div>

        <p className="ex" style={{ textAlign: "center", padding: "22px 0 0" }}>
          Yap Beta access August 2026 · Yap &copy; 2026
        </p>
      </div>
      {burst && (
        <PointsBurst key={burst.key} amount={burst.amount} onDone={() => setBurst(null)} />
      )}
      {!isRecording && (
      <div className="navdock" data-hidden={navHidden ? "1" : "0"}>
        <nav className="nav" ref={navRef} role="tablist" aria-label="Meeting sections">
          <div className="nav-slider" style={{ left: `${sliderStyle.left}px`, width: `${sliderStyle.width}px`, "--slide-c": (TABS.find((t) => t.id === tab) || TABS[0]).color, "--slide-g": (TABS.find((t) => t.id === tab) || TABS[0]).glow }} />
          {TABS.map((t) => (
            <button 
              key={t.id} 
              ref={(el) => (tabRefs.current[t.id] = el)}
              role="tab" 
              aria-selected={tab === t.id} 
              className="tab"
              data-on={tab === t.id ? "1" : "0"} 
              onClick={() => setTab(t.id)}
            >
              <span className="tab-ico" aria-hidden="true">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
      )}
    </div>
  );
}