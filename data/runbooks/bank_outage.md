# Bank Unavailable (E5003)

## Description
Bank unavailable occurs when the issuing bank or payment processor's services are completely down or experiencing severe degradation, preventing any payment processing.

## Common Causes
- Scheduled bank maintenance
- Bank system failures or outages
- Payment processor downtime
- Core banking system issues
- Third-party service provider outages
- Regulatory or compliance system failures

## Symptoms
- Payment status: `failed`
- Error code: `E5003`
- 100% failure rate for affected bank
- Bank API returning 5xx errors
- Connection refused errors

## Investigation Steps
1. Check bank's official status page
2. Verify bank API endpoint availability
3. Review bank's maintenance schedule
4. Check if other payment processors are affected
5. Contact bank technical support
6. Review bank service level agreement (SLA) status

## Evidence to Collect
- Bank API response codes and error messages
- Bank status page screenshots
- Maintenance notifications from bank
- Uptime monitoring data
- SLA breach documentation
- Communication with bank support

## Resolution Actions
### Immediate
- Route transactions to alternative banks/processors
- Display maintenance message to customers
- Pause payment attempts to affected bank
- Enable backup payment rails

### Short-term
- Escalate to bank support team
- Document SLA impact
- Review transaction routing rules
- Update customers on expected resolution time

### Long-term
- Implement multi-bank redundancy
- Review bank diversification strategy
- Add automated failover mechanisms
- Consider additional payment processor partnerships

## Customer Communication
**Template:**
"[Bank Name] is currently experiencing technical difficulties and is unable to process payments at this time. Please try using a different payment method or contact our support team for assistance."

## Escalation Criteria
- Primary payment bank completely unavailable
- SLA breach imminent or occurred
- No alternative payment options available
- Prolonged outage (>30 minutes)
- High-value transactions blocked

## Related Runbooks
- Issuer Timeout (E2012)
- Network Failure (E3011)
