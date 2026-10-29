/* Bench Bee: Western blot content.
   C = causes, Q = questions, SYMPTOMS = the blot pictures you pick from.
   To add a problem: add its causes to C, its questions to Q, then a symptom entry that points to them. */

/* ---------- causes (shared across symptoms) ---------- */
const C = {
  transfer_fail: { t: "Transfer failed or was poor",
    why: "If the proteins stay in the gel, the antibody has nothing to find on the membrane.",
    check: "Stain the gel with Coomassie after transfer. Protein left in the gel means the transfer is the problem.",
    fix: ["Check the sandwich order: gel on the cathode (black) side, membrane towards the anode (red).", "Activate PVDF in methanol before use.", "Roll out air bubbles between gel and membrane.", "Stain with Ponceau S before blocking so you know the transfer worked."] },
  detect_fail: { t: "Secondary antibody or detection failed",
    why: "Everything upstream can be fine and you still see nothing if the secondary or the substrate is dead.",
    check: "Dot a little secondary onto a scrap of membrane and add ECL. No light means the secondary or the substrate is the problem.",
    fix: ["Match the secondary to the primary's host species (anti-rabbit for a rabbit primary, and so on).", "Keep sodium azide away from anything with HRP. It inhibits the enzyme.", "Use fresh, in-date ECL."] },
  target_low: { t: "Target not expressed or very low",
    why: "The method may be fine and your cells simply don't make much of the protein.",
    check: "Run a positive control lysate known to express the protein.",
    fix: ["Load more protein, for example 30–50 µg of whole-cell lysate.", "Enrich the target with subcellular fractionation or immunoprecipitation.", "Use a more sensitive substrate.", "Check expected expression in your cell type, for example in the Human Protein Atlas."] },
  primary_inactive: { t: "Primary antibody not working",
    why: "Antibodies lose activity with poor storage, and some only recognise native protein, not the denatured form on a blot.",
    check: "Confirm the datasheet lists Western blot as a validated application, then test it on a positive control or a dot blot.",
    fix: ["Aliquot antibodies to avoid repeated freeze–thaw.", "Don't reuse diluted antibody for too long.", "If your sample prep differs from the datasheet (reducing vs non-reducing), follow theirs."] },
  primary_dilute: { t: "Primary too dilute or incubated too briefly",
    why: "Not enough antibody binds to give a strong signal.",
    check: "Repeat with a higher primary concentration overnight at 4 °C.",
    fix: ["Halve the dilution (for example 1:1,000 to 1:500).", "Incubate overnight at 4 °C.", "Use fresh antibody rather than a much-reused dilution."] },
  small_through: { t: "Small protein went through the membrane",
    why: "Proteins under about 15–20 kDa can pass straight through a 0.45 µm membrane.",
    check: "Put a second membrane behind the first and see whether the band turns up there.",
    fix: ["Switch to a 0.2 µm membrane.", "Shorten the transfer time.", "Keep 20% methanol in the transfer buffer to help small proteins bind."] },
  large_transfer: { t: "Big protein didn't transfer well",
    why: "Large proteins leave the gel slowly, and methanol in the transfer buffer makes it worse.",
    check: "Stain the gel with Coomassie after transfer and look for high-MW protein left behind.",
    fix: ["Add a little SDS (around 0.01–0.1%) to the transfer buffer.", "Lower methanol to about 10%.", "Use a longer wet transfer in the cold."] },
  underload: { t: "Too little protein loaded",
    why: "If the loading control is weak too, there simply isn't much protein in the lane.",
    check: "Re-measure protein concentration with BCA or Bradford.",
    fix: ["Load 20–40 µg of lysate.", "Check samples weren't diluted twice by mistake."] },
  stripped: { t: "Protein lost during stripping",
    why: "Every round of stripping removes some protein from the membrane.",
    check: "Compare with a fresh blot of the same samples.",
    fix: ["Probe the weakest target first, before any stripping.", "Use a milder stripping buffer or a shorter stripping time.", "Cut the membrane and probe the pieces separately when the sizes allow."] },
  substrate_old: { t: "Substrate weak or old",
    why: "ECL loses activity over time, especially once the two parts are mixed.",
    check: "Repeat detection on the same blot with fresh substrate.",
    fix: ["Mix ECL fresh, right before use.", "Use enough volume to cover the whole membrane.", "Check the expiry date."] },
  block_mask: { t: "Blocking masks the epitope",
    why: "Heavy or long blocking, especially with milk, can cover the part of the protein the antibody needs.",
    check: "Try BSA, or lower milk to 1–3%, on a duplicate blot.",
    fix: ["Block for about 1 hour, not much longer.", "Dilute antibodies in a weaker blocker."] },
  ab_high: { t: "Antibody concentration too high",
    why: "Too much primary or HRP-secondary gives background, extra bands and burnt-out bands.",
    check: "Run a strip with secondary only, and try the secondary 2–5× more dilute.",
    fix: ["Dilute the primary within the datasheet range.", "HRP secondaries usually work around 1:5,000–1:20,000.", "For a new antibody, titrate primary and secondary together."] },
  block_low: { t: "Blocking not enough",
    why: "Empty spots on the membrane soak up antibody if they aren't covered first.",
    check: "Repeat with fresh 5% milk or BSA for at least 1 h at room temperature.",
    fix: ["Make blocking buffer fresh and dissolve the milk fully.", "Block 1 h at room temperature or overnight at 4 °C.", "Try switching between milk and BSA."] },
  wash_low: { t: "Washing not enough",
    why: "Unbound antibody that isn't washed away reacts with the substrate.",
    check: "Wash the blot again (3 × 10 min TBST) and re-image.",
    fix: ["Use TBST with about 0.1% Tween-20. Much more can strip protein off.", "Wash 3–4 × 5–10 min after both antibodies, with plenty of buffer.", "Keep the membrane moving on a rocker."] },
  expo_high: { t: "Exposure too long or substrate too strong",
    why: "A long exposure or a very sensitive substrate pushes strong bands past what the camera can measure.",
    check: "Use the imager's auto-exposure, or take a series of short exposures.",
    fix: ["Start with exposures of a few seconds.", "Use a standard ECL for abundant proteins and keep high-sensitivity substrates for weak targets.", "Drain excess substrate before imaging."] },
  dry: { t: "Membrane dried out",
    why: "Once a membrane dries, antibody binds to it unevenly and won't wash off.",
    check: "Dark or blotchy areas at the edges or corners point to drying.",
    fix: ["Keep the membrane covered in liquid at every step.", "Use enough volume to cover it fully on the rocker."] },
  phospho_milk: { t: "Phospho-antibody used with milk",
    why: "Milk contains casein, a phosphoprotein, which phospho-specific antibodies can pick up.",
    check: "Repeat with 5% BSA in TBST for blocking and antibody dilution.",
    fix: ["Use BSA instead of milk for phospho-specific antibodies.", "Use TBS-based buffers rather than PBS for phospho detection."] },
  buffers_contam: { t: "Old or contaminated buffers",
    why: "Bacteria, particles or old reagents in buffers stick to the membrane.",
    check: "Make every buffer fresh and compare.",
    fix: ["Make blocking and wash buffers fresh.", "Filter buffers that look cloudy.", "Clean trays and tanks well."] },
  agg_secondary: { t: "Aggregated secondary antibody",
    why: "Clumps of HRP-secondary stick to the membrane and light up as dark dots.",
    check: "Spin the secondary at high speed for 10 min and use only the top.",
    fix: ["Centrifuge antibodies before use.", "Don't freeze HRP secondaries unless the datasheet says so.", "Replace old secondaries."] },
  particles: { t: "Undissolved blocking particles",
    why: "Bits of milk powder settle on the membrane and catch antibody.",
    check: "Look at your blocking buffer against the light for particles.",
    fix: ["Dissolve milk fully, then filter or spin it.", "Make it fresh each time."] },
  dirt: { t: "Dirty trays, forceps or handling marks",
    why: "Residue on trays and tools, fingerprints or pen ink all leave marks.",
    check: "Patches that match the shape of a tray, forceps or fingertip point to this.",
    fix: ["Wash trays and forceps well, rinse with methanol then water.", "Handle the membrane only by its edges.", "Mark membranes with pencil, not pen."] },
  bubbles: { t: "Air bubbles in the transfer",
    why: "Wherever a bubble sits, no protein reaches the membrane.",
    check: "Round blank spots that also show on Ponceau confirm it.",
    fix: ["Roll the sandwich in both directions with a roller or tube.", "Assemble it under transfer buffer."] },
  contact: { t: "Poor contact in the transfer sandwich",
    why: "Worn pads, thin filter paper or excess buffer let the gel and membrane drift apart, giving swirls and diffuse areas.",
    check: "Swirls that also show on Ponceau point to the transfer, not the antibody.",
    fix: ["Replace flattened foam pads.", "Use thicker filter paper.", "Roll out excess buffer as well as bubbles.", "Don't move the membrane once it touches the gel."] },
  agitation: { t: "Uneven incubation",
    why: "With too little buffer or no rocking, parts of the membrane see more antibody than others.",
    check: "Patches that don't show on Ponceau point to incubation, not transfer.",
    fix: ["Use enough volume for the membrane to move freely.", "Keep it rocking during every step.", "Incubate each membrane in its own container."] },
  nonspec_primary: { t: "Primary antibody binding other proteins",
    why: "Many antibodies, especially polyclonals, recognise more than one protein.",
    check: "Compare with the datasheet image, and if possible run a knockdown or knockout lysate. The real band should disappear.",
    fix: ["Dilute the primary further.", "Incubate at 4 °C rather than room temperature.", "Make washes longer and more stringent.", "Try a different, well-validated antibody."] },
  degradation: { t: "Protein degradation",
    why: "Broken-down protein shows up as smaller bands or a smear below the real one.",
    check: "Make fresh lysate with inhibitors and run it next to the old one.",
    fix: ["Add a protease inhibitor cocktail, plus phosphatase inhibitors if needed.", "Keep samples on ice and avoid repeated freeze–thaw.", "Heat in sample buffer promptly after lysis."] },
  ptm: { t: "Post-translational modifications",
    why: "Glycosylation, phosphorylation or ubiquitination add mass. Glycosylation can shift a protein by tens of kDa, and each ubiquitin adds about 8.6 kDa.",
    check: "Look up the protein on UniProt for known modifications.",
    fix: ["Treat with PNGase F if you suspect N-glycosylation and see if the band drops.", "Use phosphatase treatment to test for phosphorylation shifts."] },
  dimer: { t: "Dimers or aggregates",
    why: "Incomplete reduction leaves dimers at about twice the size, and membrane proteins can clump when boiled.",
    check: "Run the same sample with fresh reducing agent and reheat it.",
    fix: ["Use fresh DTT or β-mercaptoethanol, or a stronger reducer like TCEP.", "Heat most samples at 95 °C for 5 min.", "For multi-pass membrane proteins, heat at 37–70 °C instead of boiling."] },
  sec_cross: { t: "Secondary antibody cross-reacting",
    why: "The secondary can bind endogenous immunoglobulins or other proteins in your lysate.",
    check: "A strip with secondary only (no primary) tells you straight away.",
    fix: ["Use a cross-adsorbed secondary.", "Dilute the secondary further."] },
  overload: { t: "Too much protein loaded",
    why: "Overloaded lanes give smears, warped lanes, extra bands and burnt-out or saturated signal.",
    check: "Run a 2-fold dilution series of one lysate.",
    fix: ["Load 10–30 µg of lysate for most targets.", "Measure protein with BCA or Bradford before every gel.", "Follow the gel's recommended load per well."] },
  cleavage_isoform: { t: "Isoform, splice variant or cleaved form",
    why: "Alternative splicing, alternative start sites or processing (pro-peptide or caspase cleavage) give real bands of different sizes.",
    check: "Check UniProt and the literature for isoforms and known processing.",
    fix: ["Use an antibody against a different region to confirm.", "Use an isoform-specific antibody if you need one form."] },
  anomalous: { t: "The protein just runs differently",
    why: "SDS-PAGE size is an estimate. Very acidic, highly charged or membrane proteins often run away from their predicted size, and ladders from different makers don't line up exactly.",
    check: "Compare with the observed size on the antibody datasheet and in published blots.",
    fix: ["If the datasheet shows the same size, your band may well be right.", "Use the same ladder every time so results are comparable.", "Confirm identity with a knockdown, knockout or overexpression sample."] },
  dna: { t: "Genomic DNA in the lysate",
    why: "DNA makes the sample viscous and drags proteins down the lane.",
    check: "Pipette the lysate. If it is stringy, this is very likely.",
    fix: ["Sonicate briefly on ice.", "Or treat with a nuclease such as benzonase.", "Spin down debris before taking the supernatant."] },
  heat: { t: "Gel ran too hot or too fast",
    why: "High voltage heats the gel. The middle runs faster than the edges, so bands curve and blur.",
    check: "Run the next gel at a lower voltage with cold buffer and compare.",
    fix: ["Run at a lower constant voltage, or start low until samples enter the resolving gel.", "Use cold running buffer, or run on ice or in a cold room.", "Fill the tank fully."] },
  salt: { t: "Too much salt or detergent in samples",
    why: "High salt or detergent changes how samples enter and move through the gel, giving widened, dumbbell or bleeding lanes.",
    check: "Check whether the odd lanes were prepared in a different buffer.",
    fix: ["Keep salt around 100 mM or below in what you load.", "Dilute or desalt high-salt samples.", "Use the same lysis and sample buffer for every sample."] },
  denat: { t: "Sample not fully denatured",
    why: "Partly folded protein runs unevenly.",
    check: "Re-heat the sample with fresh sample buffer.",
    fix: ["Use fresh reducing agent.", "Heat at 95 °C for 5 min (lower for membrane proteins)."] },
  running_buffer: { t: "Running buffer old or wrong",
    why: "Exhausted or wrongly made running buffer gives blurry, poorly resolved bands.",
    check: "Run the next gel with fresh buffer.",
    fix: ["Make running buffer fresh or use premixed buffer.", "Don't reuse the inner chamber buffer."] },
  wells_gel: { t: "Wells or gel poorly formed",
    why: "Uneven polymerisation or damaged wells distort the lanes.",
    check: "Look at the wells and the dye front. A wavy front points to the gel or the run.",
    fix: ["Check the TEMED and APS amounts in your recipe.", "Remove the comb gently and rinse wells before loading.", "Load sample buffer into empty wells.", "Try a precast gel."] },
  substrate_used: { t: "Substrate used up on the band",
    why: "So much HRP sits on the band that it burns through the local substrate, leaving a white centre.",
    check: "Add fresh substrate and image again straight away.",
    fix: ["Use enough substrate to cover the membrane.", "Image within a few minutes of adding it.", "Use a less sensitive substrate for abundant targets."] },
  quant_range: { t: "Signal outside the linear range",
    why: "Saturated bands all hit the same ceiling, so real differences between samples disappear.",
    check: "Load a 2-fold dilution series of one sample. Band intensity should scale with the amount loaded.",
    fix: ["Make sure no band you want to quantify has saturated pixels.", "Load within the linear range for both target and loading control.", "Consider normalising to total protein instead of one housekeeping protein."] },
  unequal_load: { t: "Unequal loading",
    why: "Different amounts of protein per lane make bands look different even when the biology is the same.",
    check: "Look at Ponceau or another total protein stain across the lanes.",
    fix: ["Measure every sample with BCA or Bradford.", "Load equal µg per lane, not equal volume.", "Load slowly and watch for leaks between wells."] },
  lc_biology: { t: "Loading control changes with your treatment",
    why: "Housekeeping proteins like GAPDH or β-actin can change with treatment, cell density or disease state.",
    check: "If total protein is even but the loading control isn't, the control itself is changing.",
    fix: ["Check the literature for your treatment.", "Try a second loading control, or normalise to total protein."] },
  sample_empty: { t: "No protein got into the gel",
    why: "If the membrane and the gel are both empty, the problem is upstream: lysis, the protein assay, or the wrong tubes loaded.",
    check: "Run a few µL of lysate on a gel and stain it with Coomassie.",
    fix: ["Re-measure protein with BCA or Bradford.", "Check your lysis buffer suits the sample (for example RIPA for most whole-cell lysates).", "Label and check tubes before loading."] },
  lc_saturated: { t: "Loading control saturated",
    why: "Housekeeping proteins are abundant and saturate quickly, which can hide real loading differences.",
    check: "Look for saturated pixels on the loading control band.",
    fix: ["Image the loading control with a shorter exposure.", "Dilute the loading control antibody.", "Cut the membrane and image the control separately."] }
};

