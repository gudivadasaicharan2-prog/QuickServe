package com.quickserve.backend.service;

import com.quickserve.backend.dto.TableClaimRequest;
import com.quickserve.backend.dto.TableSessionResponse;

public interface TableSessionService {

    TableSessionResponse claimTable(TableClaimRequest request);

    TableSessionResponse getActiveSessionByToken(String token);

    void validateActiveSession(String token, String expectedTableNumber);

    void closeSessionForTable(String tableNumber);

    void closeSessionByToken(String token);
}
