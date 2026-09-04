package com.smartiv.dto.request;

public class AlertActionRequest {
    /** Optional note from the staff member performing the action. */
    private String note;

    /** Optional ID or username of the staff member performing the action. */
    private String userId;

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
