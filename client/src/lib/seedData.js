// Shared by the seed script and the client's offline preview fallback.
export const seedPosts = [
  {
    title: 'Scroll is a timeline, so direct it like one',
    slug: 'scroll-is-a-timeline',
    excerpt: 'Treating the scrollbar as a playhead changes how you plan motion: fewer effects, better pacing, and pages that feel authored.',
    category: 'Motion',
    tags: ['gsap', 'scrolltrigger', 'pacing'],
    featured: true,
    views: 1840,
    content: `A scrolling page is a film the reader plays at their own speed. The scrollbar is the playhead, and every section is a scene.

## Plan scenes, not effects

Before writing a single tween, list the scenes on the page and decide what *changes* between them. Colour? Position? Scale? Pick one or two properties per transition and leave the rest still.

- **Colour** tells the reader the mood has shifted.
- **Position** tells them something new is taking the stage.
- **Scale** tells them what matters.

## Scrub for continuity, trigger for punctuation

Use scrubbed tweens when the motion should follow the reader's hand. Use one-shot triggers when you want a moment of punctuation, such as a headline landing.

\`\`\`js
gsap.to('.object', {
  x: 240,
  scrollTrigger: { trigger: '.scene', scrub: true },
});
\`\`\`

## Smooth the input, not the output

Lenis smooths the wheel input, so every scrubbed animation inherits a calm, weighted feel without any extra work.`,
  },
  {
    title: 'Glass needs something to refract',
    slug: 'glass-needs-something-to-refract',
    excerpt: 'Glassmorphism fails when there is nothing behind the glass. Here is how to give blur a reason to exist.',
    category: 'Design',
    tags: ['glassmorphism', 'css', 'color'],
    featured: true,
    views: 1320,
    content: `Frosted panels look flat on a flat background. The effect only works when the layer behind it has colour and movement for the blur to soften.

## The recipe

1. A translucent fill, around 6 to 12 percent white.
2. \`backdrop-filter: blur(18px) saturate(140%)\`.
3. A one-pixel border at 15 percent white to catch the edge.
4. An inset highlight on the top edge, as if light lands there.

## Give it a backdrop

Put a slow moving object or a shifting gradient behind your panels. As the scene changes colour, the glass changes with it for free.

> Blur is not decoration. It is a way of saying "this sits in front of that."

## Keep text readable

Check contrast against the *brightest* thing that can pass behind the panel, not the average.`,
  },
  {
    title: 'A 3D object that earns its place on the page',
    slug: 'a-3d-object-that-earns-its-place',
    excerpt: 'React Three Fiber makes it easy to add a spinning shape. Making it mean something takes a little more thought.',
    category: 'WebGL',
    tags: ['three.js', 'r3f', 'performance'],
    featured: true,
    views: 2210,
    content: `The easiest way to add 3D to a site is to drop a rotating mesh in the hero. The better way is to let it react to the story.

## Tie it to scroll

Read scroll progress inside \`useFrame\` and ease towards a target. Position, rotation, and colour can all follow the same value.

## Budget your frames

- Cap the device pixel ratio at 1.75.
- Use one light you can afford, and an environment for the rest.
- Pause rendering when the tab is hidden.

## Respect reduced motion

If the reader asks for less movement, freeze the object on a pleasing pose rather than removing it.`,
  },
  {
    title: 'Design tokens for a page that changes colour',
    slug: 'design-tokens-for-a-colour-changing-page',
    excerpt: 'When the whole palette shifts as you scroll, hard-coded hex values become a liability. Use channel variables instead.',
    category: 'Design',
    tags: ['tokens', 'tailwind', 'css-variables'],
    views: 780,
    content: `If the background, text, and accent all animate, they need to live in variables that JavaScript can tween.

## Store channels, not colours

Define \`--bg: 18 16 43\` and use \`rgb(var(--bg) / <alpha-value>)\` in Tailwind. Now opacity modifiers like \`bg-ink/10\` keep working while the base colour moves.

## One scene, three values

Each scene needs just three colours: a surface, an ink, and an accent. Everything else is derived with opacity.`,
  },
  {
    title: 'Writing the API behind a small blog',
    slug: 'writing-the-api-behind-a-small-blog',
    excerpt: 'Posts, comments, likes, and auth in an Express and MongoDB server, without any framework magic.',
    category: 'Backend',
    tags: ['express', 'mongodb', 'jwt'],
    views: 640,
    content: `A blog API is small, which makes it a good place to practise clean boundaries.

## Models

Three collections cover almost everything: users, posts, and comments. Likes live on the post as an array of user ids.

## Routes

Put specific routes such as \`/featured\` and \`/mine\` before \`/:slug\`, or Express will treat them as slugs.

## Auth

Sign a JWT on login, send it as a bearer token, and keep an optional-auth middleware so public pages can still know who is looking.`,
  },
  {
    title: 'Type that moves with the reader',
    slug: 'type-that-moves-with-the-reader',
    excerpt: 'Lines of text that slide in opposite directions as you scroll can feel alive, or chaotic. The difference is restraint.',
    category: 'Motion',
    tags: ['typography', 'gsap', 'scroll'],
    views: 910,
    content: `Moving type is the fastest way to give a page rhythm.

## Alternate direction

Send odd lines left and even lines right. The eye reads it as a gentle weave rather than a shove.

## Light up as you go

Fade words from a quiet tone to full ink in sequence as the section passes. The reader's progress becomes visible in the text itself.

## Stop at the sentence

Finish the motion before the sentence ends, so the final words can be read at rest.`,
  },
];
