package com.smartiv.engine;

import com.smartiv.entity.IvEvent;

/**
 * Output of one rule engine evaluation cycle.
 */
public class RuleResult {

    private final IvEvent.EventType determinedEventType;
    private final boolean lowVolumeFlag;   // LOW_VOLUME may coexist with another event
    private final String explanation;
    private final boolean candidateConfirmed; // persistence threshold met

    public RuleResult(IvEvent.EventType determinedEventType, boolean lowVolumeFlag,
                      String explanation, boolean candidateConfirmed) {
        this.determinedEventType = determinedEventType;
        this.lowVolumeFlag = lowVolumeFlag;
        this.explanation = explanation;
        this.candidateConfirmed = candidateConfirmed;
    }

    public IvEvent.EventType getDeterminedEventType() { return determinedEventType; }
    public boolean isLowVolumeFlag() { return lowVolumeFlag; }
    public String getExplanation() { return explanation; }
    public boolean isCandidateConfirmed() { return candidateConfirmed; }
}
