# References

Exemplars
- https://tls13.xargs.org/ — Illustrated TLS: hand-written HTML, real captured bytes, click to expand. Real data beats animation.
- https://learnvisually.cloud/tls — step-through playgrounds, "what you send" vs "what the sniffer sees".
- https://ciechanow.ski/mechanical-watch/ — the high-water mark for 3D mechanism explainers. Hand WebGL, sliders drive time, readable source at ciechanow.ski/js/watch.js. Note the pattern: one driving variable, figures carry the argument.
- https://animagraffs.com/how-a-car-engine-works/ — Blender-rendered animated infographic, the viral engine explainer. Research first, then model.
- https://github.com/wonjyou/exploded-lens — scroll-driven exploded view, each part has its own window inside 0–1 progress.
- https://github.com/blob42/awesome-explorables — catalogue.

Scroll + 3D patterns
- https://github.com/haplollc/3d-scroll-story — pinned stage, one progress number, a pose per step, setViewOffset for wide vs phone, sleep off screen, reduced-motion snap. Closest sibling to this skill.
- https://github.com/nytimes/three-story-controls — StoryPointControls (discrete beats), ScrollControls (scrub a camera AnimationClip), ThreeDOF (slight camera rotation so still moments are not frozen).
- https://github.com/russellsamora/scrollama — the step trigger used here.

Three.js techniques
- RoomEnvironment + PMREM + NeutralToneMapping: https://webcodingcenter.com/three-js/materials-and-physically-based-rendering--environment-maps-and-image-based-lighting.html
- Glass/transmission: https://sbcode.net/threejs/glass-transmission/ and https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/
- OutlinePass + bloom in one composer, threshold tuning: https://webcodingcenter.com/three-js/post-processing-with-effectcomposer--bloom-outline-and-custom-shader-passes.html
- Selective bloom via layers: https://waelyasmina.net/articles/unreal-bloom-selective-threejs-post-processing/ and threejs.org example webgl_postprocessing_unreal_bloom_selective

Models
- Sketchfab with downloadable + CC0 filter; https://blendswap.com (CC-tagged .blend, export glTF from Blender). Paid cutaway engines on free3d/cgtrader if fidelity matters.

Next tiers not in the templates
- Scrub instead of steps: GSAP ScrollTrigger `scrub:true` mapping scroll to the driving variable. Reader controls time.
- Pre-rendered frames from Blender swapped on scroll (Apple product pages). Best look, zero runtime cost, heavy to produce.
