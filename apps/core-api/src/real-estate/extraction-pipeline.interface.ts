import { RawAdvertisement } from './real-estate.raw';

/** Context available to a pipeline stage. */
export interface ExtractionContext {
  targetId: number;
  jobId: number;
}

/**
 * Transforms a provider's {@link RawAdvertisement} into a typed, normalized
 * shape ready for persistence.
 *
 * Generic so future, non-real-estate pipelines can reuse the same contract.
 * Today there is a single real-estate implementation
 * ({@link NormalizationService}); future stages (dedupe, geocoding, AI
 * enrichment) can be composed behind this same interface.
 */
export interface ExtractionPipeline<TOut> {
  extract(raw: RawAdvertisement, ctx: ExtractionContext): Promise<TOut> | TOut;
}
