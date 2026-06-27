export const STEPS = [
  { phase:'Entity & Business', color:'#C9A84C', items:[
    { title:'Form Your LLC', detail:'File Articles of Organization in your state through the Secretary of State website. Choose a name that doesn\'t conflict with existing entities. Pay the filing fee ($50–$500 depending on state). Illinois filers go to ilsos.gov.', links:[{label:'Illinois SOS',url:'https://www.ilsos.gov/departments/business_services/llc.html'}] },
    { title:'Get an EIN', detail:'Apply free at IRS.gov. You\'ll need this to open a business bank account, file taxes as the LLC, and receive royalty payments properly.', links:[{label:'IRS EIN Application',url:'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online'}] },
    { title:'Open a Business Bank Account', detail:'Keep all music revenue separate from personal funds. This protects your LLC status and simplifies royalty accounting.' },
    { title:'Operating Agreement', detail:'Draft an operating agreement — especially critical if the LLC has multiple members (e.g., band or co-producer). This governs how splits are paid out to the LLC and how the LLC distributes internally.' },
  ]},
  { phase:'Metadata Sovereignty (ISRC & UPC Ownership)', color:'#F06292', items:[
    { title:'⚠️ The Distributor Code Trap', detail:'When distributors assign "free" ISRC and UPC codes, their registrant prefix is baked permanently into your metadata — not yours. If you ever switch distributors, you lose continuity: play counts, playlist placements, and algorithmic momentum won\'t transfer. Distributors also pool millions of tracks under their prefixes and capture unclaimed "black box" royalties that belong to you.' },
    { title:'Own Your ISRC Registrant Code', detail:'Apply for your own permanent 3-character Registrant Code at USISRC.org under your LLC name. Once approved, you self-assign ISRCs to every track using the ISRC Registry tab in this app. This ties your catalog to your entity permanently.', links:[{label:'USISRC.org',url:'https://www.usisrc.org'}] },
    { title:'Own Your UPC via GS1 US', detail:'Purchase a Company Prefix from GS1 US. Your LLC name gets permanently tied to the GS1 GEPIR ownership database — every barcode you generate is legally yours.', links:[{label:'GS1 US',url:'https://www.gs1us.org'}] },
    { title:'Understand ISRC vs UPC vs ISWC', detail:'ISRC (12 chars) = unique ID for a specific sound recording. Every version needs its own ISRC. UPC = the barcode on the release package (single, EP, LP). ISWC = the identifier for the underlying composition, assigned by CISAC through your PRO.' },
    { title:'Waterfall Releases: Reuse ISRCs, New UPCs', detail:'When moving a previously released single onto an EP or album, reuse the exact same ISRC for that audio file. This merges stream histories on DSPs. Assign a brand-new UPC to the album package — reusing the single\'s UPC causes ingestion errors.' },
    { title:'Audit Your Existing Catalog', detail:'Use ISRCFinder.com and UPCFinder.com to look up codes already assigned to your tracks and identify distributor-owned vs. self-owned codes.', links:[{label:'ISRCFinder',url:'https://isrcfinder.com'},{label:'UPCFinder',url:'https://upcfinder.com'}] },
    { title:'Register with Luminate & Mediabase', detail:'Once you own your ISRC prefix, register titles natively with Luminate (Billboard charts) and Mediabase (radio airplay). This unlocks chart eligibility and accurate royalty attribution.' },
    { title:'Use Distributor-Sovereign Platforms', detail:'Symphonic Distribution and TooLost cleanly support ingestion of artist-owned ISRCs and UPCs without overwriting your metadata.', links:[{label:'Symphonic',url:'https://symphonicdistribution.com'},{label:'TooLost',url:'https://toolost.com'}] },
  ]},
  { phase:'Copyright Registration', color:'#5B7FA6', items:[
    { title:'Register with the U.S. Copyright Office', detail:'Register each composition (lyrics + melody) and sound recording separately at copyright.gov. File online for $45–$65 per work.', links:[{label:'Copyright.gov',url:'https://www.copyright.gov/registration/'}] },
    { title:'Understand the Two Copyrights', detail:'(1) The Composition — melody and lyrics, owned by the songwriter/publisher. (2) The Sound Recording (Master) — the specific recorded performance. Register BOTH.' },
    { title:'Register Early', detail:'Register within 3 months of publication to be eligible for statutory damages ($750–$150,000 per work) and attorney\'s fees.' },
  ]},
  { phase:'PRO & ISWC Registration', color:'#4CAF7A', items:[
    { title:'Join a PRO', detail:'Choose one: ASCAP, BMI, or SESAC. Register as a songwriter/publisher member AND register your LLC as a publishing entity to capture both the writer\'s share and publisher\'s share of performance royalties.', links:[{label:'ASCAP',url:'https://www.ascap.com/music-creators/join'},{label:'BMI',url:'https://www.bmi.com/creators'},{label:'SESAC',url:'https://www.sesac.com'}] },
    { title:'Register Each Song with Your PRO', detail:'After joining, register every track with its title, ISRC, co-writer splits, and publisher info. This triggers royalty collection and distribution.' },
    { title:'Register Your LLC as Publisher', detail:'This captures the publisher\'s share (50%) of performance royalties on top of your writer\'s share.' },
    { title:'ISWC — The Composition Identifier', detail:'When you register a song with your PRO, CISAC assigns an ISWC (International Standard Musical Work Code) to the composition. This is separate from the ISRC. The ISWC is what collection societies worldwide use to route publishing royalties back to you.' },
  ]},
  { phase:'Mechanical Royalties', color:'#A06DB3', items:[
    { title:'Register with MLC', detail:'The MLC collects mechanical royalties from U.S. digital streaming services (Spotify, Apple Music, etc.). Free to join. Register your songs separately from your PRO.', links:[{label:'The MLC',url:'https://www.themlc.com'}] },
    { title:'Distributor + Mechanical Collection', detail:'Confirm your distributor handles mechanical licensing or register separately with MLC.' },
    { title:'⚠️ The Black Box Royalty Trap', detail:'Collection societies hold massive pools of unclaimed royalties due to messy metadata. After a set period, they redistribute these funds proportionally to top catalog holders. Distributors pooling millions of tracks under their own ISRC prefixes routinely capture this money. Owning your own ISRC prefix routes royalties to you — not the distributor.' },
  ]},
  { phase:'Distribution & Sync', color:'#E88C3A', items:[
    { title:'Choose a Music Distributor', detail:'DistroKid, TuneCore, CD Baby, or AWAL get your music on DSPs. For catalog sovereignty, use Symphonic or TooLost — they support your own ISRC/UPC ingestion.' },
    { title:'Get an ISRC Code for Every Track', detail:'Do NOT rely on distributor-assigned codes. Own your registrant prefix via USISRC.org and track every assignment in the ISRC Registry tab.', links:[{label:'USISRC.org',url:'https://www.usisrc.org'}] },
    { title:'Register for Sync Licensing', detail:'Sync royalties come from TV, film, ads, and games. Register with Musicbed or Artlist, or work with a sync agent. Your LLC owns and licenses the master.' },
  ]},
  { phase:'Neighboring Rights & International', color:'#59BAB5', items:[
    { title:'Collect Neighboring Rights', detail:'Collect through SoundExchange in the US for digital/satellite radio performance royalties paid to master owners.', links:[{label:'SoundExchange',url:'https://www.soundexchange.com'}] },
    { title:'Use Songtrust for Global Collection', detail:'Songtrust registers your songs with 60+ collection societies worldwide for international mechanical royalties.', links:[{label:'Songtrust',url:'https://www.songtrust.com'}] },
  ]},
];