/* ---------- questions (shared) ---------- */
/* Context questions are offered for every picture, before the picture-specific ones if they help. */
const CONTEXT = ["worked_before", "changed", "lanes"];

const Q = {
  worked_before: { q: "Has this antibody worked on a blot in your hands before?", opts: [
    { l: "Yes, it used to work", e: { primary_inactive: -1, target_low: -1, nonspec_primary: -1, anomalous: 1 } },
    { l: "No, first time using it", e: { primary_inactive: 2, primary_dilute: 1, nonspec_primary: 2, ab_high: 1, block_mask: 1 } }] },
  changed: { q: "What's different from the last time it worked?", when: { worked_before: 0 }, tip: "When a working blot suddenly fails, the cause is usually whatever changed.", opts: [
    { l: "New antibody lot or aliquot", e: { primary_inactive: 3, primary_dilute: 2, nonspec_primary: 2, ab_high: 1 } },
    { l: "New secondary or ECL", e: { detect_fail: 3, substrate_old: 3, sec_cross: 1, agg_secondary: 2, ab_high: 1, expo_high: 1 } },
    { l: "New buffers or blocker", e: { block_low: 2, particles: 2, buffers_contam: 2, phospho_milk: 1, transfer_fail: 1, detect_fail: 1, block_mask: 1 } },
    { l: "New samples or cells", e: { target_low: 3, degradation: 2, overload: 1, underload: 1, unequal_load: 1, dna: 1, salt: 1, lc_biology: 1 } },
    { l: "Gel or transfer setup", e: { transfer_fail: 3, contact: 2, bubbles: 1, heat: 2, large_transfer: 1, wells_gel: 1, running_buffer: 1 } },
    { l: "Nothing I know of", e: {} }] },
  lanes: { q: "Is the problem in every lane, or only some?", opts: [
    { l: "Every lane, loading control too", e: { transfer_fail: 2, detect_fail: 2, expo_high: 1, ab_high: 1, contact: 1, block_low: 1, wash_low: 1, substrate_old: 1, unequal_load: -2, target_low: -1 } },
    { l: "Every lane, loading control is fine", e: { target_low: 2, primary_inactive: 2, primary_dilute: 2, detect_fail: -3, transfer_fail: -2 } },
    { l: "Only some lanes", e: { target_low: 2, unequal_load: 3, underload: 2, degradation: 2, salt: 2, overload: 1, detect_fail: "out", transfer_fail: -3 } }] },
  ladder: { q: "Is the prestained ladder visible on the membrane?", opts: [
    { l: "Yes", e: { transfer_fail: -2 } }, { l: "No", e: { transfer_fail: 4 } }, { l: "Didn't check", e: {} }] },
  ponceau_none: { q: "Did Ponceau S show protein in your sample lanes?", tip: "Ponceau tells you whether protein reached the membrane, before any antibody is involved.", opts: [
    { l: "Yes, lanes are stained", e: { transfer_fail: "out", sample_empty: "out", detect_fail: 1, target_low: 1, primary_inactive: 1 } },
    { l: "No, the lanes are empty", e: { transfer_fail: 3, sample_empty: 3, detect_fail: -2, target_low: -2, primary_inactive: -2 } },
    { l: "Didn't stain", e: {} }] },
  coomassie_gel: { q: "Stain the gel with Coomassie after transfer. Is protein still in the gel?", when: { ponceau_none: 1 }, opts: [
    { l: "Yes, lots left in the gel", e: { transfer_fail: "yes", sample_empty: "out" } },
    { l: "No, the gel is empty too", e: { sample_empty: "yes", transfer_fail: -2 } },
    { l: "Haven't checked", e: {} }] },
  dot_test: { q: "Dot a little secondary onto a scrap of membrane and add ECL. Does it light up?", tip: "A 30-second test of the secondary and the substrate on their own.", opts: [
    { l: "Yes, it lights up", e: { detect_fail: "out" } }, { l: "No light", e: { detect_fail: "yes" } }, { l: "Haven't tried", e: {} }] },
  azide: { q: "Is there sodium azide in any buffer that touches the HRP secondary?", opts: [
    { l: "Yes", e: { detect_fail: "yes" } }, { l: "No", e: { detect_fail: -1 } }, { l: "Not sure", e: { detect_fail: 1 } }] },
  pos_ctrl: { q: "Did a positive control lysate (known to express your protein) give a band?", opts: [
    { l: "Yes", e: { target_low: "yes", primary_inactive: "out" } }, { l: "No band there either", e: { primary_inactive: 3, target_low: -2 } }, { l: "No positive control", e: {} }] },
  wb_validated: { q: "Does the antibody datasheet list Western blot as a tested application?", opts: [
    { l: "Yes, with a blot image", e: { primary_inactive: -2 } }, { l: "No, or only IHC or IF", e: { primary_inactive: 4 } }, { l: "Not sure", e: {} }] },
  lc_present: { q: "Did the loading control (β-actin, GAPDH, tubulin…) give a band?", opts: [
    { l: "Yes, same secondary and ECL", e: { detect_fail: "out", transfer_fail: -2, target_low: 2, primary_inactive: 2 } },
    { l: "Yes, but a different secondary", e: { detect_fail: -1, target_low: 1, primary_inactive: 1 } },
    { l: "No band either", e: { detect_fail: 3, transfer_fail: 1 } }, { l: "Not probed", e: {} }] },
  small_target: { q: "Is your target smaller than about 20 kDa?", opts: [
    { l: "Yes", e: { small_through: 4 } }, { l: "No", e: { small_through: -1 } }] },
  lc_strong: { q: "Is the loading control strong?", opts: [
    { l: "Yes", e: { target_low: 2, primary_dilute: 2, block_mask: 1 } }, { l: "No, also weak", e: { underload: 3, transfer_fail: 2 } }] },
  large_target: { q: "Is your protein larger than about 100 kDa?", opts: [
    { l: "Yes", e: { large_transfer: 4 } }, { l: "No", e: { large_transfer: -1 } }] },
  primary_time: { q: "How long was the primary incubation?", opts: [
    { l: "Overnight at 4 °C", e: { primary_dilute: -1 } }, { l: "About 1 h at room temperature", e: { primary_dilute: 2 } }] },
  substrate_age: { q: "How is your ECL substrate?", opts: [
    { l: "Fresh and in date", e: { substrate_old: -1 } }, { l: "Old, or mixed a while ago", e: { substrate_old: 3 } }] },
  stripped_q: { q: "Was this membrane stripped and reprobed?", opts: [
    { l: "Yes", e: { stripped: 4 } }, { l: "No", e: { stripped: -2 } }] },
  dried: { q: "Did the membrane dry out at any point?", opts: [
    { l: "Yes", e: { dry: 4 } }, { l: "No", e: { dry: -1 } }, { l: "Not sure", e: {} }] },
  blocking: { q: "How did you block?", opts: [
    { l: "3–5% milk or BSA, 1 h or longer", e: { block_low: -1 } }, { l: "Shorter, or a weaker blocker", e: { block_low: 3 } }, { l: "Phospho-antibody, blocked in milk", e: { phospho_milk: 5 } }] },
  washing: { q: "How did you wash?", opts: [
    { l: "3 × 5–10 min in TBST", e: { wash_low: -2 } }, { l: "Fewer or shorter washes, or no Tween", e: { wash_low: 3 } }] },
  fast_bg: { q: "Does the background appear within seconds of exposure?", opts: [
    { l: "Yes", e: { ab_high: 2, expo_high: 2 } }, { l: "No, it builds slowly", e: { expo_high: -1, wash_low: 1 } }] },
  spot_type: { q: "What do the spots look like?", opts: [
    { l: "Small dark dots", e: { agg_secondary: 3, particles: 2 } }, { l: "White spots", e: { bubbles: 4 } }, { l: "Dark patches or prints", e: { dirt: 3, dry: 2 } }] },
  block_filtered: { q: "Was the blocking buffer fully dissolved or filtered?", opts: [
    { l: "Yes", e: { particles: -2 } }, { l: "No or not sure", e: { particles: 3 } }] },
  sec_old: { q: "Is the secondary old, or has it been frozen and thawed?", opts: [
    { l: "Yes", e: { agg_secondary: 3 } }, { l: "No", e: { agg_secondary: -1 } }] },
  extra_pos: { q: "Where are the extra bands?", opts: [
    { l: "Below the expected size", e: { degradation: 3, cleavage_isoform: 1 } }, { l: "Above the expected size", e: { ptm: 3, dimer: 1 } }, { l: "About twice the expected size", e: { dimer: 4 } }, { l: "All over the lane", e: { nonspec_primary: 3, overload: 2, ab_high: 1 } }] },
  sec_only: { q: "Did a secondary-only control (no primary) also show bands?", opts: [
    { l: "Yes", e: { sec_cross: 5 } }, { l: "No", e: { sec_cross: -2, nonspec_primary: 1 } }, { l: "Not done", e: {} }] },
  protease: { q: "Were protease inhibitors in the lysis buffer and samples kept on ice?", opts: [
    { l: "Yes", e: { degradation: -2 } }, { l: "No or not sure", e: { degradation: 3 } }] },
  size_dir: { q: "Where is your band compared with the predicted size?", opts: [
    { l: "A bit higher", e: { ptm: 3, anomalous: 1 } }, { l: "Much higher, about double", e: { dimer: 4 } }, { l: "Lower", e: { cleavage_isoform: 3, degradation: 1 } }] },
  datasheet_same: { q: "Does the antibody datasheet show a band at the same size as yours?", opts: [
    { l: "Yes", e: { anomalous: 4, nonspec_primary: -1 } }, { l: "No", e: { nonspec_primary: 2 } }, { l: "Didn't check", e: {} }] },
  glyco: { q: "Is it a membrane or secreted protein (often glycosylated)?", opts: [
    { l: "Yes", e: { ptm: 3, dimer: 1 } }, { l: "No", e: { ptm: -1 } }] },
  load_amount: { q: "How much total protein did you load per lane?", opts: [
    { l: "Up to 30 µg", e: { overload: -1 } }, { l: "More than 30 µg", e: { overload: 3 } }, { l: "Didn't measure", e: { overload: 1, unequal_load: 1 } }] },
  stringy: { q: "Was the lysate thick or stringy?", opts: [
    { l: "Yes", e: { dna: 4 } }, { l: "No", e: { dna: -1 } }] },
  gel_hot: { q: "Did the gel run fast or get warm?", opts: [
    { l: "Yes", e: { heat: 3 } }, { l: "No", e: { heat: -1 } }] },
  smear_dir: { q: "Which way does the smear or blur go?", opts: [
    { l: "Downwards from the band", e: { degradation: 2 } }, { l: "Whole lane", e: { overload: 1, dna: 1, salt: 1 } }, { l: "Bands are wide and fuzzy", e: { heat: 2, running_buffer: 2 } }] },
  curved: { q: "Do bands curve, higher at the edges than in the middle?", opts: [
    { l: "Yes", e: { heat: 4 } }, { l: "No", e: { heat: -1 } }] },
  lane_shape: { q: "Are some lanes wider, narrower or dumbbell-shaped?", opts: [
    { l: "Wider or dumbbell", e: { salt: 3, overload: 1 } }, { l: "Narrower", e: { dna: 3 } }, { l: "No", e: {} }] },
  rim: { q: "Are some bands hollow, with a white centre and a dark rim?", opts: [
    { l: "Yes", e: { ab_high: 2, substrate_used: 2, overload: 1 } }, { l: "No", e: { substrate_used: -1 } }] },
  fade: { q: "Did the signal fade quickly while imaging?", opts: [
    { l: "Yes", e: { substrate_used: 3, ab_high: 1 } }, { l: "No", e: {} }] },
  auto_exp: { q: "Did you use the imager's auto-exposure?", opts: [
    { l: "No, I set a long exposure", e: { expo_high: 3 } }, { l: "Yes, still saturated", e: { expo_high: -1, ab_high: 2, overload: 2 } }] },
  need_quant: { q: "Do you need to quantify these bands?", opts: [
    { l: "Yes", e: { quant_range: 4 } }, { l: "No, just yes/no detection", e: { quant_range: -1 } }] },
  patch_shape: { q: "What shape are the patches?", opts: [
    { l: "Round blank circles", e: { bubbles: 4 } }, { l: "Swirls or streaks", e: { contact: 4 } }, { l: "Patches at the edges", e: { dry: 3, agitation: 1 } }] },
  ponceau_patch: { q: "Do the same patches show on the Ponceau stain?", opts: [
    { l: "Yes", e: { bubbles: 2, contact: 2, agitation: -2 } }, { l: "No", e: { agitation: 3, dry: 1, bubbles: -2, contact: -2 } }, { l: "Not done", e: {} }] },
  measured: { q: "Did you measure protein (BCA or Bradford) before loading?", opts: [
    { l: "Yes", e: { unequal_load: -1 } }, { l: "No", e: { unequal_load: 3 } }] },
  ponceau_even: { q: "Is Ponceau or total protein stain even across the lanes?", opts: [
    { l: "Yes, even", e: { lc_biology: 3, unequal_load: -2 } }, { l: "No, uneven", e: { unequal_load: 3, contact: 1 } }, { l: "Not done", e: {} }] },
  lc_pink: { q: "Is the loading control band saturated (coloured pixels on the imager)?", opts: [
    { l: "Yes", e: { lc_saturated: 4 } }, { l: "No", e: { lc_saturated: -1 } }] }
};

