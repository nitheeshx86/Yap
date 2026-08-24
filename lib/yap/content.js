/* ============================================================================
   YAP — content data
   Topics, vocabulary, roles, panel personas and the word lists the analysis
   engine scores against. Pure data: no React, no side effects.
   Extracted verbatim from app/YapApp.jsx.
   ========================================================================== */


export const SLOTS = [
  { id: 60, label: "1 min", name: "Table Topic", green: 30, amber: 45, red: 60, blurb: "Classic Table Topics. Answer, don't ramble." },
  { id: 90, label: "90 sec", name: "Extended topic", green: 45, amber: 65, red: 90, blurb: "Room for a reason and an example." },
  { id: 120, label: "2 min", name: "Opinion piece", green: 60, amber: 90, red: 120, blurb: "Take a side and defend it properly." },
  { id: 300, label: "5 min", name: "Prepared speech", green: 240, amber: 270, red: 300, blurb: "Full speech shape: open, body, close." },
];

export const TOPICS = {
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

export const VOCAB = [
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

export const ROLES = [
  { id: "timer", icon: "timer", name: "The Timer", role: "keeps you honest" },
  { id: "ah", icon: "hand", name: "Ah-Counter", role: "tallies the ums" },
  { id: "gram", icon: "book", name: "Grammarian", role: "catches the slips" },
  { id: "eval", icon: "cap", name: "General Evaluator", role: "the whole picture" },
];

export const PANEL = [
  { id: "kavya", name: "Kavya", color: "#FF9F7F", mood: "focused", role: "Steamroller", brief: "Interrupts, talks long, hates hearing a point twice.", weight: 1.5 },
  { id: "arjun", name: "Arjun", color: "#C99A4B", mood: "thinking", role: "Stat machine", brief: "Quotes numbers and asks you for your denominator.", weight: 1.1 },
  { id: "meera", name: "Meera", color: "#D98E9B", mood: "excited", role: "Tangent", brief: "Pulls the topic sideways to culture and anecdotes.", weight: 1.0 },
  { id: "rohit", name: "Rohit", color: "#7EC8E3", mood: "encouraging", role: "Closer", brief: "Quiet, then summarises better than everyone.", weight: 0.7 },
];

export const BACKUP = {
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

export const MODERATOR = [
  "Let's bring in someone who hasn't spoken yet. Over to you.",
  "You've been quiet — what's your read on this?",
  "Before we move on, let's hear the other side of the table.",
  "Good. Now let's hear from you on this.",
];

export const PLANS = [
  { id: 7, name: "Warm-up", tag: "starter", fee: 199, back: 15, blurb: "One meeting a day. Enough to kill the silence habit." },
  { id: 14, name: "Placement sprint", tag: "most picked", fee: 349, back: 20, blurb: "Six solo days, a full debate every seventh." },
  { id: 30, name: "Full season", tag: "for finals", fee: 599, back: 22, blurb: "Rotating formats, harder panels, a weekly report card." },
];
export const COMMON = new Set(("the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were has had did been being am does says great little own under last long very still might must made find here thing world tell ask try need feel become leave put mean keep let begin seem help talk turn start show hear play run move live believe bring happen write sit stand lose pay meet include continue set learn change lead understand watch follow stop create speak read allow add spend grow open walk win offer remember love consider appear buy wait serve die send expect build stay fall cut reach remain suggest raise pass sell require report decide pull yes okay ok maybe really actually basically money job college student india indian company value point issue problem answer question example reason result system data more many much less fewer better best worse worst always never often sometimes today tomorrow yesterday everyone someone nobody everything something nothing").split(" "));


/* The everyday vocabulary an Indian undergraduate already owns. Using these
   well is fine — but it isn't vocabulary *reach*, so they don't score as range. */
export const BASIC = new Set((
"about above across after again against all almost alone along already also always among angry animal answer any anybody anyone anything anyway anywhere apart appear apple area argue arm around arrive ask attack aunt away baby back bad bag ball bank basic beat beautiful because become bed before begin behind believe below best better between big bird birthday bit black blood blue board boat body book bored born borrow both bottle bottom bought box boy bread break breakfast bring brother brought brown build building burn bus business busy but buy call came camera can cannot car card care careful carry case catch cause centre certain chair chance change cheap check child children choose church city class clean clear climb clock close clothes cloud coffee cold college colour come comfortable common company complete computer condition control cook cool copy corner correct cost could country couple course cover crazy create cross cry cup cut dance danger dark date daughter day dead deal dear decide deep depend describe desk detail did die difference different difficult dinner direction dirty discuss do doctor dog done door double doubt down draw dream dress drink drive drop dry during each ear early earth easy eat egg eight either else empty end enjoy enough enter equal especially even evening ever every everybody everyone everything everywhere exact example except excited expect experience explain eye face fact fail fall family famous far fast father fear feel feet few field fight fill film final find fine finger finish fire first fish five fix floor flower fly follow food foot for force forget form found four free fresh friend from front fruit full fun funny future game garden gave general get gift girl give glad glass go god gold gone good got grade great green ground group grow guess guy had hair half hand happen happy hard has hat hate have head health hear heart heavy help her here hers high hill him himself his hit hold hole holiday home honest honestly hope hospital hot hotel hour house how however huge human hundred hungry hurry hurt idea if ill imagine important improve in inside instead interest into introduce it its itself job join joke journey just keep key kid kill kind king kitchen knew know lady land language large last late later laugh law lead learn leave left leg less lesson let letter level library lie life light like line list listen little live local long look lose lost lot loud love low luck lunch machine made magazine main make man many map market marry match matter may maybe me meal mean meat medicine meet member memory men message met middle might mile milk mind mine minute miss mistake mix modern moment money month moon more morning most mother mountain mouth move movie much music must my myself name near nearly necessary need neighbour neither never new news next nice night nine no nobody noise none nor normal north nose not note nothing notice now number obviously ocean of off offer office often oil okay old on once one only open opinion or orange order other our out outside over own page paint pair paper parent park part party pass past pay peace pen pencil people perfect perhaps period person phone photo pick picture piece place plan plant play please pocket point police poor popular position possible post pot power practice prepare present press pretty price print probably problem process produce program promise proper properly protect proud public pull purpose push put quarter question quick quiet quite radio rain raise rather reach read ready real realise really reason receive recent record red remember remove repeat reply report rest result return rich ride right ring rise river road rock room round rule run sad safe said sale same sat save saw say school science sea season seat second see seem sell send sense sentence separate serious serve service set seven several shall shape share sharp she ship shoe shop short should shoulder shout show shut sick side sign silent silver similar simple since sing single sir sister sit six size skill skin sky sleep slow small smell smile smoke snow so soft some somebody somehow someone something sometimes somewhere son song soon sorry sort sound soup south space speak special speed spell spend sport spring stand star start state station stay step stick still stone stop store story straight strange street strong student study stuff stupid subject succeed such sudden suddenly sugar suggest summer sun supper suppose sure surprise sweet swim table take talk tall taste teach teacher team tell ten test than thank that the their them themselves then there these they thick thin thing think third this those though thought three through throw thus ticket tie time tired to today together told tomorrow tonight too took top total touch toward town train travel tree trip trouble true trust try turn twice two type ugly uncle under understand until up upon us use useful usual usually very village visit voice wait wake walk wall want war warm was wash watch water way we wear weather week weight welcome well went were west wet what when where whether which while white who whole whom whose why wide wife will win wind window wine winter wish with within without woman women wonder wood word work world worry worse worst would write wrong year yellow yes yesterday yet you young your yourself"
).split(" "));

/* Suffixes that mark the register a panel notices. */
export const ACADEMIC = /(tion|sion|ment|ity|ance|ence|ive|ous|ate|ise|ize|able|ible|ism|ist|logy|graphy|cracy|ary|ory)$/;

export const HEDGES = ["kind of", "sort of", "i guess", "i suppose", "maybe", "i think", "probably", "perhaps", "somewhat", "a bit", "a little bit", "i feel like", "or something", "i mean"];
export const HARD_FILLERS = ["um", "uh", "erm", "uhh", "umm", "hmm", "er", "ah", "you know", "matlab"];
export const SOFT_FILLERS = ["like", "actually", "basically", "literally", "so", "well", "right", "okay", "yeah", "just", "na"];
// the actual non-lexical sounds the Ah-Counter role is named for — everything
// else findFillers tags "filler" (you know, matlab, like, so...) is a crutch
// word, not a hesitation sound, and gets shown as its own group
export const AH_SOUNDS = new Set(["um", "umm", "uh", "uhh", "erm", "er", "hmm", "ah"]);

export const STANCE = ["i think", "i believe", "in my view", "in my opinion", "i'd argue", "i would argue", "my view is", "i disagree", "i agree", "the answer is", "yes", "no", "personally"];
export const CONNECT = ["because", "however", "although", "whereas", "therefore", "for example", "for instance", "on the other hand", "that said", "but", "which means", "as a result", "in contrast", "firstly", "secondly", "moreover"];
export const CLOSERS = ["so overall", "to conclude", "in conclusion", "that's why", "in short", "so my point is", "to sum up", "ultimately", "so the answer", "which is why"];
