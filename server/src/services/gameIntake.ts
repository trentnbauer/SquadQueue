import { searchGames, getGameDetail } from './igdbClient.js';
import { getSteamPriceAndUrl, getSteamPrice } from './priceService.js';
import type { GameIntakeCandidate, GameSearchResult } from '@squadqueue/shared';

export async function searchIntake(query: string): Promise<GameSearchResult[]> {
  return searchGames(query);
}

async function resolveCandidate(igdbId: number): Promise<GameIntakeCandidate> {
  const detail = await getGameDetail(igdbId);

  if (detail.steamAppId) {
    const { price, ggDealsUrl } = await getSteamPriceAndUrl(detail.steamAppId);
    return {
      igdbId: detail.igdbId,
      title: detail.title,
      platform: detail.platform,
      genre: detail.genre,
      coverImageUrl: detail.coverImageUrl,
      ggDealsUrl,
      price,
    };
  }

  return {
    igdbId: detail.igdbId,
    title: detail.title,
    platform: detail.platform,
    genre: detail.genre,
    coverImageUrl: detail.coverImageUrl,
    ggDealsUrl: null,
    price: { amount: null, currency: null, source: 'unavailable' },
  };
}

/** Resolves a chosen search result into a fully-priced candidate for the preview panel. */
export async function previewIntake(igdbId: number): Promise<GameIntakeCandidate> {
  return resolveCandidate(igdbId);
}

/** Fully resolves a game once the user confirms adding it. */
export async function resolveGameForCreation(igdbId: number): Promise<{
  title: string;
  platform: string;
  genre: string | null;
  ggDealsUrl: string | null;
  coverImageUrl: string | null;
  steamAppId: number | null;
}> {
  const detail = await getGameDetail(igdbId);
  const ggDealsUrl = detail.steamAppId ? (await getSteamPriceAndUrl(detail.steamAppId)).ggDealsUrl : null;

  return {
    title: detail.title,
    platform: detail.platform,
    genre: detail.genre,
    ggDealsUrl,
    coverImageUrl: detail.coverImageUrl,
    steamAppId: detail.steamAppId,
  };
}

export async function refreshGamePricing(steamAppId: number | null): Promise<void> {
  if (!steamAppId) return;
  await getSteamPrice(steamAppId, { forceRefresh: true });
}
