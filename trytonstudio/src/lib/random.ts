/** Small deterministic generator, so decorative layers render the same on every load. */
export function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}
