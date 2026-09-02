# @dailydotdev/world-kit

The authoring API, recorder and validator behind
[`@dailydotdev/world-cli`](../world-cli). Pure JavaScript, no DOM and no WebGL,
so the same validation runs in node and in the browser sandbox.

- `createRecorder` / `measure` — the API an author writes against, and what it
  costs.
- `runBuilder` / `runRealmBuilder` — record seeded variants for one district
  override or compile a realm family across all three level tiers.
- `budgetOf` / `tierOf` — what a district's rung is worth.
- `paletteKeys` / `rolesOf` — which colour names a realm allows.

The envelope, tier and palette tables are duplicated in the renderer by
necessity. `packages/webapp/__tests__/world/worldKitContract.test.ts` is what
stops the copies drifting.
