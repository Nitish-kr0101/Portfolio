package com.niveshtrack.portfolio.scheduler;

import com.niveshtrack.portfolio.entity.SipInstruction;
import com.niveshtrack.portfolio.repository.SipInstructionRepository;
import com.niveshtrack.portfolio.service.MutualFundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Executes due SIP installments every day at 9:30 AM IST.
 *
 * <p>Finds all active SIP instructions whose {@code nextExecutionDate ≤ today}
 * and invokes the MutualFundService to execute each one.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SipExecutionScheduler {

    private final SipInstructionRepository sipInstructionRepository;
    private final MutualFundService mutualFundService;

    /**
     * Daily SIP execution at 9:30 AM IST.
     */
    @Scheduled(cron = "0 30 9 * * *", zone = "Asia/Kolkata")
    public void executeDueSips() {
        LocalDate today = LocalDate.now();
        List<SipInstruction> dueSips =
                sipInstructionRepository.findByActiveTrueAndNextExecutionDateLessThanEqual(today);

        if (dueSips.isEmpty()) {
            log.debug("No SIP installments due today ({})", today);
            return;
        }

        log.info("Executing {} SIP installments due on or before {}", dueSips.size(), today);

        int success = 0;
        int failed = 0;

        for (SipInstruction sip : dueSips) {
            try {
                mutualFundService.executeSIP(sip);
                success++;
                log.debug("SIP #{} executed: {} ₹{}", sip.getId(), sip.getSymbol(), sip.getAmount());
            } catch (Exception e) {
                failed++;
                log.error("SIP #{} failed for {} : {}", sip.getId(), sip.getSymbol(), e.getMessage());
                // Don't advance nextExecutionDate so it retries next day
            }
        }

        log.info("SIP execution complete: {} success, {} failed", success, failed);
    }
}
