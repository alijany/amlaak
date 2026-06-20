# Extending Extraction Pipelines

The pipeline turns a provider's `RawAdvertisement` into a typed, persistable record. It is
defined by a small generic interface so it can be composed and extended.

## The interface

```ts
interface ExtractionPipeline<TOut> {
  extract(raw: RawAdvertisement, ctx?: ExtractionContext): Promise<TOut> | TOut;
}
```

Today there's one implementation: **`NormalizationService`**
(`pipeline/normalization.service.ts`) → `NormalizedAdvertisement`, used by
`CrawlJobProcessor` before `AdvertisementService.upsert`.

## What normalization does

- Persian/Arabic → ASCII digits via `normalizeNumbers` (`src/libs/utils/pipe.normalizeNumbers.ts`).
- Pulls integers out of unit-suffixed strings (`"۱۲۰ متر"` → `120`) into typed columns.
- Keeps the original `attributes` and stores the untouched source as `rawPayload` so records
  can be re-normalized later without re-crawling.

## Adding a stage (recommended pattern)

Compose stages in the processor rather than growing one giant method. For example, an AI
enrichment stage:

```ts
@Injectable()
export class AiEnrichmentService implements ExtractionPipeline<NormalizedAdvertisement> {
  async extract(raw, ctx) {
    const base = this.normalization.extract(raw);
    if (base.totalPrice == null /* or missing geo, etc. */) {
      // call an LLM with raw.raw or a page snapshot to fill gaps
    }
    return base;
  }
}
```

Then swap which pipeline the processor injects, or chain them. Keep each stage:
- **pure-ish** (input → output, no hidden side effects),
- **null-safe** (sources are messy), and
- **idempotent** (re-running on stored `rawPayload` yields the same result).

## Adding a new vertical (non-real-estate)

The `RealEstateAdvertisementEntity` is intentionally specific. For another vertical:

1. Add a sibling entity (e.g. `VehicleAdvertisementEntity`).
2. Implement an `ExtractionPipeline<NormalizedVehicle>`.
3. Add a service with its own `upsert`/`search`, and route the processor by target/provider.

This keeps each vertical's schema clean instead of overloading one wide table.

## Future: AI-powered extraction

The Camoufox gateway returns **accessibility snapshots** (small, ~90% smaller than HTML)
with stable element refs — a strong input for an LLM extractor. A future provider could skip
hand-written selectors entirely: snapshot → LLM → `RawAdvertisement`, then the existing
normalization stage applies. See [the roadmap](../roadmap.md).
