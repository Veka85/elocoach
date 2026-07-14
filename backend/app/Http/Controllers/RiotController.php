<?php

namespace App\Http\Controllers;

use App\Services\RiotApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * RiotController
 *
 * Proxy endpoint for Riot Games API calls.
 * The frontend doesn't call Riot's API directly because:
 * 1. API keys must not be exposed to the browser (security)
 * 2. We can add caching and rate limiting on our side
 * 3. We can transform the data into our preferred format
 */
class RiotController extends Controller
{
    public function __construct(
        private RiotApiService $riotApiService
    ) {}

    /**
     * Look up a summoner by name and region.
     *
     * GET /api/riot/summoner/{region}/{name}
     * Example: GET /api/riot/summoner/EUW/Faker
     */
    public function summoner(Request $request, string $region, string $name): JsonResponse
    {
        try {
            // Get basic summoner info
            $summoner = $this->riotApiService->getSummoner($region, $name);

            // Get their ranked data (optional — might fail if unranked)
            $ranked = [];
            try {
                $ranked = $this->riotApiService->getRankedData($region, $summoner['id']);
            } catch (\Exception) {
                // Unranked players have no ranked data — that's fine
            }

            // Find solo queue entry (if exists)
            $soloQueue = collect($ranked)->firstWhere('queueType', 'RANKED_SOLO_5x5');

            return response()->json([
                'data' => [
                    'summoner_name'   => $summoner['name'],
                    'summoner_level'  => $summoner['summonerLevel'],
                    'profile_icon_id' => $summoner['profileIconId'],
                    'puuid'           => $summoner['puuid'],
                    // Format rank into readable string: "Diamond II (85 LP)"
                    'rank'            => $soloQueue
                        ? "{$soloQueue['tier']} {$soloQueue['rank']} ({$soloQueue['leaguePoints']} LP)"
                        : 'Unranked',
                    'wins'            => $soloQueue['wins'] ?? 0,
                    'losses'          => $soloQueue['losses'] ?? 0,
                    'win_rate'        => $soloQueue
                        ? round(($soloQueue['wins'] / ($soloQueue['wins'] + $soloQueue['losses'])) * 100, 1)
                        : 0,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
