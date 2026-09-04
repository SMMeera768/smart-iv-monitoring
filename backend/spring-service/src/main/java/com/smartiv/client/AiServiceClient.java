package com.smartiv.client;

import com.smartiv.entity.AiMetric;
import com.smartiv.service.feature.FeatureExtractionService.ExtractedFeatures;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * HTTP client for the Python AI sensor-health service.
 *
 * If the AI service is unavailable:
 *   - logs the failure
 *   - returns a fallback response with AI_UNAVAILABLE status
 *   - does NOT invent anomaly scores
 *   - does NOT stop the primary IV rule engine
 *
 * The entire backend continues operating without the AI layer.
 */
@Component
public class AiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AiServiceClient.class);

    private final RestTemplate restTemplate;

    @Value("${smartiv.ai.service-url:http://localhost:8000}")
    private String aiServiceUrl;

    public AiServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Call the AI service with extracted features.
     * Returns a fallback response on any failure.
     */
    public AiAnalysisResponse analyze(String bedCode, ExtractedFeatures features,
                                       double stuckSignalDurationSeconds) {
        try {
            Map<String, Double> featureMap = buildFeatureMap(features, stuckSignalDurationSeconds);
            AiAnalysisRequest request = new AiAnalysisRequest(bedCode, Instant.now(), featureMap);

            AiAnalysisResponse response = restTemplate.postForObject(
                    aiServiceUrl + "/ai/v1/analyze",
                    request,
                    AiAnalysisResponse.class
            );

            if (response == null) {
                log.warn("AI service returned null response for bed {}", bedCode);
                return unavailableFallback();
            }
            return response;

        } catch (RestClientException e) {
            log.warn("AI service unavailable for bed {}: {}", bedCode, e.getMessage());
            return unavailableFallback();
        } catch (Exception e) {
            log.error("Unexpected error calling AI service for bed {}", bedCode, e);
            return unavailableFallback();
        }
    }

    /**
     * Build the feature map in the exact order expected by the AI service.
     * Feature order must match the scaler fitted during training.
     */
    private Map<String, Double> buildFeatureMap(ExtractedFeatures f, double stuckDurationSeconds) {
        Map<String, Double> map = new LinkedHashMap<>();
        map.put("weightSlope", f.getWeightSlope());
        map.put("standardDeviation", f.getStandardDeviation());
        map.put("rollingVariance", f.getRollingVariance());
        map.put("signalNoise", f.getSignalNoise());
        map.put("baselineDeviation", f.getBaselineDeviation());
        map.put("stuckSignalDuration", stuckDurationSeconds);
        return map;
    }

    /** Fallback when AI service is unavailable — no invented scores. */
    private AiAnalysisResponse unavailableFallback() {
        AiAnalysisResponse r = new AiAnalysisResponse();
        r.setModelVersion("unavailable");
        r.setAnomalyScore(null);
        r.setDriftScore(null);
        r.setDriftStatus(AiMetric.SensorStatus.AI_UNAVAILABLE.name());
        r.setFailureStatus(AiMetric.SensorStatus.AI_UNAVAILABLE.name());
        r.setSupportingFeatures(null);
        r.setInferenceLatencyMs(null);
        return r;
    }
}