/* ---------- symptoms ---------- */
const SYMPTOMS = [
  { id: "none", name: "No bands", hint: "Nothing where your protein should be",
    causes: { transfer_fail: 2, detect_fail: 2, target_low: 1.5, primary_inactive: 1.5, sample_empty: 0.6, small_through: 0.8, block_mask: 0.4 },
    qs: ["ponceau_none", "coomassie_gel", "ladder", "lc_present", "dot_test", "azide", "pos_ctrl", "wb_validated", "small_target"] },
  { id: "weak", name: "Faint bands", hint: "The band is there but barely",
    causes: { primary_dilute: 1.6, target_low: 1.5, large_transfer: 1, underload: 1, substrate_old: 1, block_mask: 0.8, stripped: 0.6, transfer_fail: 0.6 },
    qs: ["lc_strong", "large_target", "primary_time", "substrate_age", "stripped_q"] },
  { id: "saturated", name: "Saturated signal", hint: "Pink or red pixels on the imager",
    causes: { expo_high: 2, ab_high: 1.5, overload: 1.5, quant_range: 1, substrate_used: 0.6 },
    qs: ["auto_exp", "load_amount", "rim", "need_quant"] },
  { id: "background", name: "Dark background", hint: "The whole membrane is grey or black",
    causes: { ab_high: 2, block_low: 1.8, wash_low: 1.5, expo_high: 1.2, dry: 0.8, buffers_contam: 0.5, phospho_milk: 0.4 },
    qs: ["dried", "blocking", "washing", "fast_bg"] },
  { id: "extra", name: "Extra bands", hint: "Bands you didn't expect, above or below",
    causes: { nonspec_primary: 2, degradation: 1.5, ptm: 1.2, dimer: 1, ab_high: 0.8, sec_cross: 0.8, overload: 0.8, cleavage_isoform: 0.6 },
    qs: ["extra_pos", "sec_only", "protease"] },
  { id: "wrongsize", name: "Wrong size", hint: "One band, but not where predicted",
    causes: { ptm: 2, cleavage_isoform: 1.6, anomalous: 1.4, dimer: 1, nonspec_primary: 1 },
    qs: ["size_dir", "datasheet_same", "glyco", "protease"] },
  { id: "smear", name: "Smears or blur", hint: "Streaks or fuzzy bands, not sharp ones",
    causes: { overload: 1.6, dna: 1.2, heat: 1.1, degradation: 1, salt: 0.8, denat: 0.7, running_buffer: 0.6 },
    qs: ["load_amount", "stringy", "gel_hot", "smear_dir"] },
  { id: "smile", name: "Curved or warped lanes", hint: "Smiling bands, bent or dumbbell lanes",
    causes: { heat: 1.5, salt: 1.2, overload: 1, wells_gel: 0.8, dna: 0.5 },
    qs: ["curved", "lane_shape", "load_amount"] },
  { id: "ghost", name: "White bands", hint: "Hollow or white centres, dark edges",
    causes: { ab_high: 2, overload: 1.5, substrate_used: 1.2, expo_high: 0.5 },
    qs: ["rim", "fade", "load_amount"] },
  { id: "speckle", name: "Spots and specks", hint: "Dots or blotches over the membrane",
    causes: { agg_secondary: 1.5, particles: 1.5, dirt: 1, bubbles: 0.8, dry: 0.6 },
    qs: ["spot_type", "block_filtered", "sec_old"] },
  { id: "patches", name: "Blank patches or swirls", hint: "Missing areas, swirl marks",
    causes: { bubbles: 1.6, contact: 1.5, agitation: 1, dry: 0.8 },
    qs: ["patch_shape", "ponceau_patch", "dried"] },
  { id: "lc", name: "Uneven loading control", hint: "β-actin or GAPDH differs between lanes",
    causes: { unequal_load: 2, lc_biology: 1.2, lc_saturated: 1, contact: 0.6, bubbles: 0.4 },
    qs: ["measured", "ponceau_even", "lc_pink"] }
];
