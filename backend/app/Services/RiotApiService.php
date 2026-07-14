<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Cache;

/**
 * RiotApiService
 *
 * Handles all communication with the Riot Games API.
 * Encapsulating external API calls in a service provides:
 * 1. Single place to update API credentials/base URLs
 * 2. Easy to mock in tests
 * 3. Can add caching, rate limiting, error handling in one place
 *
 * RIOT API NOTES:
 * - Rate limits: 20 requests/second, 100 requests/2-minutes (dev key)
 * - Developer keys expire every 24 hours — use production key for prod
 * - Summoner lookup requires region-specific base URLs
 *
 * DOCS: https://developer.riotgames.com/apis
 */
class RiotApiService
{
    private Client $httpClient;
    private string $apiKey;

    /**
     * Region to platform routing value map.
     * The Riot API uses different base URLs per region.
     */
    private array $regionMap = [
        'EUW'  => 'euw1',
        'EUNE' => 'eun1',
        'NA'   => 'na1',
        'KR'   => 'kr',
        'JP'   => 'jp1',
        'BR'   => 'br1',
        'LAN'  => 'la1',
        'LAS'  => 'la2',
        'OCE'  => 'oc1',
        'TR'   => 'tr1',
        'RU'   => 'ru',
    ];

    /**
     * Region to regional routing for match/account APIs.
     * Riot uses "regional" URLs (not region-specific) for some endpoints.
     */
    private array $regionalMap = [
        'EUW'  => 'europe',
        'EUNE' => 'europe',
        'NA'   => 'americas',
        'KR'   => 'asia',
        'JP'   => 'asia',
        'BR'   => 'americas',
        'LAN'  => 'americas',
        'LAS'  => 'americas',
        'OCE'  => 'sea',
        'TR'   => 'europe',
        'RU'   => 'europe',
    ];

    public function __construct()
    {
        $this->apiKey = config('services.riot.api_key');

        // Guzzle HTTP client — the standard PHP HTTP library.
        // Laravel uses it internally too (for HTTP::get() facade).
        $this->httpClient = new Client([
            'timeout' => 5.0, // 5 second timeout — don't let slow API hang our app
        ]);
    }

    /**
     * Look up a summoner by name and region.
     *
     * CACHING CONCEPT:
     * We cache Riot API responses for 5 minutes using Laravel's Cache.
     * This prevents hammering the API (rate limiting) when many users
     * look up the same summoner. Cache::remember() checks if the key
     * exists — if yes, returns cached value; if no, runs the closure
     * and stores the result.
     *
     * @param string $region  'EUW', 'NA', 'KR', etc.
     * @param string $summonerName  The summoner's in-game name
     * @return array  Summoner data
     * @throws \Exception if API call fails
     */
    public function getSummoner(string $region, string $summonerName): array
    {
        $cacheKey = "riot.summoner.{$region}.{$summonerName}";

        // Cache for 5 minutes (300 seconds) to avoid hitting rate limits
        return Cache::remember($cacheKey, 300, function () use ($region, $summonerName) {
            $platform = $this->regionMap[strtoupper($region)] ?? 'euw1';

            $url = "https://{$platform}.api.riotgames.com/lol/summoner/v4/summoners/by-name/"
                   . urlencode($summonerName);

            return $this->makeRequest($url);
        });
    }

    /**
     * Get a summoner's ranked stats (rank, LP, wins, losses).
     *
     * @param string $region
     * @param string $summonerId  The internal Riot summoner ID (from getSummoner)
     * @return array  Array of ranked entries (solo queue, flex, etc.)
     */
    public function getRankedData(string $region, string $summonerId): array
    {
        $platform = $this->regionMap[strtoupper($region)] ?? 'euw1';
        $cacheKey = "riot.ranked.{$region}.{$summonerId}";

        return Cache::remember($cacheKey, 300, function () use ($platform, $summonerId) {
            $url = "https://{$platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/{$summonerId}";
            return $this->makeRequest($url);
        });
    }

    /**
     * Get recent match history by PUUID.
     *
     * @param string $region
     * @param string $puuid  The account's global unique ID
     * @param int $count  Number of matches to fetch (max 20 for dev keys)
     * @return array  List of match IDs
     */
    public function getMatchIds(string $region, string $puuid, int $count = 5): array
    {
        $regional = $this->regionalMap[strtoupper($region)] ?? 'europe';
        $cacheKey = "riot.matches.{$region}.{$puuid}.{$count}";

        return Cache::remember($cacheKey, 120, function () use ($regional, $puuid, $count) {
            $url = "https://{$regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/{$puuid}/ids"
                   . "?count={$count}";
            return $this->makeRequest($url);
        });
    }

    /**
     * Make an authenticated HTTP request to the Riot API.
     * All Riot API endpoints use the same auth method: X-Riot-Token header.
     *
     * This is a private helper — external code uses the public methods above.
     *
     * @param string $url  Full URL to request
     * @return array  Decoded JSON response
     * @throws \Exception with user-friendly message on failure
     */
    private function makeRequest(string $url): array
    {
        try {
            $response = $this->httpClient->get($url, [
                'headers' => [
                    'X-Riot-Token' => $this->apiKey,
                    'Accept'       => 'application/json',
                ],
            ]);

            // json_decode with true = return associative array (not stdClass object)
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            // Translate HTTP errors into user-friendly messages
            $statusCode = $e->getResponse()?->getStatusCode();

            match ($statusCode) {
                403 => throw new \Exception('Invalid or expired Riot API key.'),
                404 => throw new \Exception('Summoner not found. Check the name and region.'),
                429 => throw new \Exception('Riot API rate limit hit. Please try again in a moment.'),
                default => throw new \Exception('Could not reach Riot API. Please try again later.'),
            };
        }
    }
}
